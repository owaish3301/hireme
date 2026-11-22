import pino from "pino";
import { config } from "../config/env.js";
import { pinoHttp } from "pino-http";

export const logger = pino({
  level: config.NODE_ENV==="production"?"info":"debug",

  transport:
    config.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        }
      : undefined,
});



export const pinoApiLoggerConfig = pinoHttp({
  logger,

  customLogLevel(_req, res, err) {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        remoteAddress: req.remoteAddress,
      };
    },

    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});
