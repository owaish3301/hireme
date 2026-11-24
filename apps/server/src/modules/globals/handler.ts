import { errors } from "../../error/constants.js";
import AppError from "../../error/error.js"
import type { Response, Request, NextFunction } from "express";
import { sendError } from "../../utils/response.js";

export function GlobalErrorHandler(err:Error, req:Request, res:Response, next:NextFunction){
    const isKnownError = err instanceof AppError;
    if(isKnownError){
        req.log.error({err}, "an error occured");
        return sendError(res, err.message, err.statusCode, {code:err.code || errors.INTERNAL_SERVER_ERROR})
    }
    else{
        req.log.error({ err }, "Unhandled error");
        return sendError(res, "Something went wrong", 500, {
          code: errors.INTERNAL_SERVER_ERROR,
        });
    }
}