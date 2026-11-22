import type { Response } from "express";

export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = "Success",
  statusCode: number = 200,
  meta?: Record<string, unknown>,
) {
  return res.status(statusCode).json({
    message,
    data,
    success: true,
    meta,
  });
}

export function sendError(
  res: Response,
  message: string = "Something went wrong",
  statusCode: number = 500,
  error : {code : string, details?:unknown}
) {
    return res.status(statusCode).json({
        message,
        success: false,
        data:null,
        meta:null,
        error,
    })
}
