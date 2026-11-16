import type { TaskDocument } from "./task.model";
import type { Types } from "mongoose";

export interface CreateTaskInput {
  title: string;
  description?: string;
  type?: "call" | "email" | "meeting" | "follow_up" | "document" | "payment" | "booking" | "other";
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  priority?: "low" | "medium" | "high" | "urgent";
  dueAt?: string | Date;
  assignedTo: string;
  leadId?: string;
  bookingId?: string;
  invoiceId?: string;
  documentId?: string;
  reminderAt?: string | Date;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  type?: "call" | "email" | "meeting" | "follow_up" | "document" | "payment" | "booking" | "other";
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  priority?: "low" | "medium" | "high" | "urgent";
  dueAt?: string | Date;
  assignedTo?: string;
  leadId?: string;
  bookingId?: string;
  invoiceId?: string;
  documentId?: string;
  reminderAt?: string | Date;
  completedAt?: string | Date;
}

export interface TaskListQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: "call" | "email" | "meeting" | "follow_up" | "document" | "payment" | "booking" | "other";
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  priority?: "low" | "medium" | "high" | "urgent";
  assignedTo?: string;
  leadId?: string;
  bookingId?: string;
  invoiceId?: string;
  dueFrom?: string | Date;
  dueTo?: string | Date;
  sortBy?: "createdAt" | "updatedAt" | "dueAt" | "priority" | "status";
  sortOrder?: "asc" | "desc";
}

export interface TaskListResponse {
  items: TaskDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TaskDTO {
  id: string;
  agencyId: string;
  title: string;
  description?: string;
  type: "call" | "email" | "meeting" | "follow_up" | "document" | "payment" | "booking" | "other";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  dueAt?: string;
  completedAt?: string;
  assignedTo: string;
  createdBy: string;
  leadId?: string;
  bookingId?: string;
  invoiceId?: string;
  documentId?: string;
  reminderAt?: string;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

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

export function toTaskDTO(doc: TaskDocument | TaskLean): TaskDTO {
  return {
    id: doc._id.toString(),
    agencyId: doc.agencyId.toString(),
    title: doc.title,
    description: doc.description,
    type: doc.type,
    status: doc.status,
    priority: doc.priority,
    dueAt: doc.dueAt?.toISOString(),
    completedAt: doc.completedAt?.toISOString(),
    assignedTo: doc.assignedTo.toString(),
    createdBy: doc.createdBy.toString(),
    leadId: doc.leadId?.toString(),
    bookingId: doc.bookingId?.toString(),
    invoiceId: doc.invoiceId?.toString(),
    documentId: doc.documentId?.toString(),
    reminderAt: doc.reminderAt?.toISOString(),
    reminderSent: doc.reminderSent,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}