import { Router } from "express";
import { asyncHandler } from "../shared/utils/async-handler";
import { success } from "../shared/responses/api-response";
import { API_PREFIX, HEALTH_PATH } from "../config/app";
import { apiV1Router } from "./index";

const router = Router();

router.get(
  HEALTH_PATH,
  asyncHandler((_req, res) => {
    res
      .status(200)
      .json(success({ status: "ok" }, { uptime: process.uptime() }));
  })
);

router.use(API_PREFIX, apiV1Router);

export const routes: Router = router;