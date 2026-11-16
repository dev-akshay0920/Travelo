import type { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../shared/errors/app-error";

/**
 * Ensures the authenticated caller carries at least one of the required
 * staff permissions (resolved from the JWT `permissions` claim, which is
 * derived from `ROLE_PERMISSIONS` / custom staff permissions at sign-in).
 * Travellers and callers without a staff permission claim are rejected with
 * 403 instead of leaking data or returning 500.
 */
export const permissionMiddleware = (
  ...requiredPermissions: string[]
) => {
  return async (_req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const user = _req.user;

    if (!user) {
      next(new ForbiddenError("Access denied."));
      return;
    }

    const permissions: string[] = user.permissions ?? [];
    const hasPermission = requiredPermissions.some((permission) =>
      permissions.includes(permission)
    );

    if (!hasPermission) {
      next(new ForbiddenError("Insufficient permissions."));
      return;
    }

    next();
  };
};
