import { Request, Response } from "express";
import {
  redirectToGoogleService,
  signupOrSignInService,
} from "./auth.service.js";
import { config } from "../../config/env.js";
import { REFRESH_TOKEN_TTL_MS } from "./auth.constant.js";

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
    return res.redirect(
      `${config.FRONTEND_URL}/login?error=login_failed`,
    );
  }

  try{
    const { refreshToken, isNewUser } = await signupOrSignInService(code);
    res.cookie("refresh_token", refreshToken, {
      maxAge: REFRESH_TOKEN_TTL_MS,
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
    });

    if (isNewUser) {
      return res.redirect(`${config.FRONTEND_URL}/onboard`);
    } else {
      return res.redirect(`${config.FRONTEND_URL}/home`);
    }
  } catch(e){
    req.log.error({err:e}, "google signin failed");
    return res.redirect(`${config.FRONTEND_URL}/login?error=login_failed`);
  }
};
