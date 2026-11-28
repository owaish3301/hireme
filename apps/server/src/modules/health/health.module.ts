import type { DB } from "../../prisma/db.js";
import { makeHealthHandler } from "./health.handler.js";
import { makeHealthRepository } from "./health.repository.js";
import { makeHealthRouter } from "./health.routes.js";

export const makeHealthModule = ({ db }: { db: DB }) => {
  const healthRepository = makeHealthRepository(db);
  const healthHandler = makeHealthHandler(healthRepository);
  const healthRouter = makeHealthRouter(healthHandler);
  return healthRouter;
};
