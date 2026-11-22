import { CorsOptions } from "cors";
import { config } from "../config/env.js";

export const corsOptions:CorsOptions = {
    origin : config.CORS_ORIGIN,
    credentials : true,

}