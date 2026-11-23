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

export const config = {
  PORT: (() => {
    const port = Number(requireEnv("PORT"));
    if (port < 1 || port > 65535) {
      throw new ConfigError("invalid port number");
    }
    return port;
  })(),
  DSN: requireEnv("DATABASE_URL"),
  NODE_ENV: (() => {
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
  BASE_API_URL: (() => {
    const url = requireEnv("BASE_API_URL");
    if (url.endsWith("/")) {
      return url.substring(0, url.length - 1);
    }
    return url;
  })(),
  FRONTEND_URL : requireEnv("FRONTEND_URL"),
  JWT_SECRET : requireEnv("JWT_SECRET"),
}; 