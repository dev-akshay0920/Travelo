import type { Request, Response, NextFunction } from "express";
import { AppError } from "../shared/errors/app-error";
import { HTTP_STATUS } from "../shared/constants/http-status";
import { ERROR_CODES } from "../shared/constants/error-codes";

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function toPlain(details: unknown): Record<string, unknown> | undefined {
  if (details === undefined || details === null) return undefined;
  if (isPlainRecord(details)) return details as Record<string, unknown>;
  if (Array.isArray(details)) {
    const out: Record<string, unknown> = {};
    for (let i = 0; i < details.length; i += 1) {
      out[i] = details[i];
    }
    return out;
  }
  return { value: details };
}

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: toPlain(err.details) } : {}),
      },
    });
    return;
  }

  const message =
    err instanceof Error ? err.message : "An unexpected error occurred.";

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message,
    },
  });
};