import type { DB } from "../../prisma/db.js";
import { makeAuthClient } from "./auth.google.js";
import { makeAuthHandler } from "./auth.handler.js";
import { makeAuthMiddleware } from "./auth.middleware.js";
import { makeAuthRepository } from "./auth.repository.js";
import { makeAuthRoute } from "./auth.route.js";
import { makeAuthService } from "./auth.service.js";

export const makeAuthModule = ({
  db,
  config,
}: {
  db: DB;
  config: {
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    BASE_API_URL: string;
    JWT_SECRET: string;
    FRONTEND_URL: string;
  };
}) => {
  const repository = makeAuthRepository(db);
  const authClient = makeAuthClient({
    GOOGLE_CLIENT_ID: config.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: config.GOOGLE_CLIENT_SECRET,
    BASE_API_URL: config.BASE_API_URL,
  });
  const service = makeAuthService({
    repository,
    googleAuthClient: authClient.googleAuthClient,
    GOOGLE_CLIENT_ID: config.GOOGLE_CLIENT_ID,
    JWT_SECRET: config.JWT_SECRET,
  });

  const handler = makeAuthHandler({
    service,
    FRONTEND_URL: config.FRONTEND_URL,
  });

  const middleware = makeAuthMiddleware({ JWT_SECRET: config.JWT_SECRET });

  const router = makeAuthRoute({ handler, middleware });

  return { router, middleware };
};
