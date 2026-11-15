import { Types } from "mongoose";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../../shared/errors/app-error";
import { AgencyRepository } from "../agencies/agency.repository";
import { UserRepository } from "../users/user.repository";
import { Lead } from "../leads/lead.model";
import type { FollowUpReminderDocument } from "./follow-up-reminder.model";
import { FollowUpReminderRepository } from "./follow-up-reminder.repository";
import type {
  CreateFollowUpReminderInput,
  ListFollowUpRemindersQuery,
  UpdateFollowUpReminderInput,
} from "./follow-up-reminder.validation";

export interface FollowUpReminderDTO {
  id: string;
  leadId: string;
  staffId: string;
  staffName?: string;
  reminderAt: string;
  title: string;
  notes?: string;
  isCompleted: boolean;
  completedAt?: string;
  channel: FollowUpReminderDocument["channel"];
  createdAt: string;
  updatedAt: string;
}

function toFollowUpReminderDTO(reminder: FollowUpReminderDocument): FollowUpReminderDTO {
  return {
    id: String(reminder._id),
    leadId: String(reminder.leadId),
    staffId: String(reminder.staffId),
    reminderAt: reminder.reminderAt.toISOString(),
    title: reminder.title,
    ...(reminder.notes ? { notes: reminder.notes } : {}),
    isCompleted: reminder.isCompleted,
    ...(reminder.completedAt ? { completedAt: reminder.completedAt.toISOString() } : {}),
    channel: reminder.channel,
    createdAt: reminder.createdAt.toISOString(),
    updatedAt: reminder.updatedAt.toISOString(),
  };
}

async function getActiveUser(userId: string) {
  if (!Types.ObjectId.isValid(userId)) throw new UnauthorizedError();
  const user = await UserRepository.findByIdWithRole(userId);
  if (!user || user.status !== "active") throw new UnauthorizedError();
  return user;
}

async function requireAgencyOwner(userId: string) {
  const user = await getActiveUser(userId);
  if (user.roleId?.key !== "agency") {
    throw new ForbiddenError("Agency owner access is required.");
  }
  const agency = await AgencyRepository.findByOwnerUserId(userId);
  if (!agency) throw new NotFoundError("Agency profile not found.");
  return agency;
}

export const FollowUpReminderService = {
  async create(
    userId: string,
    input: CreateFollowUpReminderInput
  ): Promise<FollowUpReminderDTO> {
    const user = await getActiveUser(userId);
    const agency = await requireAgencyOwner(userId);

    const staffId = input.staffId ? new Types.ObjectId(input.staffId) : user._id;

    // Verify lead belongs to agency
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const lead = await Lead.findOne({
      _id: new Types.ObjectId(input.leadId),
      agencyId: agency._id,
    }).exec();
    if (!lead) throw new NotFoundError("Lead not found.");

    const reminder = await FollowUpReminderRepository.create({
      agencyId: agency._id,
      leadId: new Types.ObjectId(input.leadId),
      staffId,
      reminderAt: new Date(input.reminderAt),
      title: input.title,
      notes: input.notes,
      channel: input.channel,
      isCompleted: false,
    });
    return toFollowUpReminderDTO(reminder);
  },

  async list(
    userId: string,
    filters: ListFollowUpRemindersQuery
  ): Promise<{ items: FollowUpReminderDTO[]; total: number; page: number; limit: number; totalPages: number }> {
    const agency = await requireAgencyOwner(userId);
    const { items, total } = await FollowUpReminderRepository.listByAgency(
      String(agency._id),
      filters
    );

    const staffIds = [...new Set(items.map((r) => String(r.staffId)))];
    const users = staffIds.length > 0 ? await UserRepository.findByIds(staffIds) : [];
    const usersById = new Map(users.map((u) => [String(u._id), u.name]));

    return {
      items: items.map((r) => ({
        ...toFollowUpReminderDTO(r),
        staffName: usersById.get(String(r.staffId)) ?? undefined,
      })),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: total ? Math.ceil(total / filters.limit) : 0,
    };
  },

  async getDue(_userId: string): Promise<FollowUpReminderDTO[]> {
    const now = new Date();
    const reminders = await FollowUpReminderRepository.listDue(now);

    const staffIds = [...new Set(reminders.map((r) => String(r.staffId)))];
    const users = staffIds.length > 0 ? await UserRepository.findByIds(staffIds) : [];
    const usersById = new Map(users.map((u) => [String(u._id), u.name]));

    return reminders.map((r) => ({
      ...toFollowUpReminderDTO(r),
      staffName: usersById.get(String(r.staffId)) ?? undefined,
    }));
  },

  async update(
    userId: string,
    id: string,
    input: UpdateFollowUpReminderInput
  ): Promise<FollowUpReminderDTO> {
    const agency = await requireAgencyOwner(userId);
    const updateData: Record<string, unknown> = { ...input };
    if (input.reminderAt !== undefined) {
      updateData.reminderAt = new Date(input.reminderAt);
    }
    const reminder = await FollowUpReminderRepository.updateByIdAndAgency(
      id,
      String(agency._id),
      updateData as Partial<FollowUpReminderDocument>
    );
    if (!reminder) throw new NotFoundError("Follow-up reminder not found.");
    return toFollowUpReminderDTO(reminder);
  },

  async delete(userId: string, id: string): Promise<void> {
    const agency = await requireAgencyOwner(userId);
    const reminder = await FollowUpReminderRepository.deleteByIdAndAgency(
      id,
      String(agency._id)
    );
    if (!reminder) throw new NotFoundError("Follow-up reminder not found.");
  },
};