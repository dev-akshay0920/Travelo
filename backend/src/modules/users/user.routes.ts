import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import { getMyProfile, updateMyProfile } from "./user.controller";
import { updateMyProfileSchema } from "./user.validation";

const router = Router();

router.use(authMiddleware);
router.get("/me", getMyProfile);
router.patch("/me", validate(updateMyProfileSchema), updateMyProfile);

export const userRouter = router;
