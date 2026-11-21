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
  PORT: (()=>{
    if(port<1 || port>65535){
        throw new ConfigError("invalid port number");
    }
    return port;
  })(),
  DSN: requireEnv("DATABASE_URL"),
}; 