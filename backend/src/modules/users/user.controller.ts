import type { Request, Response } from "express";
import { UnauthorizedError } from "../../shared/errors/app-error";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { success } from "../../shared/responses/api-response";
import { asyncHandler } from "../../shared/utils/async-handler";
import { UserService } from "./user.service";
import { updateMyProfileSchema } from "./user.validation";

function authenticatedUserId(req: Request): string {
  if (!req.user) throw new UnauthorizedError();
  return req.user.sub;
}

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await UserService.getMyProfile(authenticatedUserId(req));
  res.status(HTTP_STATUS.OK).json(success({ profile }));
});

export const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const input = updateMyProfileSchema.parse(req.body);
  const profile = await UserService.updateMyProfile(authenticatedUserId(req), input);
  res.status(HTTP_STATUS.OK).json(success({ profile }));
});
