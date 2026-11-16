import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ZodSchema } from "zod";
import { ValidationError } from "../shared/errors/app-error";

type Source = "body" | "query" | "params";

const COMPOSITE_SOURCES: readonly Source[] = ["body", "params", "query"];

/**
 * Detects request-scoped schemas shaped as `{ body?, params?, query? }`.
 *
 * CRM modules describe a request with a composite schema, while other modules
 * (auth, agencies, packages, leads, watchlist) use a flat schema that is
 * validated against a single source explicitly.
 */
function isCompositeSchema(schema: ZodSchema<unknown>): boolean {
  const shape = (schema as unknown as { shape?: Record<string, unknown> }).shape;
  if (!shape || typeof shape !== "object") {
    return false;
  }
  const keys = Object.keys(shape);
  if (keys.length === 0) {
    return false;
  }
  return keys.every((key) => (COMPOSITE_SOURCES as readonly string[]).includes(key));
}

export const validate =
  <T>(schema: ZodSchema<T>, source: Source = "body"): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (isCompositeSchema(schema)) {
      const result = schema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      if (!result.success) {
        next(new ValidationError("Invalid request payload", result.error.flatten()));
        return;
      }
      const parsed = result.data as Record<string, unknown>;
      if ("body" in parsed) {
        req.body = parsed.body;
      }
      if ("params" in parsed) {
        req.params = parsed.params as Request["params"];
      }
      if ("query" in parsed) {
        req.query = parsed.query as Request["query"];
      }
      next();
      return;
    }

    const data = req[source];
    const result = schema.safeParse(data);
    if (!result.success) {
      next(new ValidationError("Invalid request payload", result.error.flatten()));
      return;
    }
    // Assign validated (and coerced/defaulted) data back
    (req as unknown as Record<Source, unknown>)[source] = result.data;
    next();
  };
