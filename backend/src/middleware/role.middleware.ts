import type { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../shared/errors/app-error";

export const roleMiddleware =
  (...allowedRoles: string[]) =>
  async (_req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const user = _req.user;

    if (!user) {
      next(new ForbiddenError("Access denied."));
      return;
    }

    if (!allowedRoles.includes(user.roleKey)) {
      next(new ForbiddenError("Access denied."));
      return;
    }

    next();
  };
