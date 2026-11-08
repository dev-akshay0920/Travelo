export type ApiErrorDetails = Record<string, unknown>;

export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly details: ApiErrorDetails | null;

  constructor(
    status: number,
    statusText: string,
    message: string,
    details: ApiErrorDetails | null,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.details = details;
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    const fallbackMessage = response.statusText;
    const body: unknown = await response.json().catch(() => null);
    const details = isPlainRecord(body) ? (body as ApiErrorDetails) : null;

    if (details !== null) {
      const nestedError = isPlainRecord(details.error) ? (details.error as Record<string, unknown>) : null;
      if (nestedError !== null) {
        const nestedMessage = typeof nestedError.message === "string" && nestedError.message.length > 0
          ? nestedError.message
          : undefined;
        const rootMessage = typeof details.message === "string" && details.message.length > 0
          ? details.message
          : undefined;
        const candidate = nestedMessage ?? rootMessage ?? fallbackMessage;
        return new ApiError(response.status, response.statusText, candidate, details);
      }

      const rootMessage = typeof details.message === "string" && details.message.length > 0
        ? details.message
        : undefined;
      if (rootMessage) {
        return new ApiError(response.status, response.statusText, rootMessage, details);
      }
    }

    return new ApiError(response.status, response.statusText, fallbackMessage, details);
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get isNotFoundError(): boolean {
    return this.status === 404;
  }

  get isAuthenticationError(): boolean {
    return this.status === 401;
  }

  get isAuthorizationError(): boolean {
    return this.status === 403;
  }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
