import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

const SENSITIVE_BODY_FIELDS = ["password", "token", "code", "otp", "secret"];

function sanitizeBody(body: unknown): unknown {
  if (!body || typeof body !== "object") return body;
  if (Array.isArray(body)) return body.map(sanitizeBody);
  const record = body as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_BODY_FIELDS.some((f) => lowerKey.includes(f))) {
      out[key] = "**redacted**";
    } else if (typeof value === "object" && value !== null) {
      out[key] = sanitizeBody(value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

export const requestLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = process.hrtime.bigint();
  const reqId = req.headers["x-request-id"] as string | undefined;

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;
    const meta = {
      reqId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      body:
        req.method !== "GET" && req.method !== "HEAD" && req.body
          ? sanitizeBody(req.body)
          : undefined,
    };

    if (res.statusCode >= 500) {
      logger.error(meta, "Request failed");
    } else if (res.statusCode >= 400) {
      logger.warn(meta, "Client error");
    } else {
      logger.info(meta, "Request completed");
    }
  });

  next();
};
