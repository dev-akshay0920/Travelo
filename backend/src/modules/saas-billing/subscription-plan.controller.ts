import type { Request, Response } from "express";
import { subscriptionPlanService } from "./subscription-plan.service";
import type { SubscriptionPlanListQuery } from "./subscription-plan.types";
import { asyncHandler } from "../../shared/utils/async-handler";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";

export class SubscriptionPlanController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const plan = await subscriptionPlanService.create(req.body);
    res.status(HTTP_STATUS.CREATED).json(success({ plan }, { message: "Subscription plan created successfully" }));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const plan = await subscriptionPlanService.getById(req.params.id!);
    res.status(HTTP_STATUS.OK).json(success({ plan }));
  });

  getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const plan = await subscriptionPlanService.getBySlug(req.params.slug!);
    res.status(HTTP_STATUS.OK).json(success({ plan }));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const plan = await subscriptionPlanService.update(req.params.id!, req.body);
    res.status(HTTP_STATUS.OK).json(success({ plan }, { message: "Subscription plan updated successfully" }));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await subscriptionPlanService.delete(req.params.id!);
    res.status(HTTP_STATUS.OK).json(success(null, { message: "Subscription plan deleted successfully" }));
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await subscriptionPlanService.list(req.query as SubscriptionPlanListQuery);
    res.status(HTTP_STATUS.OK).json(success({ plans: result }));
  });

  getActivePlans = asyncHandler(async (_req: Request, res: Response) => {
    const plans = await subscriptionPlanService.getActivePlans();
    res.status(HTTP_STATUS.OK).json(success({ plans }));
  });
}

export const subscriptionPlanController = new SubscriptionPlanController();