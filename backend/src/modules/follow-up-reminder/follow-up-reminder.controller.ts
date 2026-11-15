import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/async-handler";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { FollowUpReminderService } from "./follow-up-reminder.service";
import {
  createFollowUpReminderSchema,
  listFollowUpRemindersQuerySchema,
  updateFollowUpReminderSchema,
} from "./follow-up-reminder.validation";

function authenticatedUserId(req: Request): string {
  if (!req.user) throw new Error("UNAUTHORIZED");
  return req.user.sub;
}

export const createFollowUpReminder = asyncHandler(async (req: Request, res: Response) => {
  const input = createFollowUpReminderSchema.parse(req.body);
  const reminder = await FollowUpReminderService.create(authenticatedUserId(req), input);
  res.status(HTTP_STATUS.CREATED).json(success({ reminder }));
});

export const listFollowUpReminders = asyncHandler(async (req: Request, res: Response) => {
  const filters = listFollowUpRemindersQuerySchema.parse(req.query);
  const result = await FollowUpReminderService.list(authenticatedUserId(req), filters);
  res.status(HTTP_STATUS.OK).json(success(result));
});

export const getDueFollowUpReminders = asyncHandler(async (req: Request, res: Response) => {
  const reminders = await FollowUpReminderService.getDue(authenticatedUserId(req));
  res.status(HTTP_STATUS.OK).json(success({ reminders }));
});

export const updateFollowUpReminder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) throw new Error("Reminder ID is required.");
  const input = updateFollowUpReminderSchema.parse(req.body);
  const reminder = await FollowUpReminderService.update(authenticatedUserId(req), id, input);
  res.status(HTTP_STATUS.OK).json(success({ reminder }));
});

export const deleteFollowUpReminder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) throw new Error("Reminder ID is required.");
  await FollowUpReminderService.delete(authenticatedUserId(req), id);
  res.status(HTTP_STATUS.OK).json(success({ message: "Follow-up reminder deleted." }));
});