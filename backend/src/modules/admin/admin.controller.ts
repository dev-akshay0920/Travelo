import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/async-handler";
import { resolveAgencyId } from "../../shared/utils/agency-context";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { adminService } from "./admin.service";
import type { AgencyListQuery, UserListQuery } from "./admin.types";
import type { PayoutListQuery } from "./payout.repository";

export class AdminController {
  listAgencies = asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.listAgencies(req.query as AgencyListQuery);
    res
      .status(HTTP_STATUS.OK)
      .json(success({ agencies: result.items, meta: result.meta }));
  });

  getAgency = asyncHandler(async (req: Request, res: Response) => {
    const agency = await adminService.getAgency(req.params.id!);
    if (!agency) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Agency not found." },
      });
      return;
    }
    res.status(HTTP_STATUS.OK).json(success({ agency }));
  });

  updateAgencyStatus = asyncHandler(async (req: Request, res: Response) => {
    const agency = await adminService.updateAgencyStatus(req.params.id!, req.body);
    if (!agency) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Agency not found." },
      });
      return;
    }
    res
      .status(HTTP_STATUS.OK)
      .json(success({ agency }, { message: "Agency status updated." }));
  });

  listUsers = asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.listUsers(req.query as UserListQuery);
    res
      .status(HTTP_STATUS.OK)
      .json(success({ users: result.items, meta: result.meta }));
  });

  getUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await adminService.getUser(req.params.id!);
    if (!user) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: { code: "NOT_FOUND", message: "User not found." },
      });
      return;
    }
    res.status(HTTP_STATUS.OK).json(success({ user }));
  });

  updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
    const user = await adminService.updateUserStatus(req.params.id!, req.body);
    if (!user) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: { code: "NOT_FOUND", message: "User not found." },
      });
      return;
    }
    res
      .status(HTTP_STATUS.OK)
      .json(success({ user }, { message: "User status updated." }));
  });

  createPayout = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const payout = await adminService.createPayout(agencyId, req.body);
    res.status(HTTP_STATUS.CREATED).json(success({ payout }, { message: "Payout recorded." }));
  });

  listPayouts = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const result = await adminService.listPayouts(agencyId, req.query as PayoutListQuery);
    res.status(HTTP_STATUS.OK).json(success({ payouts: result.items, meta: result.meta }));
  });
}

export const adminController = new AdminController();
