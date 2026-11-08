import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const incoming = req.header("x-request-id");
  const id = incoming && incoming.length > 0 ? incoming : randomUUID();
  req.id = id;
  res.setHeader("x-request-id", id);
  next();
};