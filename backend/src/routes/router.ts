import { Router } from "express";
import { asyncHandler } from "../shared/utils/async-handler";
import { success } from "../shared/responses/api-response";
import { API_PREFIX, HEALTH_PATH } from "../config/app";
import mongoose from "mongoose";
import { apiV1Router } from "./index";

const router = Router();

router.get(
  HEALTH_PATH,
  asyncHandler(async (_req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbHealthy = dbState === 1; // 1 = connected

    const health = {
      status: dbHealthy ? "ok" : "degraded",
      uptime: process.uptime(),
      database: {
        connected: dbHealthy,
        readyState: dbState,
      },
    };

    res.status(dbHealthy ? 200 : 503).json(success(health));
  })
);

router.use(API_PREFIX, apiV1Router);

export const routes: Router = router;
