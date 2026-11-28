import ServerError from "../../error/server.error.js";
import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/response.js";
import type { HealthRepository } from "./health.repository.js";

export const makeHealthHandler = (repository: HealthRepository) => {
  return {
    healthHandler: async (req: Request, res: Response) => {
      const result = await repository.healthCheck();
      if (!result.ok) {
        // the client only sees a generic 500; the real cause goes to the logs
        req.log.error(
          { err: result.error },
          "health check: database unreachable",
        );
        throw new ServerError("Internal server error.");
      }
      return sendSuccess(
        res,
        { status: "ok" },
        "All systems are operational",
        200,
      );
    },
  };
};

export type HealthHandler = ReturnType<typeof makeHealthHandler>;
