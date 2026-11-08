import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ZodSchema } from "zod";
import { ValidationError } from "../shared/errors/app-error";

type Source = "body" | "query" | "params";

export const validate =
  <T>(schema: ZodSchema<T>, source: Source = "body"): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
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