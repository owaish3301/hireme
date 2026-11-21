import { errors } from "../../error/constants.js";
import AppError from "../../error/error.js"
import type { Response, Request, NextFunction } from "express";

export function GlobalErrorHandler(err:Error, req:Request, res:Response, next:NextFunction){
    const isKnownError = err instanceof AppError;
    if(isKnownError){
        return res.status(err.statusCode || 500).json({message:err.message, code:err.code})
    }
    else{
        return res.status(500).json({message:"Internal server error", code:errors.INTERNAL_SERVER_ERROR})
    }
}