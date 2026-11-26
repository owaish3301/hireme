import request from "supertest";
import express from "express";
import { it, vi } from "vitest";
import { makeHealthModule } from "./health.module.js";
import type { DB } from "../../prisma/db.js";
import { pinoApiLoggerConfig } from "../../lib/logger.js";
import ServerError from "../../error/server.error.js";
import { errors } from "../../error/constants.js";
import { GlobalErrorHandler } from "../globals/handler.js";

function makeTestApp(fakeDb: DB) {
  const app = express();
  app.use(pinoApiLoggerConfig);
  const healthRouter = makeHealthModule({ db: fakeDb });
  app.use("", healthRouter);
  app.use(GlobalErrorHandler);
  return app;
}

it("200 when db is up", async () => {
  const fakeDb = {
    raw: {
      sql: () => ({
        returnsRow: () => ({
          build: () => ({}),
        }),
      }),
    },
    query: vi.fn().mockResolvedValue(undefined),
  } as unknown as DB;
  const app = makeTestApp(fakeDb);
  await request(app)
    .get("/health")
    .expect(200)
    .expect({
      message: "All systems are operational",
      data: { status: "ok" },
      success: true,
    });
});

it("500 when db is down", async () => {
  const fakeDb = {
    raw: {
      sql: () => ({
        returnsRow: () => ({
          build: () => ({}),
        }),
      }),
    },
    query: vi.fn().mockRejectedValue(new ServerError("Internal server error.")),
  } as unknown as DB;
  const app = makeTestApp(fakeDb);
  await request(app)
    .get("/health")
    .expect(500)
    .expect({
      data: null,
      meta: null,
      message: "Internal server error.",
      success: false,
      error: { code: errors.INTERNAL_SERVER_ERROR },
    });
});
