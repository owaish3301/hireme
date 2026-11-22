import ServerError from "../../error/server.error.js";
import { healthCheckDB } from "../../utils/healthCheckDB.js";
import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/response.js";

export default async function HealthHandler(_req: Request, res: Response) {
  const result = await healthCheckDB();
  if (!result.ok) {
    throw new ServerError("Internal server error.");
  }
  return sendSuccess(res, {"status":"ok"}, "All systems are operational", 200  )
}
