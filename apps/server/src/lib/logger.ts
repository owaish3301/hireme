import pino from "pino";
import { config } from "../config/env.js";
import { pinoHttp } from "pino-http";

export const logger = pino({
  level: config.NODE_ENV === "production" ? "info" : "debug",

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

// query params whose values must never reach the logs (e.g. the OAuth
// authorization code on /api/auth/google/callback). all other params are kept.
const REDACTED_QUERY_PARAMS = ["code"];

export function redactUrl(url: string): string {
  const queryStart = url.indexOf("?");
  if (queryStart === -1) return url;

  const params = new URLSearchParams(url.slice(queryStart + 1));
  let changed = false;
  for (const name of REDACTED_QUERY_PARAMS) {
    if (params.has(name)) {
      params.set(name, "REDACTED");
      changed = true;
    }
  }
  if (!changed) return url;
  return `${url.slice(0, queryStart)}?${params.toString()}`;
}

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
        url: redactUrl(req.url),
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
