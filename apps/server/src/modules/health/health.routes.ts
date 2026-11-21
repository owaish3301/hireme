import { Router } from "express";
import HealthHandler from "./health.handler.js";

export const healthRouter:Router = Router();

healthRouter.get("/health", HealthHandler);