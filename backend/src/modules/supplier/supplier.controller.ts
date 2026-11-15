import { Request, Response } from "express";
import { Types } from "mongoose";
import { supplierService } from "./supplier.service";
import { asyncHandler } from "../../shared/utils/async-handler";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";

export class SupplierController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const supplier = await supplierService.create(agencyId, req.body);
    res.status(HTTP_STATUS.CREATED).json(success({ supplier }, { message: "Supplier created successfully" }));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const supplier = await supplierService.getById(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ supplier }));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const supplier = await supplierService.update(req.params.id!, agencyId, req.body);
    res.status(HTTP_STATUS.OK).json(success({ supplier }, { message: "Supplier updated successfully" }));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    await supplierService.delete(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success(null, { message: "Supplier deleted successfully" }));
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const result = await supplierService.list(agencyId, req.query as any);
    res.status(HTTP_STATUS.OK).json(success({ suppliers: result }));
  });

  getByCategory = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const suppliers = await supplierService.getByCategory(agencyId, req.params.category!);
    res.status(HTTP_STATUS.OK).json(success({ suppliers }));
  });

  getCategoryCounts = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const counts = await supplierService.countByCategory(agencyId);
    res.status(HTTP_STATUS.OK).json(success({ counts }));
  });

  // Rate Card endpoints
  createRateCard = asyncHandler(async (req: Request, res: Response) => {
    const supplierId = req.params.supplierId!;
    const rateCard = await supplierService.createRateCard(supplierId, req.body);
    res.status(HTTP_STATUS.CREATED).json(success({ rateCard }, { message: "Rate card created successfully" }));
  });

  getRateCard = asyncHandler(async (req: Request, res: Response) => {
    const supplierId = req.params.supplierId!;
    const rateCardId = req.params.rateCardId!;
    const rateCard = await supplierService.getRateCard(supplierId, rateCardId);
    res.status(HTTP_STATUS.OK).json(success({ rateCard }));
  });

  updateRateCard = asyncHandler(async (req: Request, res: Response) => {
    const supplierId = req.params.supplierId!;
    const rateCardId = req.params.rateCardId!;
    const rateCard = await supplierService.updateRateCard(supplierId, rateCardId, req.body);
    res.status(HTTP_STATUS.OK).json(success({ rateCard }, { message: "Rate card updated successfully" }));
  });

  deleteRateCard = asyncHandler(async (req: Request, res: Response) => {
    const supplierId = req.params.supplierId!;
    const rateCardId = req.params.rateCardId!;
    await supplierService.deleteRateCard(supplierId, rateCardId);
    res.status(HTTP_STATUS.OK).json(success(null, { message: "Rate card deleted successfully" }));
  });

  listRateCards = asyncHandler(async (req: Request, res: Response) => {
    const supplierId = req.params.supplierId!;
    const result = await supplierService.listRateCards(supplierId, req.query as any);
    res.status(HTTP_STATUS.OK).json(success({ rateCards: result }));
  });
}

export const supplierController = new SupplierController();