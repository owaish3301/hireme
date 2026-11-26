import { errors } from "../../error/constants.js";
import AppError from "../../error/error.js";
import type { Response, Request, NextFunction } from "express";
import { sendError } from "../../utils/response.js";

type ClientHttpError = Error & { status: number; expose: true; type?: string };

// http-errors (used by body-parser) mark errors safe to show the client with
// `expose: true`; those are always 4xx
function isClientHttpError(err: unknown): err is ClientHttpError {
  if (typeof err !== "object" || err === null) return false;
  const e = err as { status?: unknown; expose?: unknown };
  return (
    typeof e.status === "number" &&
    e.status >= 400 &&
    e.status < 500 &&
    e.expose === true
  );
}

export function NotFoundHandler(req: Request, res: Response) {
  return sendError(res, `route ${req.method} ${req.path} not found`, 404, {
    code: errors.NOT_FOUND,
  });
}

export function GlobalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const isKnownError = err instanceof AppError;
  if (isKnownError) {
    if (err.isOperational) {
      req.log.warn({ err }, "an error occured");
    } else {
      req.log.error({ err }, "an error occured");
    }
    return sendError(res, err.message, err.statusCode, {
      code: err.code || errors.INTERNAL_SERVER_ERROR,
    });
  } else if (isClientHttpError(err)) {
    // errors from body-parser / other http-errors based middleware,
    // e.g. malformed JSON (400) or a body over the size limit (413)
    req.log.warn({ err }, "bad request");
    const message =
      err.type === "entity.parse.failed" ? "malformed JSON body" : err.message;
    return sendError(res, message, err.status, { code: errors.BAD_REQUEST });
  } else {
    req.log.error({ err }, "Unhandled error");
    return sendError(res, "Something went wrong", 500, {
      code: errors.INTERNAL_SERVER_ERROR,
    });
  }
}
