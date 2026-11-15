import { Request, Response } from "express";
import { Types } from "mongoose";
import { taskService } from "./task.service";
import { asyncHandler } from "../../shared/utils/async-handler";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";

export class TaskController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const userId = new Types.ObjectId((req as any).user.sub);
    const task = await taskService.create(agencyId, userId, req.body);
    res.status(HTTP_STATUS.CREATED).json(success({ task }, { message: "Task created successfully" }));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const task = await taskService.getById(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ task }));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const task = await taskService.update(req.params.id!, agencyId, req.body);
    res.status(HTTP_STATUS.OK).json(success({ task }, { message: "Task updated successfully" }));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    await taskService.delete(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success(null, { message: "Task deleted successfully" }));
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const result = await taskService.list(agencyId, req.query as any);
    res.status(HTTP_STATUS.OK).json(success({ tasks: result }));
  });

  getMyTasks = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const userId = (req as any).user.sub;
    const tasks = await taskService.getByAssignedTo(userId, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ tasks }));
  });

  getUpcoming = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const days = req.query.days ? parseInt(req.query.days as string) : 7;
    const tasks = await taskService.getUpcomingTasks(agencyId, days);
    res.status(HTTP_STATUS.OK).json(success({ tasks }));
  });

  getOverdue = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const tasks = await taskService.getOverdueTasks(agencyId);
    res.status(HTTP_STATUS.OK).json(success({ tasks }));
  });

  getStatusCounts = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const counts = await taskService.countByStatus(agencyId);
    res.status(HTTP_STATUS.OK).json(success({ counts }));
  });

  getByLeadId = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const tasks = await taskService.getByLeadId(req.params.leadId!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ tasks }));
  });

  getByBookingId = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const tasks = await taskService.getByBookingId(req.params.bookingId!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ tasks }));
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const { status } = req.body;
    if (!status) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Status is required" } });
      return;
    }
    const task = await taskService.updateStatus(req.params.id!, agencyId, status);
    res.status(HTTP_STATUS.OK).json(success({ task }, { message: "Task status updated successfully" }));
  });

  markReminderSent = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const task = await taskService.markReminderSent(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ task }, { message: "Reminder marked as sent" }));
  });
}

export const taskController = new TaskController();