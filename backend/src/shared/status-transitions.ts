import { AppError } from "./errors/app-error";
import { HTTP_STATUS } from "./constants/http-status";
import { ERROR_CODES } from "./constants/error-codes";

type BookingStatus =
  | "enquiry"
  | "quoted"
  | "deposit_paid"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "refunded";

type InvoiceStatus = "unpaid" | "partial" | "paid" | "overdue" | "cancelled";

type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";

const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  enquiry: ["quoted", "deposit_paid", "confirmed", "cancelled"],
  quoted: ["deposit_paid", "confirmed", "cancelled"],
  deposit_paid: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled", "refunded"],
  completed: [],
  cancelled: [],
  refunded: [],
};

const INVOICE_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  unpaid: ["partial", "paid", "overdue", "cancelled"],
  partial: ["paid", "overdue", "cancelled"],
  paid: [],
  overdue: [],
  cancelled: [],
};

const TASK_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  pending: ["in_progress", "completed", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function validateBookingStatusTransition(
  currentStatus: string,
  newStatus: string
): void {
  validateTransition(currentStatus, newStatus, BOOKING_TRANSITIONS, "booking");
}

export function validateInvoiceStatusTransition(
  currentStatus: string,
  newStatus: string
): void {
  validateTransition(currentStatus, newStatus, INVOICE_TRANSITIONS, "invoice");
}

export function validateTaskStatusTransition(
  currentStatus: string,
  newStatus: string
): void {
  validateTransition(currentStatus, newStatus, TASK_TRANSITIONS, "task");
}

function validateTransition(
  currentStatus: string,
  newStatus: string,
  transitions: Record<string, string[]>,
  entityType: string
): void {
  if (currentStatus === newStatus) {
    return;
  }

  const allowed = transitions[currentStatus];
  if (!allowed || !allowed.includes(newStatus)) {
    throw new AppError(
      `Invalid status transition from "${currentStatus}" to "${newStatus}" for ${entityType}`,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR
    );
  }
}
