import rateLimit from "express-rate-limit";
import { env } from "../config/env";

export const generalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Too many requests, please try again later.",
    },
  },
});

/**
 * Rate limiter for authenticated CRM write routes (leads, quotations, bookings,
 * invoices, documents, staff, followups, tasks, itineraries, suppliers).
 * Keyed by authenticated user sub so a single agency user cannot flood writes.
 */
export const crmWriteRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  keyGenerator: (req) => req.user?.sub ?? req.ip ?? "unauthenticated",
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Too many CRM write requests. Please slow down.",
    },
  },
});

/**
 * Stricter rate limiter for high-impact CRM write operations: bulk lead import,
 * staff invites, and AI-generated itineraries. Keyed by authenticated user sub.
 */
export const crmWriteStrictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  keyGenerator: (req) => req.user?.sub ?? req.ip ?? "unauthenticated",
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Too many high-impact requests. Please slow down.",
    },
  },
});
