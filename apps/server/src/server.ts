import express from "express";
import { config } from "./config/env.js";
import { Router } from "express";
import { healthRouter } from "./modules/health/health.routes.js";
import { GlobalErrorHandler } from "./modules/globals/handler.js";
import helmet from "helmet";
import cors from "cors";
import { pinoApiLoggerConfig } from "./lib/logger.js";
import { corsOptions } from "./utils/corsConfig.js";

const app = express();

app.use(pinoApiLoggerConfig);
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());

const apiRoter = Router();
apiRoter.use("", healthRouter);

app.use("/api", apiRoter);

app.use(GlobalErrorHandler);

export const server = app.listen(config.PORT, () => {
  console.log(`Server listening on port ${config.PORT}`);
});

const shutdown = async (signal:string) => {
  server.close(async ()=>{
    process.exit(0);
  })
}

process.on("SIGTERM", ()=>{shutdown("SIGTERM")});
process.on("SIGINT", ()=>{shutdown("SIGINT")});