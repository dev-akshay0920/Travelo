import { z } from "zod";

export const createSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    category: z.enum(["hotel", "transport", "airline", "guide", "activity", "insurance", "other"]),
    contactPerson: z.string().max(200).optional(),
    phone: z.string().max(20).optional(),
    email: z.string().email().optional(),
    address: z.string().max(500).optional(),
    gstin: z.string().max(15).optional(),
    rating: z.number().min(1).max(5).optional(),
    notes: z.string().max(2000).optional(),
    isActive: z.boolean().default(true),
  }),
});

export const updateSupplierSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    category: z.enum(["hotel", "transport", "airline", "guide", "activity", "insurance", "other"]).optional(),
    contactPerson: z.string().max(200).optional(),
    phone: z.string().max(20).optional(),
    email: z.string().email().optional(),
    address: z.string().max(500).optional(),
    gstin: z.string().max(15).optional(),
    rating: z.number().min(1).max(5).optional(),
    notes: z.string().max(2000).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getSupplierSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

export const listSuppliersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().max(100).optional(),
    category: z.enum(["hotel", "transport", "airline", "guide", "activity", "insurance", "other"]).optional(),
    isActive: z.coerce.boolean().optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "name", "category", "rating"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const deleteSupplierSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

// Rate Card validation
export const createSupplierRateCardSchema = z.object({
  params: z.object({
    supplierId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
  body: z.object({
    itemName: z.string().min(1).max(200),
    seasonStart: z.string().datetime().optional(),
    seasonEnd: z.string().datetime().optional(),
    price: z.number().min(0),
    currency: z.string().length(3).default("INR"),
    unit: z.string().min(1).max(50),
    minQuantity: z.number().int().min(1).optional(),
    notes: z.string().max(1000).optional(),
  }),
});

export const updateSupplierRateCardSchema = z.object({
  params: z.object({
    supplierId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    rateCardId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
  body: z.object({
    itemName: z.string().min(1).max(200).optional(),
    seasonStart: z.string().datetime().optional(),
    seasonEnd: z.string().datetime().optional(),
    price: z.number().min(0).optional(),
    currency: z.string().length(3).optional(),
    unit: z.string().min(1).max(50).optional(),
    minQuantity: z.number().int().min(1).optional(),
    notes: z.string().max(1000).optional(),
  }),
});

export const getSupplierRateCardSchema = z.object({
  params: z.object({
    supplierId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    rateCardId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

export const listSupplierRateCardsSchema = z.object({
  params: z.object({
    supplierId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().max(100).optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "itemName", "price"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const deleteSupplierRateCardSchema = z.object({
  params: z.object({
    supplierId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    rateCardId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});