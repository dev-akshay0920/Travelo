import type { Request, Response } from "express";
import { notFoundResponse } from "../shared/responses/api-response";

export const notFoundMiddleware = (_req: Request, res: Response): void => {
  const { status, body } = notFoundResponse();
  res.status(status).json(body);
};