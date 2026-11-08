import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/async-handler";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { AuthService } from "./auth.service";
import { signUpSchema, signInSchema } from "./auth.validation";

export const signUp = asyncHandler(async (req: Request, res: Response) => {
  const input = signUpSchema.parse(req.body);
  const result = await AuthService.signUp(input);

  res.status(HTTP_STATUS.CREATED).json(success({ ...result }));
});

export const signIn = asyncHandler(async (req: Request, res: Response) => {
  const input = signInSchema.parse(req.body);
  const result = await AuthService.signIn(input);

  res.status(HTTP_STATUS.OK).json(success({ ...result }));
});
