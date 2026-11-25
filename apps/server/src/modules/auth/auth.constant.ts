import type { CookieOptions } from "express";
import { config } from "../../config/env.js";

export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const ACCESS_TOKEN_TTL_SEC = 10 * 60; // 10 minutes 

// how long an already-rotated refresh token is tolerated (rejected, but
// without revoking the family) to absorb concurrent refreshes from tabs/retries
export const REFRESH_REUSE_GRACE_MS = 10 * 1000;

// JWT settings shared by sign (auth.service) and verify (auth.middleware)
export const JWT_ALGORITHM = "HS256" as const;
export const JWT_ISSUER = "hireme-api";
export const JWT_AUDIENCE = "hireme-client";

export const REFRESH_COOKIE_NAME = "refresh_token";

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: config.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/auth",
};

// short-lived cookies that carry the OAuth login attempt from /google to
// /google/callback. scoped to that path so they're never sent anywhere else.
export const OAUTH_COOKIES = {
  state: "oauth_state",
  nonce: "oauth_nonce",
  codeVerifier: "oauth_code_verifier",
} as const;

export const oauthCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: config.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/auth/google",
};
