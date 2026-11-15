import { Request, Response } from "express";
import { Types } from "mongoose";
import { agencySubscriptionService } from "./agency-subscription.service";
import { asyncHandler } from "../../shared/utils/async-handler";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";

export class AgencySubscriptionController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const userId = new Types.ObjectId((req as any).user.sub);
    const subscription = await agencySubscriptionService.create(agencyId, userId, req.body);
    res.status(HTTP_STATUS.CREATED).json(success({ subscription }, { message: "Subscription created successfully" }));
  });

  getMySubscription = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const subscription = await agencySubscriptionService.getByAgencyId(agencyId);
    res.status(HTTP_STATUS.OK).json(success({ subscription }));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const subscription = await agencySubscriptionService.getById(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ subscription }));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const subscription = await agencySubscriptionService.update(agencyId, req.params.id!, req.body);
    res.status(HTTP_STATUS.OK).json(success({ subscription }, { message: "Subscription updated successfully" }));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    await agencySubscriptionService.delete(agencyId, req.params.id!);
    res.status(HTTP_STATUS.OK).json(success(null, { message: "Subscription cancelled successfully" }));
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const result = await agencySubscriptionService.list(agencyId, req.query as any);
    res.status(HTTP_STATUS.OK).json(success({ subscriptions: result }));
  });

  cancel = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const { cancelAtPeriodEnd } = req.body;
    const subscription = await agencySubscriptionService.cancel(agencyId, req.params.id!, cancelAtPeriodEnd !== false);
    res.status(HTTP_STATUS.OK).json(success({ subscription }, { message: "Subscription cancelled successfully" }));
  });

  reactivate = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const subscription = await agencySubscriptionService.reactivate(agencyId, req.params.id!);
    res.status(HTTP_STATUS.OK).json(success({ subscription }, { message: "Subscription reactivated successfully" }));
  });

  // Admin-only endpoints
  listAll = asyncHandler(async (_req: Request, res: Response) => {
    const result = await agencySubscriptionService.listAll({});
    res.status(HTTP_STATUS.OK).json(success({ subscriptions: result }));
  });

  getExpiringTrials = asyncHandler(async (req: Request, res: Response) => {
    const days = req.query.days ? parseInt(req.query.days as string) : 3;
    const subscriptions = await agencySubscriptionService.getExpiringTrials(days);
    res.status(HTTP_STATUS.OK).json(success({ subscriptions }));
  });

  getPastDue = asyncHandler(async (_req: Request, res: Response) => {
    const subscriptions = await agencySubscriptionService.getPastDueSubscriptions();
    res.status(HTTP_STATUS.OK).json(success({ subscriptions }));
  });

  getUpcomingRenewals = asyncHandler(async (req: Request, res: Response) => {
    const days = req.query.days ? parseInt(req.query.days as string) : 7;
    const subscriptions = await agencySubscriptionService.getUpcomingRenewals(days);
    res.status(HTTP_STATUS.OK).json(success({ subscriptions }));
  });

  getStatusCounts = asyncHandler(async (_req: Request, res: Response) => {
    const counts = await agencySubscriptionService.getStatusCounts();
    res.status(HTTP_STATUS.OK).json(success({ counts }));
  });

  recordPayment = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const { amount, method, reference } = req.body;
    const subscription = await agencySubscriptionService.recordPayment(agencyId, req.params.id!, amount, method, reference);
    res.status(HTTP_STATUS.OK).json(success({ subscription }, { message: "Payment recorded successfully" }));
  });
}

export const agencySubscriptionController = new AgencySubscriptionController();