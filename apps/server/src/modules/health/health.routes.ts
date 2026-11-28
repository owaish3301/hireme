import { Router } from "express";
import type { HealthHandler } from "./health.handler.js";

export const makeHealthRouter = (healthHandler: HealthHandler) => {
  const healthRouter: Router = Router();
  healthRouter.get("/health", healthHandler.healthHandler);
  return healthRouter;
};
