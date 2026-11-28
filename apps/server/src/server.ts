import express from "express";
import { config } from "./config/env.js";
import { Router } from "express";
import {
  GlobalErrorHandler,
  NotFoundHandler,
} from "./modules/globals/handler.js";
import helmet from "helmet";
import cors from "cors";
import { logger, pinoApiLoggerConfig } from "./lib/logger.js";
import { db } from "./prisma/db.js";
import { corsOptions } from "./modules/globals/corsConfig.js";
import cookieParser from "cookie-parser";
import { makeHealthModule } from "./modules/health/health.module.js";
import { makeAuthModule } from "./modules/auth/auth.module.js";

const app = express();

app.use(pinoApiLoggerConfig);
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

const apiRouter = Router();
apiRouter.use("", makeHealthModule({ db }));
const auth = makeAuthModule({ db, config });
apiRouter.use("/auth", auth.router);

app.use("/api", apiRouter);

// must come after all routes: only reached when nothing above matched
app.use(NotFoundHandler);
app.use(GlobalErrorHandler);

export const server = app.listen(config.PORT, () => {
  logger.info(`Server listening on port ${config.PORT}`);
});

// if graceful shutdown hasn't finished by then, give up and exit anyway
const SHUTDOWN_TIMEOUT_MS = 10_000;
let shuttingDown = false;

const shutdown = async (reason: string, exitCode: number) => {
  if (shuttingDown) return; // e.g. Ctrl+C pressed twice
  shuttingDown = true;
  logger.info({ reason }, "shutting down");

  const forceExit = setTimeout(() => {
    logger.error("graceful shutdown timed out, forcing exit");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExit.unref(); // don't keep the process alive just for this timer

  try {
    // stop accepting new connections; resolves once in-flight requests finish
    const closed = new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
    // drop idle keep-alive sockets now so close() doesn't wait on them
    server.closeIdleConnections();
    await closed;
    await db.close();
    logger.info("shutdown complete");
    process.exit(exitCode);
  } catch (err) {
    logger.error({ err }, "error during shutdown");
    process.exit(1);
  }
};

process.on("SIGTERM", () => void shutdown("SIGTERM", 0));
process.on("SIGINT", () => void shutdown("SIGINT", 0));

// after one of these the process is in an unknown state: log and exit
process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "unhandled promise rejection");
  void shutdown("unhandledRejection", 1);
});
process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "uncaught exception");
  void shutdown("uncaughtException", 1);
});
