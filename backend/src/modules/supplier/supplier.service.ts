import { Types } from "mongoose";
import { supplierRepository } from "./supplier.repository";
import type { CreateSupplierInput, UpdateSupplierInput, SupplierListQuery, SupplierDTO, SupplierListResponse } from "./supplier.types";
import type { CreateSupplierRateCardInput, UpdateSupplierRateCardInput, SupplierRateCardListQuery, SupplierRateCardDTO, SupplierRateCardListResponse } from "./supplier.types";
import { toSupplierDTO, toSupplierRateCardDTO } from "./supplier.types";
import { AppError } from "../../shared/errors/app-error";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { ERROR_CODES } from "../../shared/constants/error-codes";

export class SupplierService {
  async create(agencyId: Types.ObjectId, input: CreateSupplierInput): Promise<SupplierDTO> {
    const data = { ...input, agencyId };
    const supplier = await supplierRepository.create(data);
    return toSupplierDTO(supplier);
  }

  async getById(id: string, agencyId: Types.ObjectId): Promise<SupplierDTO> {
    const supplier = await supplierRepository.findByIdAndAgency(new Types.ObjectId(id), agencyId);
    if (!supplier) {
      throw new AppError("Supplier not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toSupplierDTO(supplier);
  }

  async update(id: string, agencyId: Types.ObjectId, input: UpdateSupplierInput): Promise<SupplierDTO> {
    const supplier = await supplierRepository.updateByIdAndAgency(new Types.ObjectId(id), agencyId, input);
    if (!supplier) {
      throw new AppError("Supplier not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toSupplierDTO(supplier);
  }

  async delete(id: string, agencyId: Types.ObjectId): Promise<void> {
    const deleted = await supplierRepository.deleteByIdAndAgency(new Types.ObjectId(id), agencyId);
    if (!deleted) {
      throw new AppError("Supplier not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
  }

  async list(agencyId: Types.ObjectId, query: SupplierListQuery): Promise<SupplierListResponse> {
    const result = await supplierRepository.listByAgency(agencyId, query);
    return {
      items: result.items.map(toSupplierDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getByCategory(agencyId: Types.ObjectId, category: string): Promise<SupplierDTO[]> {
    const suppliers = await supplierRepository.getByCategory(agencyId, category);
    return suppliers.map(toSupplierDTO);
  }

  async countByCategory(agencyId: Types.ObjectId): Promise<Record<string, number>> {
    return supplierRepository.countByCategory(agencyId);
  }

  // Rate Card methods
  async createRateCard(supplierId: string, input: CreateSupplierRateCardInput): Promise<SupplierRateCardDTO> {
    const data = {
      ...input,
      supplierId: new Types.ObjectId(supplierId),
      seasonStart: input.seasonStart ? new Date(input.seasonStart) : undefined,
      seasonEnd: input.seasonEnd ? new Date(input.seasonEnd) : undefined,
    };
    const rateCard = await supplierRepository.createRateCard(data);
    return toSupplierRateCardDTO(rateCard);
  }

  async getRateCard(supplierId: string, rateCardId: string): Promise<SupplierRateCardDTO> {
    const rateCard = await supplierRepository.findRateCardByIdAndSupplier(
      new Types.ObjectId(rateCardId),
      new Types.ObjectId(supplierId)
    );
    if (!rateCard) {
      throw new AppError("Rate card not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toSupplierRateCardDTO(rateCard);
  }

  async updateRateCard(supplierId: string, rateCardId: string, input: UpdateSupplierRateCardInput): Promise<SupplierRateCardDTO> {
    const updateData: Record<string, unknown> = { ...input };
    if (input.seasonStart) updateData.seasonStart = new Date(input.seasonStart);
    if (input.seasonEnd) updateData.seasonEnd = new Date(input.seasonEnd);

    const rateCard = await supplierRepository.updateRateCard(
      new Types.ObjectId(rateCardId),
      new Types.ObjectId(supplierId),
      updateData
    );
    if (!rateCard) {
      throw new AppError("Rate card not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toSupplierRateCardDTO(rateCard);
  }

  async deleteRateCard(supplierId: string, rateCardId: string): Promise<void> {
    const deleted = await supplierRepository.deleteRateCard(
      new Types.ObjectId(rateCardId),
      new Types.ObjectId(supplierId)
    );
    if (!deleted) {
      throw new AppError("Rate card not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
  }

  async listRateCards(supplierId: string, query: SupplierRateCardListQuery): Promise<SupplierRateCardListResponse> {
    const result = await supplierRepository.listRateCardsBySupplier(new Types.ObjectId(supplierId), query);
    return {
      items: result.items.map(toSupplierRateCardDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}

export const supplierService = new SupplierService();