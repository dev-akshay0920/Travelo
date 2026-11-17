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
    const raw = req.query as unknown as Record<string, string | string[] | undefined>;
    const shouldExport = raw.export === "true";
    const query: OutstandingReportQuery = {
      page: raw.page ? Number(raw.page as string) : undefined,
      limit: raw.limit ? Number(raw.limit as string) : undefined,
      from: raw.from as string | undefined,
      to: raw.to as string | undefined,
    };

    if (shouldExport) {
      const { filename, data } = await reportService.exportOutstandingCsv(agencyId, {
        from: query.from,
        to: query.to,
      });
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.status(HTTP_STATUS.OK).send(data);
      return;
    }

    const result = await reportService.outstanding(agencyId, query);
    res.status(HTTP_STATUS.OK).json(success(result));
  });

  commission = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const result = await reportService.commission(
      agencyId,
      req.query as CommissionReportQuery
    );
    res.status(HTTP_STATUS.OK).json(success(result));
  });
}

export const reportController = new ReportController();
