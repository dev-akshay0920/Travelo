import { Types } from "mongoose";
import { taskRepository } from "./task.repository";
import type { CreateTaskInput, UpdateTaskInput, TaskListQuery, TaskDTO, TaskListResponse } from "./task.types";
import { toTaskDTO } from "./task.types";
import { AppError } from "../../shared/errors/app-error";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { ERROR_CODES } from "../../shared/constants/error-codes";

export class TaskService {
  async create(agencyId: Types.ObjectId, userId: Types.ObjectId, input: CreateTaskInput): Promise<TaskDTO> {
    const data = {
      ...input,
      agencyId,
      assignedTo: new Types.ObjectId(input.assignedTo),
      createdBy: userId,
      leadId: input.leadId ? new Types.ObjectId(input.leadId) : undefined,
      bookingId: input.bookingId ? new Types.ObjectId(input.bookingId) : undefined,
      invoiceId: input.invoiceId ? new Types.ObjectId(input.invoiceId) : undefined,
      documentId: input.documentId ? new Types.ObjectId(input.documentId) : undefined,
      dueAt: input.dueAt ? new Date(input.dueAt) : undefined,
      reminderAt: input.reminderAt ? new Date(input.reminderAt) : undefined,
    };

    const task = await taskRepository.create(data);
    return toTaskDTO(task);
  }

  async getById(id: string, agencyId: Types.ObjectId): Promise<TaskDTO> {
    const task = await taskRepository.findByIdAndAgency(new Types.ObjectId(id), agencyId);
    if (!task) {
      throw new AppError("Task not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toTaskDTO(task);
  }

  async update(id: string, agencyId: Types.ObjectId, input: UpdateTaskInput): Promise<TaskDTO> {
    const updateData: Record<string, unknown> = { ...input };
    if (input.assignedTo) updateData.assignedTo = new Types.ObjectId(input.assignedTo);
    if (input.leadId) updateData.leadId = new Types.ObjectId(input.leadId);
    if (input.bookingId) updateData.bookingId = new Types.ObjectId(input.bookingId);
    if (input.invoiceId) updateData.invoiceId = new Types.ObjectId(input.invoiceId);
    if (input.documentId) updateData.documentId = new Types.ObjectId(input.documentId);
    if (input.dueAt) updateData.dueAt = new Date(input.dueAt);
    if (input.reminderAt) updateData.reminderAt = new Date(input.reminderAt);
    if (input.completedAt) updateData.completedAt = new Date(input.completedAt);

    const task = await taskRepository.updateByIdAndAgency(new Types.ObjectId(id), agencyId, updateData);
    if (!task) {
      throw new AppError("Task not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toTaskDTO(task);
  }

  async delete(id: string, agencyId: Types.ObjectId): Promise<void> {
    const deleted = await taskRepository.deleteByIdAndAgency(new Types.ObjectId(id), agencyId);
    if (!deleted) {
      throw new AppError("Task not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
  }

  async list(agencyId: Types.ObjectId, query: TaskListQuery): Promise<TaskListResponse> {
    const result = await taskRepository.listByAgency(agencyId, query);
    return {
      items: result.items.map(toTaskDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getByAssignedTo(assignedTo: string, agencyId: Types.ObjectId): Promise<TaskDTO[]> {
    const tasks = await taskRepository.getByAssignedTo(new Types.ObjectId(assignedTo), agencyId);
    return tasks.map(toTaskDTO);
  }

  async getByLeadId(leadId: string, agencyId: Types.ObjectId): Promise<TaskDTO[]> {
    const tasks = await taskRepository.getByLeadId(new Types.ObjectId(leadId), agencyId);
    return tasks.map(toTaskDTO);
  }

  async getByBookingId(bookingId: string, agencyId: Types.ObjectId): Promise<TaskDTO[]> {
    const tasks = await taskRepository.getByBookingId(new Types.ObjectId(bookingId), agencyId);
    return tasks.map(toTaskDTO);
  }

  async getUpcomingTasks(agencyId: Types.ObjectId, days: number = 7): Promise<TaskDTO[]> {
    const tasks = await taskRepository.getUpcomingTasks(agencyId, days);
    return tasks.map(toTaskDTO);
  }

  async getOverdueTasks(agencyId: Types.ObjectId): Promise<TaskDTO[]> {
    const tasks = await taskRepository.getOverdueTasks(agencyId);
    return tasks.map(toTaskDTO);
  }

  async countByStatus(agencyId: Types.ObjectId): Promise<Record<string, number>> {
    return taskRepository.countByStatus(agencyId);
  }

  async updateStatus(id: string, agencyId: Types.ObjectId, status: string): Promise<TaskDTO> {
    const task = await taskRepository.updateStatus(new Types.ObjectId(id), agencyId, status);
    if (!task) {
      throw new AppError("Task not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toTaskDTO(task);
  }

  async markReminderSent(id: string, agencyId: Types.ObjectId): Promise<TaskDTO> {
    const task = await taskRepository.markReminderSent(new Types.ObjectId(id), agencyId);
    if (!task) {
      throw new AppError("Task not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toTaskDTO(task);
  }
}

export const taskService = new TaskService();