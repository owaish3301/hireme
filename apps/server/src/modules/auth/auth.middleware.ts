import { Request, Response, NextFunction } from "express";
import { UnauthenticatedError } from "../../error/auth.error.js";
import jwt from "jsonwebtoken";
import { config } from "../../config/env.js";

export const requireAuth = (req:Request, res:Response, next:NextFunction) => {
    const accessToken = req.headers.authorization;
    if(!accessToken){
        throw new UnauthenticatedError();
    }

    try{
        const {sub} = jwt.verify(accessToken, config.JWT_SECRET);
        if(typeof(sub)!=="string"){
            throw new UnauthenticatedError();
        }
        req.userId = sub
        next()
    } catch(e){
        throw new UnauthenticatedError();
    }
}