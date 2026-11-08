import { Router } from "express";
import { validate } from "../../middleware/validation.middleware";
import { signUp, signIn } from "./auth.controller";
import { signUpSchema, signInSchema } from "./auth.validation";

const router = Router();

router.post("/signup", validate(signUpSchema), signUp);
router.post("/signin", validate(signInSchema), signIn);

export const authRouter = router;
