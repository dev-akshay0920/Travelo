import type { Request, Response, NextFunction, RequestHandler } from "express";
import { verifyAccessToken } from "../shared/utils/jwt";
import { UnauthorizedError } from "../shared/errors/app-error";

export const authMiddleware: RequestHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(new UnauthorizedError("Missing authorization token."));
    return;
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token."));
  }
};
