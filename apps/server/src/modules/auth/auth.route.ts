import { Router } from "express";
import type { AuthHandler } from "./auth.handler.js";
import type { AuthMiddleware } from "./auth.middleware.js";

export const makeAuthRoute = ({
  handler,
  middleware,
}: {
  handler: AuthHandler;
  middleware: AuthMiddleware;
}) => {
  const authRouter: Router = Router();

  authRouter.get("/google", handler.handleRedirectToGoogle);
  authRouter.get("/google/callback", handler.handleGoogleCallback);
  authRouter.post("/refresh", handler.handleRefreshToken);
  authRouter.get("/me", middleware.requireAuth, handler.handleGetMe);
  authRouter.post("/logout", handler.handleLogout);
  return authRouter;
};
