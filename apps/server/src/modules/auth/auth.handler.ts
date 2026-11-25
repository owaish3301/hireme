import { Request, Response } from "express";
import {
  logoutService,
  redirectToGoogleService,
  refreshTokenService,
  signupOrSignInService,
} from "./auth.service.js";
import { config } from "../../config/env.js";
import {
  OAUTH_COOKIES,
  oauthCookieOptions,
  REFRESH_COOKIE_NAME,
  REFRESH_TOKEN_TTL_MS,
  refreshCookieOptions,
} from "./auth.constant.js";
import { UnauthenticatedError } from "../../error/auth.error.js";
import { sendSuccess } from "../../utils/response.js";
import { getMe } from "./auth.repository.js";
import { NotFoundError } from "../../error/client.error.js";

const OAUTH_COOKIE_MAX_AGE_MS = 10 * 60 * 1000;

const clearOAuthCookies = (res: Response) => {
  for (const name of Object.values(OAUTH_COOKIES)) {
    res.clearCookie(name, oauthCookieOptions);
  }
};

export const handleRedirectToGoogle = async (_req: Request, res: Response) => {
  const { url, state, nonce, codeVerifier } = await redirectToGoogleService();
  const opts = { ...oauthCookieOptions, maxAge: OAUTH_COOKIE_MAX_AGE_MS };
  res
    .cookie(OAUTH_COOKIES.state, state, opts)
    .cookie(OAUTH_COOKIES.nonce, nonce, opts)
    .cookie(OAUTH_COOKIES.codeVerifier, codeVerifier, opts)
    .redirect(url);
};

export const handleGoogleCallback = async (req: Request, res: Response) => {
  const { code, state } = req.query;

  if (
    typeof code !== "string" ||
    !code ||
    typeof state !== "string" ||
    !state
  ) {
    return res.redirect(`${config.FRONTEND_URL}/login?error=login_failed`);
  }

  const stateCookie: unknown = req.cookies?.[OAUTH_COOKIES.state];
  const nonce: unknown = req.cookies?.[OAUTH_COOKIES.nonce];
  const codeVerifier: unknown = req.cookies?.[OAUTH_COOKIES.codeVerifier];
  // one-time use: clear all of them whatever happens next
  clearOAuthCookies(res);
  if (
    typeof stateCookie !== "string" ||
    !stateCookie ||
    stateCookie !== state ||
    typeof nonce !== "string" ||
    !nonce ||
    typeof codeVerifier !== "string" ||
    !codeVerifier
  ) {
    return res.redirect(`${config.FRONTEND_URL}/login?error=login_failed`);
  }

  try {
    const { refreshToken, isOnboarded } = await signupOrSignInService({
      code,
      codeVerifier,
      nonce,
    });
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      maxAge: REFRESH_TOKEN_TTL_MS,
      ...refreshCookieOptions
    });

    if (!isOnboarded) {
      return res.redirect(`${config.FRONTEND_URL}/onboard`);
    } else {
      return res.redirect(`${config.FRONTEND_URL}/home`);
    }
  } catch (e) {
    req.log.error({ err: e }, "google signin failed");
    return res.redirect(`${config.FRONTEND_URL}/login?error=login_failed`);
  }
};

// TODO: cap the session family's total lifetime. right now every rotation
// extends it by 7 days, so a family can live forever if it keeps refreshing.
// a family should die a fixed number of days after the original login.
export const handleRefreshToken = async (req: Request, res: Response) => {
  const { refresh_token } = req.cookies;
  if (!refresh_token || typeof refresh_token !== "string") {
    throw new UnauthenticatedError();
  }

  const { newRefreshToken, accessToken } =
    await refreshTokenService(refresh_token);
  res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, {
    maxAge: REFRESH_TOKEN_TTL_MS,
    ...refreshCookieOptions,
  });
  return sendSuccess(
    res,
    {
      accessToken,
    },
  );
};

export const handleGetMe = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    throw new UnauthenticatedError();
  }
  const user = await getMe(userId);

  if (!user) {
    throw new NotFoundError("user not found");
  }

  sendSuccess(res, {
    user,
  });
};

export const handleLogout = async (req:Request, res:Response) => {
  const refreshToken:unknown = req.cookies?.refresh_token;
  if(!refreshToken || typeof(refreshToken)!=="string"){
    throw new UnauthenticatedError();
  }

  await logoutService(refreshToken);

  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
  return sendSuccess(res,{});
}