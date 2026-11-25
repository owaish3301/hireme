import dotenv from "dotenv";
dotenv.config();

import { ConfigError } from "../error/config.error.js";

function requireEnv(name:string):string{
    const val = process.env[name];
    if(!val){
        throw new ConfigError(`missing ${name}`);
    }
    return val;
}

function stripTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function loadConfig() {
  return {
  PORT: (() => {
    const port = Number(requireEnv("PORT"));
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new ConfigError("invalid port number");
    }
    return port;
  })(),
  DSN: requireEnv("DATABASE_URL"),
  NODE_ENV: ((): "production" | "development" => {
    const level =
      process.env.NODE_ENV === "production" ? "production" : "development";
    if (level === "development") {
      console.warn("Development environment");
    }
    return level;
  })(),
  CORS_ORIGIN: (() => {
    if (process.env.NODE_ENV === "production" && !process.env.CORS_ORIGIN) {
      throw new ConfigError(
        "CORS_ORIGIN must be explicitly defined in production",
      );
    }
    const origins = (process.env.CORS_ORIGIN || "http://localhost:5173").split(
      ",",
    );
    return origins.map((item) => item.trim());
  })(),
  GOOGLE_CLIENT_ID: requireEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: requireEnv("GOOGLE_CLIENT_SECRET"),
  BASE_API_URL: stripTrailingSlash(requireEnv("BASE_API_URL")),
  FRONTEND_URL: stripTrailingSlash(requireEnv("FRONTEND_URL")),
  JWT_SECRET: (() => {
    const secret = requireEnv("JWT_SECRET");
    // HS256 needs a key at least as long as its 256-bit output to be safe
    if (Buffer.byteLength(secret, "utf8") < 32) {
      throw new ConfigError("JWT_SECRET must be at least 32 bytes");
    }
    return secret;
  })(),
};
}

function loadConfigOrExit(): ReturnType<typeof loadConfig> {
  try {
    return loadConfig();
  } catch (err) {
    if (err instanceof ConfigError) {
      console.error(`[config] ${err.message}. check your .env file`);
      process.exit(1);
    }
    throw err;
  }
}

export const config = loadConfigOrExit();
