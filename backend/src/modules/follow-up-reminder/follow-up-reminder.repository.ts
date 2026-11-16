import { Types } from "mongoose";
import type { FollowUpReminderDocument } from "./follow-up-reminder.model";
import { FollowUpReminder } from "./follow-up-reminder.model";

export interface FollowUpReminderListFilters {
  isCompleted?: boolean;
  staffId?: string;
  reminderFrom?: string;
  reminderTo?: string;
  page: number;
  limit: number;
}

export const FollowUpReminderRepository = {
  async create(data: Partial<FollowUpReminderDocument>): Promise<FollowUpReminderDocument> {
    return new FollowUpReminder(data).save();
  },

  async listByAgency(
    agencyId: string,
    filters: FollowUpReminderListFilters
  ): Promise<{ items: FollowUpReminderDocument[]; total: number; page: number; limit: number; totalPages: number }> {
    const query: Record<string, unknown> = { agencyId: new Types.ObjectId(agencyId) };
    if (filters.isCompleted !== undefined) query.isCompleted = filters.isCompleted;
    if (filters.staffId) query.staffId = new Types.ObjectId(filters.staffId);
    if (filters.reminderFrom || filters.reminderTo) {
      query.reminderAt = {};
      if (filters.reminderFrom) (query.reminderAt as Record<string, Date>).$gte = new Date(filters.reminderFrom);
      if (filters.reminderTo) (query.reminderAt as Record<string, Date>).$lte = new Date(filters.reminderTo);
    }
    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      FollowUpReminder.find(query)
        .sort({ reminderAt: 1, createdAt: 1 })
        .skip((filters.page - 1) * filters.limit)
        .limit(filters.limit)
        .exec(),
      FollowUpReminder.countDocuments(query).exec(),
    ]);
    return {
      items,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: total ? Math.ceil(total / filters.limit) : 0,
    };
  },

  async listDue(
    before: Date,
    agencyId: string
  ): Promise<FollowUpReminderDocument[]> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return FollowUpReminder.find({
      agencyId: new Types.ObjectId(agencyId),
      isCompleted: false,
      reminderAt: { $lte: before },
    })
      .sort({ reminderAt: 1 })
      .exec();
  },

  async findByIdAndAgency(
    id: string,
    agencyId: string
  ): Promise<FollowUpReminderDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return FollowUpReminder.findOne({
      _id: new Types.ObjectId(id),
      agencyId: new Types.ObjectId(agencyId),
    }).exec();
  },

  async updateByIdAndAgency(
    id: string,
    agencyId: string,
    update: Partial<FollowUpReminderDocument>
  ): Promise<FollowUpReminderDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const $set: Record<string, unknown> = { ...update };
    if (update.isCompleted === true && !update.completedAt) {
      $set.completedAt = new Date();
    } else if (update.isCompleted === false) {
      $set.completedAt = undefined;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return FollowUpReminder.findOneAndUpdate(
      { _id: new Types.ObjectId(id), agencyId: new Types.ObjectId(agencyId) },
      { $set },
      { new: true, runValidators: true }
    ).exec();
  },

  async deleteByIdAndAgency(id: string, agencyId: string): Promise<FollowUpReminderDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return FollowUpReminder.findOneAndDelete({
      _id: new Types.ObjectId(id),
      agencyId: new Types.ObjectId(agencyId),
    }).exec();
  },

  async countByAgency(agencyId: string): Promise<number> {
    return FollowUpReminder.countDocuments({ agencyId: new Types.ObjectId(agencyId) }).exec();
  },
};