import ServerError from "../../error/server.error.js";
import { healthCheckDB } from "../../utils/healthCheckDB.js";
import type { Request, Response } from "express";

export default async function HealthHandler(_req: Request, res: Response) {
  const result = await healthCheckDB();
  if (!result.ok) {
    throw new ServerError("Internal server error.");
  }
  res.json({ status: "ok" });
}
