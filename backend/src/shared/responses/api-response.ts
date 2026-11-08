import { ERROR_CODES, type ErrorCode } from "../constants/error-codes";
import type { HttpStatusCode } from "../constants/http-status";

export interface ApiSuccessMeta {
  [key: string]: unknown;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: ApiSuccessMeta;
}

export interface ApiErrorDetails {
  [key: string]: unknown;
}

export interface ApiErrorBody {
  code: ErrorCode;
  message: string;
  details?: ApiErrorDetails;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export const success = <T>(
  data: T,
  meta?: ApiSuccessMeta
): ApiSuccessResponse<T> => {
  if (meta === undefined) {
    return { success: true, data };
  }
  return { success: true, data, meta };
};

export const failure = (
  status: HttpStatusCode,
  code: ErrorCode,
  message: string,
  details?: ApiErrorDetails
): { status: HttpStatusCode; body: ApiErrorResponse } => {
  const body: ApiErrorResponse = {
    success: false,
    error:
      details === undefined
        ? { code, message }
        : { code, message, details },
  };
  return { status, body };
};

export const notFoundResponse = (): {
  status: HttpStatusCode;
  body: ApiErrorResponse;
} => failure(404, ERROR_CODES.ROUTE_NOT_FOUND, "The requested resource was not found.");