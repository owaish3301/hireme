import type { DB } from "../../prisma/db.js";
import { makeHealthHandlers } from "./health.handler.js";
import { makeHealthRepository } from "./health.repository.js";
import { makeHealthRouter } from "./health.routes.js";

export const makeHealthModule = ({ db }: { db: DB }) => {
  const healthRepository = makeHealthRepository(db);
  const healthHandlers = makeHealthHandlers(healthRepository);
  const healthRouter = makeHealthRouter(healthHandlers);
  return healthRouter;
};
