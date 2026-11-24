import { Request, Response } from "express";
import {
  redirectToGoogleService,
  refreshTokenService,
  signupOrSignInService,
} from "./auth.service.js";
import { config } from "../../config/env.js";
import { REFRESH_TOKEN_TTL_MS } from "./auth.constant.js";
import { UnauthenticatedError } from "../../error/auth.error.js";
import { sendSuccess } from "../../utils/response.js";
import { getMe } from "./auth.repository.js";
import { NotFoundError } from "../../error/client.error.js";

export const handleRedirectToGoogle = (_req: Request, res: Response) => {
  const { url, state } = redirectToGoogleService();
  res
    .cookie("state", state, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
    })
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

  const stateCookie: unknown = req.cookies?.state;
  res.clearCookie("state");
  if (
    typeof stateCookie !== "string" ||
    !stateCookie ||
    stateCookie !== state
  ) {
    return res.redirect(`${config.FRONTEND_URL}/login?error=login_failed`);
  }

  try {
    const { refreshToken, isOnboarded } = await signupOrSignInService(code);
    res.cookie("refresh_token", refreshToken, {
      maxAge: REFRESH_TOKEN_TTL_MS,
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
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
  res.cookie("refresh_token", newRefreshToken, {
    maxAge: REFRESH_TOKEN_TTL_MS,
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
  });
  return sendSuccess(
    res,
    {
      accessToken,
    },
    "auth successful",
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
