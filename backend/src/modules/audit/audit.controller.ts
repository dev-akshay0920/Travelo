import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/async-handler";
import { resolveAgencyId } from "../../shared/utils/agency-context";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { auditService } from "./audit.service";
import type { AuditLogListQuery } from "./audit.types";

export class AuditController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const result = await auditService.list(agencyId, req.query as AuditLogListQuery);
    res.status(HTTP_STATUS.OK).json(success({ auditLogs: result.items, meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages } }));
  });
}

export const auditController = new AuditController();
