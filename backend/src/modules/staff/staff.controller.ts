import type { Request, Response } from "express";
import { Types } from "mongoose";
import { staffService } from "./staff.service";
import type { StaffListQuery } from "./staff.types";
import type { StaffRole } from "./staff.model";
import { asyncHandler } from "../../shared/utils/async-handler";
import { resolveAgencyId } from "../../shared/utils/agency-context";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { auditService } from "../../modules/audit/audit.service";
import { ForbiddenError } from "../../shared/errors/app-error";
import { agencySubscriptionService } from "../saas-billing/agency-subscription.service";
import { subscriptionPlanRepository } from "../saas-billing/subscription-plan.repository";

export class StaffController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const actorId = new Types.ObjectId(req.user!.sub);
    const { userId, role, permissions } = req.body;

    // Plan limit enforcement: staff count vs active subscription plan maxStaff.
    const subscription = await agencySubscriptionService.getByAgencyId(agencyId);
    if (subscription && (subscription.status === "active" || subscription.status === "trial")) {
      const now = new Date();
      const trialExpired =
        subscription.trialEndsAt && new Date(subscription.trialEndsAt) < now;
      const periodExpired = new Date(subscription.currentPeriodEnd) < now;
      if (!trialExpired && !periodExpired) {
        const plan = await subscriptionPlanRepository.findById(
          new Types.ObjectId(subscription.planId)
        );
        if (plan) {
          const current = await staffService.list(agencyId, { page: 1, limit: 1 });
          if (current.total >= plan.limits.maxStaff) {
            throw new ForbiddenError(
              `Staff limit reached (${plan.limits.maxStaff}). Upgrade your plan to add more staff.`
            );
          }
        }
      }
    }

    const staff = await staffService.create(agencyId, actorId, { userId, role, permissions });
    res.status(HTTP_STATUS.CREATED).json(success({ staff }, { message: "Staff member added successfully" }));
  });

  invite = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const actorId = new Types.ObjectId(req.user!.sub);
    const { email, role, permissions, commissionRate } = req.body;
    const result = await staffService.invite(agencyId, actorId, { email, role, permissions, commissionRate });
    res
      .status(HTTP_STATUS.CREATED)
      .json(
        success(
          { staff: result.staff, invitationToken: result.invitationToken },
          { message: "Staff invited successfully" }
        )
      );
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const staff = await staffService.getById(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ staff }));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const existing = await staffService.getById(req.params.id!, agencyId);
    const staff = await staffService.update(req.params.id!, agencyId, req.body);
    if (req.body.role && existing.role !== req.body.role) {
      await auditService.logStaffRoleChange(
        agencyId,
        new Types.ObjectId(req.user!.sub),
        new Types.ObjectId(req.params.id!),
        { role: existing.role },
        { role: req.body.role }
      );
    }
    res.status(HTTP_STATUS.OK).json(success({ staff }, { message: "Staff member updated successfully" }));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    await staffService.delete(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success(null, { message: "Staff member removed successfully" }));
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const result = await staffService.list(agencyId, req.query as StaffListQuery);
    res.status(HTTP_STATUS.OK).json(success({ staff: result }));
  });

  getByRole = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const role = req.params.role as StaffRole;
    const staff = await staffService.getByRole(agencyId, role);
    res.status(HTTP_STATUS.OK).json(success({ staff }));
  });

  getRoleCounts = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const counts = await staffService.countByRole(agencyId);
    res.status(HTTP_STATUS.OK).json(success({ counts }));
  });
}

export const staffController = new StaffController();