import express, { type Application } from "express";
import helmet from "helmet";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { env } from "./config/env";
import { requestIdMiddleware } from "./shared/types/request-id";
import { generalRateLimiter } from "./middleware/rate-limit.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import { notFoundMiddleware } from "./middleware/not-found.middleware";
import { routes } from "./routes/router";

export const createApp = (): Application => {
  const app = express();

  app.disable("x-powered-by");

  app.use(helmet());

  app.use(requestIdMiddleware);

  app.use((req, _res, next) => {
    const headerVal = req.headers["x-request-id"];
    const fromHeader = Array.isArray(headerVal) ? headerVal[0] : headerVal;
    const reqId = fromHeader ?? randomUUID();
    _res.setHeader("x-request-id", reqId);
    next();
  });

  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    })
  );

  app.use(express.json({ limit: env.BODY_JSON_LIMIT }));
  app.use(express.urlencoded({ extended: true, limit: env.BODY_JSON_LIMIT }));

  app.use(generalRateLimiter);

  app.use(routes);

  app.use(notFoundMiddleware);

  app.use(errorMiddleware);

  return app;
};