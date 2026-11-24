import { googleAuthClient } from "./auth.google.js";
import { createHash, randomBytes } from "node:crypto";
import { config } from "../../config/env.js";
import {
  createNewSession,
  createNewUser,
  rotateSession,
} from "./auth.repository.js";
import { AuthError } from "../../error/auth.error.js";
import {
  createStateToken,
  createRefreshToken,
} from "../../utils/createTokens.js";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_TTL_SEC } from "./auth.constant.js";

const hashRefreshToken = (refreshToken: string) => {
  return createHash("sha256").update(refreshToken).digest("hex");
};

export const redirectToGoogleService = () => {
  const state = createStateToken();
  const url = googleAuthClient.generateAuthUrl({
    scope: ["openid", "email", "profile"],
    state,
  });

  return { url, state };
};

export const signupOrSignInService = async (code: string) => {
  const { tokens } = await googleAuthClient.getToken(code);

  if (!tokens.id_token) {
    throw new AuthError("token response missing token_id");
  }

  const ticket = await googleAuthClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: config.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new AuthError("id token verified but payload is empty");
  }

  const user = await createNewUser(payload);

  const refreshToken = createRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);

  await createNewSession({ userId: user.id, refreshTokenHash });

  return { refreshToken, isOnboarded: user.isOnboarded };
};

export const refreshTokenService = async (refreshToken: string) => {
  const refreshTokenHash = hashRefreshToken(refreshToken);

  const newRefreshToken = createRefreshToken();
  const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

  const userId = await rotateSession(refreshTokenHash, newRefreshTokenHash);

  const accessToken = jwt.sign({ sub: userId }, config.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL_SEC,
  });

  return { newRefreshToken, accessToken };
};
