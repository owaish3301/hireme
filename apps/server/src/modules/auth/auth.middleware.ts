import type { Request, Response, NextFunction } from "express";
import { UnauthenticatedError } from "../../error/auth.error.js";
import jwt from "jsonwebtoken";
import { JWT_ALGORITHM, JWT_AUDIENCE, JWT_ISSUER } from "./auth.constant.js";

export const makeAuthMiddleware = ({ JWT_SECRET }: { JWT_SECRET: string }) => {
  return {
    requireAuth: (req: Request, _res: Response, next: NextFunction) => {
      const header = req.headers.authorization;
      const [scheme, token] = header?.split(" ") ?? [];
      if (scheme !== "Bearer" || !token) {
        throw new UnauthenticatedError();
      }
      let payload;
      try {
        payload = jwt.verify(token, JWT_SECRET, {
          algorithms: [JWT_ALGORITHM],
          issuer: JWT_ISSUER,
          audience: JWT_AUDIENCE,
        });
      } catch {
        throw new UnauthenticatedError(); // only token problems land here
      }
      if (typeof payload === "string" || typeof payload.sub !== "string") {
        throw new UnauthenticatedError();
      }
      req.userId = payload.sub;
      next();
    },
  };
};

export type AuthMiddleware = ReturnType<typeof makeAuthMiddleware>;
