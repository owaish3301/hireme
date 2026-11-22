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

const port = Number(requireEnv("PORT"))

export const config = {
  PORT: (() => {
    if (port < 1 || port > 65535) {
      throw new ConfigError("invalid port number");
    }
    return port;
  })(),
  DSN: requireEnv("DATABASE_URL"),
  NODE_ENV: (()=>{
    const level = process.env.NODE_ENV === "production" ? "production": "development";
    if(level==="development"){
      console.warn("Development environment")
    }
    return level;
  })(),
  CORS_ORIGIN: (() => {
    if (process.env.NODE_ENV === "production" && !process.env.CORS_ORIGIN) {
      throw new ConfigError(
        "CORS_ORIGIN must be explicitly defined in production",
      );
    }
    const origins = (process.env.CORS_ORIGIN || "http://localhost:5173").split(",");
    return origins.map(item => item.trim());
  })()
}; 