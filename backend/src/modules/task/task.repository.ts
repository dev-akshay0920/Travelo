import { Types } from "mongoose";
import { TaskModel } from "./task.model";
import type { TaskDocument } from "./task.model";
import type { TaskListQuery } from "./task.types";

interface TaskLean {
  _id: Types.ObjectId;
  agencyId: Types.ObjectId;
  title: string;
  description?: string;
  type: "call" | "email" | "meeting" | "follow_up" | "document" | "payment" | "booking" | "other";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  dueAt?: Date;
  completedAt?: Date;
  assignedTo: Types.ObjectId;
  createdBy: Types.ObjectId;
  leadId?: Types.ObjectId;
  bookingId?: Types.ObjectId;
  invoiceId?: Types.ObjectId;
  documentId?: Types.ObjectId;
  reminderAt?: Date;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class TaskRepository {
  async create(data: {
    agencyId: Types.ObjectId;
    title: string;
    description?: string;
    type?: "call" | "email" | "meeting" | "follow_up" | "document" | "payment" | "booking" | "other";
    status?: "pending" | "in_progress" | "completed" | "cancelled";
    priority?: "low" | "medium" | "high" | "urgent";
    dueAt?: Date;
    assignedTo: Types.ObjectId;
    createdBy: Types.ObjectId;
    leadId?: Types.ObjectId;
    bookingId?: Types.ObjectId;
    invoiceId?: Types.ObjectId;
    documentId?: Types.ObjectId;
    reminderAt?: Date;
  }): Promise<TaskDocument> {
    const task = new TaskModel({
      ...data,
      agencyId: data.agencyId,
      title: data.title,
      description: data.description,
      type: data.type || "other",
      status: data.status || "pending",
      priority: data.priority || "medium",
      dueAt: data.dueAt,
      assignedTo: data.assignedTo,
      createdBy: data.createdBy,
      leadId: data.leadId,
      bookingId: data.bookingId,
      invoiceId: data.invoiceId,
      documentId: data.documentId,
      reminderAt: data.reminderAt,
      reminderSent: false,
    });
    return task.save();
  }

  async findByIdAndAgency(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<TaskDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return TaskModel.findOne({ _id: id, agencyId }).exec();
  }

  async updateByIdAndAgency(
    id: Types.ObjectId,
    agencyId: Types.ObjectId,
    data: Partial<{
      title: string;
      description: string;
      type: "call" | "email" | "meeting" | "follow_up" | "document" | "payment" | "booking" | "other";
      status: "pending" | "in_progress" | "completed" | "cancelled";
      priority: "low" | "medium" | "high" | "urgent";
      dueAt: Date;
      completedAt: Date;
      assignedTo: Types.ObjectId;
      leadId: Types.ObjectId;
      bookingId: Types.ObjectId;
      invoiceId: Types.ObjectId;
      documentId: Types.ObjectId;
      reminderAt: Date;
      reminderSent: boolean;
    }>
  ): Promise<TaskDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return TaskModel.findOneAndUpdate({ _id: id, agencyId }, { $set: data }, { new: true }).exec();
  }

  async deleteByIdAndAgency(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<boolean> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const result = await TaskModel.deleteOne({ _id: id, agencyId }).exec();
    return result.deletedCount === 1;
  }

  async listByAgency(agencyId: Types.ObjectId, query: TaskListQuery): Promise<{
    items: TaskLean[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      status,
      priority,
      assignedTo,
      leadId,
      bookingId,
      invoiceId,
      dueFrom,
      dueTo,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const filter: Record<string, unknown> = { agencyId };
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = new Types.ObjectId(assignedTo);
    if (leadId) filter.leadId = new Types.ObjectId(leadId);
    if (bookingId) filter.bookingId = new Types.ObjectId(bookingId);
    if (invoiceId) filter.invoiceId = new Types.ObjectId(invoiceId);
    if (dueFrom || dueTo) {
      filter.dueAt = {};
      if (dueFrom) (filter.dueAt as Record<string, Date>).$gte = new Date(dueFrom);
      if (dueTo) (filter.dueAt as Record<string, Date>).$lte = new Date(dueTo);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      TaskModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean().exec(),
      TaskModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items as TaskLean[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getByAssignedTo(assignedTo: Types.ObjectId, agencyId: Types.ObjectId): Promise<TaskLean[]> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return TaskModel.find({ assignedTo, agencyId }).sort({ dueAt: 1, priority: -1 }).lean().exec();
  }

  async getByLeadId(leadId: Types.ObjectId, agencyId: Types.ObjectId): Promise<TaskLean[]> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return TaskModel.find({ leadId, agencyId }).sort({ createdAt: -1 }).lean().exec();
  }

  async getByBookingId(bookingId: Types.ObjectId, agencyId: Types.ObjectId): Promise<TaskLean[]> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return TaskModel.find({ bookingId, agencyId }).sort({ createdAt: -1 }).lean().exec();
  }

  async getUpcomingTasks(agencyId: Types.ObjectId, days: number = 7): Promise<TaskLean[]> {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + days);
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return TaskModel.find({
      agencyId,
      status: { $in: ["pending", "in_progress"] },
      dueAt: { $gte: from, $lte: to },
    }).sort({ dueAt: 1 }).lean().exec();
  }

  async getOverdueTasks(agencyId: Types.ObjectId): Promise<TaskLean[]> {
    const now = new Date();
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return TaskModel.find({
      agencyId,
      status: { $in: ["pending", "in_progress"] },
      dueAt: { $lt: now },
    }).sort({ dueAt: 1 }).lean().exec();
  }

  async countByStatus(agencyId: Types.ObjectId): Promise<Record<string, number>> {
    const result = await TaskModel.aggregate([
      { $match: { agencyId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]).exec();
    return result.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {});
  }

  async updateStatus(id: Types.ObjectId, agencyId: Types.ObjectId, status: string): Promise<TaskDocument | null> {
    const updateData: Record<string, unknown> = { status };
    if (status === "completed") {
      updateData.completedAt = new Date();
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return TaskModel.findOneAndUpdate({ _id: id, agencyId }, { $set: updateData }, { new: true }).exec();
  }

  async markReminderSent(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<TaskDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return TaskModel.findOneAndUpdate({ _id: id, agencyId }, { $set: { reminderSent: true } }, { new: true }).exec();
  }
}

export const taskRepository = new TaskRepository();