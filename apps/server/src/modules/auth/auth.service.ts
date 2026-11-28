import { CodeChallengeMethod, type OAuth2Client } from "google-auth-library";
import { createHash } from "node:crypto";
import { AuthError } from "../../error/auth.error.js";
import { createStateToken, createRefreshToken } from "./createTokens.js";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_TTL_SEC,
  JWT_ALGORITHM,
  JWT_AUDIENCE,
  JWT_ISSUER,
} from "./auth.constant.js";
import type { AuthRepository } from "./auth.repository.js";

const hashRefreshToken = (refreshToken: string) => {
  return createHash("sha256").update(refreshToken).digest("hex");
};

export const makeAuthService = ({
  repository,
  googleAuthClient,
  GOOGLE_CLIENT_ID,
  JWT_SECRET,
}: {
  repository: AuthRepository;
  googleAuthClient: OAuth2Client;
  GOOGLE_CLIENT_ID: string;
  JWT_SECRET: string;
}) => {
  return {
    redirectToGoogle: async () => {
      const state = createStateToken();
      // nonce: google copies it into the signed id token, so we can check that
      // the token we get back was issued for *this* login attempt
      const nonce = createStateToken();
      // PKCE: google only gets the hash (challenge); the verifier stays with us
      // and is required to exchange the code, so a leaked code is useless alone
      const { codeVerifier, codeChallenge } =
        await googleAuthClient.generateCodeVerifierAsync();

      const url = googleAuthClient.generateAuthUrl({
        scope: ["openid", "email", "profile"],
        state,
        nonce,
        code_challenge: codeChallenge,
        code_challenge_method: CodeChallengeMethod.S256,
      });

      return { url, state, nonce, codeVerifier };
    },

    signupOrSignIn: async ({
      code,
      codeVerifier,
      nonce,
    }: {
      code: string;
      codeVerifier: string;
      nonce: string;
    }) => {
      const { tokens } = await googleAuthClient.getToken({
        code,
        codeVerifier,
      });

      if (!tokens.id_token) {
        throw new AuthError("token response missing token_id", {});
      }

      const ticket = await googleAuthClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new AuthError("id token verified but payload is empty", {});
      }

      if (payload.nonce !== nonce) {
        throw new AuthError("id token nonce mismatch", {});
      }

      if (!payload.email || payload.email_verified !== true) {
        throw new AuthError("google email not verified", {});
      }

      const user = await repository.createNewUser(payload);

      const refreshToken = createRefreshToken();
      const refreshTokenHash = hashRefreshToken(refreshToken);

      await repository.createNewSession({
        userId: user.id,
        refreshTokenHash,
      });

      return { refreshToken, isOnboarded: user.isOnboarded };
    },

    refreshToken: async (refreshToken: string) => {
      const refreshTokenHash = hashRefreshToken(refreshToken);

      const newRefreshToken = createRefreshToken();
      const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

      const userId = await repository.rotateSession({
        refreshTokenHash,
        newRefreshTokenHash,
      });

      const accessToken = jwt.sign({ sub: userId }, JWT_SECRET, {
        algorithm: JWT_ALGORITHM,
        expiresIn: ACCESS_TOKEN_TTL_SEC,
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      });

      return { newRefreshToken, accessToken };
    },
    logout: async (refreshToken: string) => {
      const refreshTokenHash = hashRefreshToken(refreshToken);

      await repository.revokeSessions(refreshTokenHash);

      return;
    },

    getMe: async (userId: string) => {
      return await repository.getMe(userId);
    },
  };
};

export type AuthService = ReturnType<typeof makeAuthService>;
