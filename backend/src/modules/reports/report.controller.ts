import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/async-handler";
import { resolveAgencyId } from "../../shared/utils/agency-context";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { reportService } from "./report.service";
import type { OutstandingReportQuery } from "./report.types";
import type { CommissionReportQuery } from "./report.types";

export class ReportController {
  outstanding = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const result = await reportService.outstanding(agencyId, req.query as OutstandingReportQuery);
    res.status(HTTP_STATUS.OK).json(success(result));
  });

  commission = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const result = await reportService.commission(agencyId, req.query as CommissionReportQuery);
    res.status(HTTP_STATUS.OK).json(success(result));
  });
}

export const reportController = new ReportController();
