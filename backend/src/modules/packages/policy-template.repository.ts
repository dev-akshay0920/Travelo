import type { PolicyTemplateDocument, PolicyTemplateType } from "./policy-template.model";
import { PolicyTemplate } from "./policy-template.model";
import { Types } from "mongoose";

export interface PolicyTemplateCreateInput {
  name: string;
  type: PolicyTemplateType;
  content: string;
  agencyId?: string;
  isDefault?: boolean;
}

export interface PolicyTemplateUpdateInput {
  name?: string;
  type?: PolicyTemplateType;
  content?: string;
}

export interface PolicyTemplateFilters {
  agencyId?: string;
  type?: PolicyTemplateType;
  isDefault?: boolean;
  search?: string;
}

function toPlainTemplate(doc: PolicyTemplateDocument): PolicyTemplateDocument {
  const plain = doc.toObject ? doc.toObject() : (doc as PolicyTemplateDocument);
  return plain as PolicyTemplateDocument;
}

function withId(doc: PolicyTemplateDocument): PolicyTemplateDocument & { id: string } {
  const plain = toPlainTemplate(doc);
  return {
    ...plain,
    id: String(plain._id),
  } as PolicyTemplateDocument & { id: string };
}

function withIds(docs: PolicyTemplateDocument[]): Array<PolicyTemplateDocument & { id: string }> {
  return docs.map(withId);
}

export class PolicyTemplateRepository {
  static async create(input: PolicyTemplateCreateInput): Promise<PolicyTemplateDocument & { id: string }> {
    const template = new PolicyTemplate({
      ...input,
      agencyId: input.agencyId ? new Types.ObjectId(input.agencyId) : undefined,
    });
    const saved = await template.save();
    return withId(saved.toObject() as PolicyTemplateDocument);
  }

  static async findById(id: string): Promise<(PolicyTemplateDocument & { id: string }) | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const doc = await PolicyTemplate.findById(id).lean().exec();
    return doc ? withId(doc) : null;
  }

  static async findMany(filters: PolicyTemplateFilters = {}): Promise<Array<PolicyTemplateDocument & { id: string }>> {
    const query: Record<string, unknown> = {};

    if (filters.agencyId !== undefined) {
      query.agencyId = filters.agencyId ? new Types.ObjectId(filters.agencyId) : null;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.isDefault !== undefined) {
      query.isDefault = filters.isDefault;
    }

    if (filters.search) {
      query.name = { $regex: filters.search, $options: "i" };
    }

    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const docs = await PolicyTemplate.find(query).sort({ createdAt: -1 }).lean().exec();
    return withIds(docs as PolicyTemplateDocument[]);
  }

  static async update(id: string, input: PolicyTemplateUpdateInput): Promise<PolicyTemplateDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const updated = await PolicyTemplate.findByIdAndUpdate(id, input, { new: true }).lean().exec();
    return updated ? withId(updated) : null;
  }

  static async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const result = await PolicyTemplate.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }

  static async createDefaultTemplates(): Promise<Array<PolicyTemplateDocument & { id: string }>> {
    const defaults = [
      {
        name: "Standard Domestic Package T&C",
        type: "terms" as PolicyTemplateType,
        content:
          "This package is valid for Indian residents only. All services are subject to availability. Prices are subject to change without prior notice. Any unforeseen expenses incurred due to weather, flight cancellations, road closures, etc. will be borne by the customer.",
        isDefault: true,
      },
      {
        name: "Standard International Package T&C",
        type: "terms" as PolicyTemplateType,
        content:
          "International packages require a valid passport and visa as per destination requirements. Travel insurance is mandatory. Prices include taxes unless otherwise specified. Any changes in government regulations, airline schedules, or hotel availability may affect the itinerary.",
        isDefault: true,
      },
      {
        name: "Standard Cancellation Policy",
        type: "cancellation" as PolicyTemplateType,
        content:
          "Cancellation requests must be made in writing. Cancellations 30+ days before departure: 10% cancellation fee. Cancellations 15-29 days before departure: 25% cancellation fee. Cancellations 7-14 days before departure: 50% cancellation fee. Cancellations 0-6 days before departure: 100% cancellation fee. No-shows are non-refundable.",
        isDefault: true,
      },
    ];

    const created = [];
    for (const template of defaults) {
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      const existing = await PolicyTemplate.findOne({ name: template.name, isDefault: true }).lean().exec();
      if (!existing) {
        // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
        const doc = await PolicyTemplate.create(template);
        created.push(withId(doc.toObject() as PolicyTemplateDocument));
      }
    }

    return created;
  }
}
