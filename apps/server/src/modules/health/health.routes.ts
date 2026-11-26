import { Router } from "express";
import type { HealthHandlers } from "./health.handler.js";

export const makeHealthRouter = (healthHandlers: HealthHandlers) => {
  const healthRouter: Router = Router();
  healthRouter.get("/health", healthHandlers.healthHandler);
  return healthRouter;
};
