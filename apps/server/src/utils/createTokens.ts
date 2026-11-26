import { randomBytes } from "node:crypto";

export function createRefreshToken() {
  return randomBytes(32).toString("base64url");
}

export function createStateToken() {
  return randomBytes(16).toString("hex");
}
