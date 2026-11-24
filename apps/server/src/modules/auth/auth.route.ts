import { Router } from "express";
import {
  handleRedirectToGoogle,
  handleGoogleCallback,
  handleRefreshToken,
} from "./auth.handler.js";

export const authRouter:Router = Router()

authRouter.get("/google", handleRedirectToGoogle);
authRouter.get("/google/callback", handleGoogleCallback);
authRouter.post("/refresh", handleRefreshToken);