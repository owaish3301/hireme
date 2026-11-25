import { Router } from "express";
import {
  handleRedirectToGoogle,
  handleGoogleCallback,
  handleRefreshToken,
  handleGetMe,
  handleLogout,
} from "./auth.handler.js";
import { requireAuth } from "./auth.middleware.js";

export const authRouter:Router = Router()

authRouter.get("/google", handleRedirectToGoogle);
authRouter.get("/google/callback", handleGoogleCallback);
authRouter.post("/refresh", handleRefreshToken);
authRouter.get("/me", requireAuth, handleGetMe);
authRouter.post("/logout", handleLogout);