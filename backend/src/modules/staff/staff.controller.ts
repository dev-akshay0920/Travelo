import { Request, Response } from "express";
import { Types } from "mongoose";
import { staffService } from "./staff.service";
import { asyncHandler } from "../../shared/utils/async-handler";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";

export class StaffController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const userId = new Types.ObjectId((req as any).user.sub);
    const staff = await staffService.create(agencyId, userId, req.body);
    res.status(HTTP_STATUS.CREATED).json(success({ staff }, { message: "Staff member added successfully" }));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const staff = await staffService.getById(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ staff }));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const staff = await staffService.update(req.params.id!, agencyId, req.body);
    res.status(HTTP_STATUS.OK).json(success({ staff }, { message: "Staff member updated successfully" }));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    await staffService.delete(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success(null, { message: "Staff member removed successfully" }));
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const result = await staffService.list(agencyId, req.query as any);
    res.status(HTTP_STATUS.OK).json(success({ staff: result }));
  });

  getByRole = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const staff = await staffService.getByRole(agencyId, req.params.role!);
    res.status(HTTP_STATUS.OK).json(success({ staff }));
  });

  getRoleCounts = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const counts = await staffService.countByRole(agencyId);
    res.status(HTTP_STATUS.OK).json(success({ counts }));
  });
}

export const staffController = new StaffController();