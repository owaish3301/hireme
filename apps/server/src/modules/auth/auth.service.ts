import { googleAuthClient } from "./auth.google.js";
import { createHash, randomBytes } from "node:crypto";
import { config } from "../../config/env.js";
import { createNewSession, createNewUser } from "./auth.repository.js";
import { AuthError } from "../../error/auth.error.js";

export const redirectToGoogleService = () => {
  const state = randomBytes(16).toString("hex");
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

  const refreshToken = randomBytes(32).toString("base64url");
  const refreshTokenHash = createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await createNewSession({ userId: user.id, refreshTokenHash });

  return { refreshToken, isNewUser:user.isOnboarded};
};
