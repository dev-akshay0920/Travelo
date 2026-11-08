import type { ErrorCode } from "../constants/error-codes";
import type { HttpStatusCode } from "../constants/http-status";

export class AppError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly code: ErrorCode;
  public readonly details: unknown;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: HttpStatusCode,
    code: ErrorCode,
    details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super(message, 422, "VALIDATION_ERROR", details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict", details?: unknown) {
    super(message, 409, "CONFLICT", details);
  }
}

export class RateLimitedError extends AppError {
  constructor(message = "Too many requests") {
    super(message, 429, "RATE_LIMITED");
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message = "Uploaded file is too large") {
    super(message, 413, "PAYLOAD_TOO_LARGE");
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = "The image storage service is not configured.") {
    super(message, 503, "SERVICE_UNAVAILABLE");
  }
}