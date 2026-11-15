import { Types } from "mongoose";
import { SupplierModel, SupplierRateCardModel } from "./supplier.model";
import type { SupplierDocument, SupplierRateCardDocument } from "./supplier.model";
import type { SupplierListQuery, SupplierRateCardListQuery } from "./supplier.types";

interface SupplierLean {
  _id: Types.ObjectId;
  agencyId: Types.ObjectId;
  name: string;
  category: "hotel" | "transport" | "airline" | "guide" | "activity" | "insurance" | "other";
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  gstin?: string;
  rating?: number;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface SupplierRateCardLean {
  _id: Types.ObjectId;
  supplierId: Types.ObjectId;
  itemName: string;
  seasonStart?: Date;
  seasonEnd?: Date;
  price: number;
  currency: string;
  unit: string;
  minQuantity?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SupplierRepository {
  async create(data: {
    agencyId: Types.ObjectId;
    name: string;
    category: "hotel" | "transport" | "airline" | "guide" | "activity" | "insurance" | "other";
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    gstin?: string;
    rating?: number;
    notes?: string;
    isActive?: boolean;
  }): Promise<SupplierDocument> {
    const supplier = new SupplierModel({
      ...data,
      agencyId: data.agencyId,
      name: data.name,
      category: data.category,
      contactPerson: data.contactPerson,
      phone: data.phone,
      email: data.email,
      address: data.address,
      gstin: data.gstin,
      rating: data.rating,
      notes: data.notes,
      isActive: data.isActive ?? true,
    });
    return supplier.save();
  }

  async findByIdAndAgency(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<SupplierDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return SupplierModel.findOne({ _id: id, agencyId }).exec();
  }

  async updateByIdAndAgency(
    id: Types.ObjectId,
    agencyId: Types.ObjectId,
    data: Partial<{
      name: string;
      category: "hotel" | "transport" | "airline" | "guide" | "activity" | "insurance" | "other";
      contactPerson: string;
      phone: string;
      email: string;
      address: string;
      gstin: string;
      rating: number;
      notes: string;
      isActive: boolean;
    }>
  ): Promise<SupplierDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return SupplierModel.findOneAndUpdate({ _id: id, agencyId }, { $set: data }, { new: true }).exec();
  }

  async deleteByIdAndAgency(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<boolean> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const result = await SupplierModel.deleteOne({ _id: id, agencyId }).exec();
    return result.deletedCount === 1;
  }

  async listByAgency(agencyId: Types.ObjectId, query: SupplierListQuery): Promise<{
    items: SupplierLean[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, search, category, isActive, sortBy = "createdAt", sortOrder = "desc" } = query;

    const filter: Record<string, unknown> = { agencyId };
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { contactPerson: { $regex: search, $options: "i" } },
      ];
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      SupplierModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean().exec(),
      SupplierModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items as SupplierLean[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getByCategory(agencyId: Types.ObjectId, category: string): Promise<SupplierLean[]> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return SupplierModel.find({ agencyId, category, isActive: true }).sort({ name: 1 }).lean().exec();
  }

  async countByCategory(agencyId: Types.ObjectId): Promise<Record<string, number>> {
    const result = await SupplierModel.aggregate([
      { $match: { agencyId, isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]).exec();
    return result.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {});
  }

  // Rate Card methods
  async createRateCard(data: {
    supplierId: Types.ObjectId;
    itemName: string;
    seasonStart?: Date;
    seasonEnd?: Date;
    price: number;
    currency?: string;
    unit: string;
    minQuantity?: number;
    notes?: string;
  }): Promise<SupplierRateCardDocument> {
    const rateCard = new SupplierRateCardModel({
      ...data,
      supplierId: data.supplierId,
      itemName: data.itemName,
      seasonStart: data.seasonStart,
      seasonEnd: data.seasonEnd,
      price: data.price,
      currency: data.currency || "INR",
      unit: data.unit,
      minQuantity: data.minQuantity,
      notes: data.notes,
    });
    return rateCard.save();
  }

  async findRateCardByIdAndSupplier(rateCardId: Types.ObjectId, supplierId: Types.ObjectId): Promise<SupplierRateCardDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return SupplierRateCardModel.findOne({ _id: rateCardId, supplierId }).exec();
  }

  async updateRateCard(
    rateCardId: Types.ObjectId,
    supplierId: Types.ObjectId,
    data: Partial<{
      itemName: string;
      seasonStart: Date;
      seasonEnd: Date;
      price: number;
      currency: string;
      unit: string;
      minQuantity: number;
      notes: string;
    }>
  ): Promise<SupplierRateCardDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return SupplierRateCardModel.findOneAndUpdate({ _id: rateCardId, supplierId }, { $set: data }, { new: true }).exec();
  }

  async deleteRateCard(rateCardId: Types.ObjectId, supplierId: Types.ObjectId): Promise<boolean> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const result = await SupplierRateCardModel.deleteOne({ _id: rateCardId, supplierId }).exec();
    return result.deletedCount === 1;
  }

  async listRateCardsBySupplier(supplierId: Types.ObjectId, query: SupplierRateCardListQuery): Promise<{
    items: SupplierRateCardLean[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, search, sortBy = "createdAt", sortOrder = "desc" } = query;

    const filter: Record<string, unknown> = { supplierId };
    if (search) {
      filter.itemName = { $regex: search, $options: "i" };
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      SupplierRateCardModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean().exec(),
      SupplierRateCardModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items as SupplierRateCardLean[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export const supplierRepository = new SupplierRepository();
