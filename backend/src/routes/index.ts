import { Router } from "express";
import { asyncHandler } from "../shared/utils/async-handler";
import { success } from "../shared/responses/api-response";

import { agencyRouter } from "../modules/agencies/agency.routes";
import { authRouter } from "../modules/auth/auth.routes";
import { packageRouter } from "../modules/packages/package.routes";
import { publicRouter } from "./public.routes";

const router = Router();

router.get(
  "/",
  asyncHandler((_req, res) => {
    res.status(200).json(
      success(
        {
          name: "Travora API",
          version: "v1",
          stage: "foundation",
          status: "running",
        },
        { timestamp: new Date().toISOString() }
      )
    );
  })
);

router.use("/auth", authRouter);
router.use("/agencies", agencyRouter);
router.use("/packages", packageRouter);
router.use("/public", publicRouter);

export const apiV1Router: Router = router;
