import { Types } from "mongoose";
import { agencySubscriptionRepository } from "./agency-subscription.repository";
import { subscriptionPlanRepository } from "./subscription-plan.repository";
import type { CreateAgencySubscriptionInput, UpdateAgencySubscriptionInput, AgencySubscriptionListQuery, AgencySubscriptionDTO, AgencySubscriptionListResponse } from "./agency-subscription.types";
import { toAgencySubscriptionDTO } from "./agency-subscription.types";
import { toSubscriptionPlanDTO } from "./subscription-plan.types";
import { AppError } from "../../shared/errors/app-error";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { ERROR_CODES } from "../../shared/constants/error-codes";

export class AgencySubscriptionService {
  async create(agencyId: Types.ObjectId, _userId: Types.ObjectId, input: CreateAgencySubscriptionInput): Promise<AgencySubscriptionDTO> {
    const existing = await agencySubscriptionRepository.findByAgencyId(agencyId);
    if (existing) {
      throw new AppError("Agency already has a subscription", HTTP_STATUS.CONFLICT, ERROR_CODES.CONFLICT);
    }

    const plan = await subscriptionPlanRepository.findById(new Types.ObjectId(input.planId));
    if (!plan) {
      throw new AppError("Plan not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    const now = new Date();
    const trialEndsAt = input.trialDays ? new Date(now.getTime() + input.trialDays * 24 * 60 * 60 * 1000) : undefined;
    
    const periodEnd = new Date(now);
    if (input.billingCycle === "yearly") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    const data = {
      agencyId,
      planId: new Types.ObjectId(input.planId),
      status: input.trialDays ? ("trial" as const) : ("active" as const),
      billingCycle: input.billingCycle || "monthly",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      trialEndsAt,
      cancelAtPeriodEnd: false,
      paymentMethod: input.paymentMethod,
      autoRenew: input.autoRenew ?? true,
      nextBillingAt: input.trialDays ? trialEndsAt : periodEnd,
    };

    const subscription = await agencySubscriptionRepository.create(data);
    const planDto = toSubscriptionPlanDTO(plan);
    return toAgencySubscriptionDTO(subscription, planDto.name);
  }

  async getById(id: string, agencyId: Types.ObjectId): Promise<AgencySubscriptionDTO> {
    const subscription = await agencySubscriptionRepository.findByIdAndAgency(new Types.ObjectId(id), agencyId);
    if (!subscription) {
      throw new AppError("Subscription not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    const plan = await subscriptionPlanRepository.findById(subscription.planId);
    return toAgencySubscriptionDTO(subscription, plan?.name);
  }

  async getByAgencyId(agencyId: Types.ObjectId): Promise<AgencySubscriptionDTO | null> {
    const subscription = await agencySubscriptionRepository.findByAgencyId(agencyId);
    if (!subscription) return null;
    const plan = await subscriptionPlanRepository.findById(subscription.planId);
    return toAgencySubscriptionDTO(subscription, plan?.name);
  }

  async update(agencyId: Types.ObjectId, id: string, input: UpdateAgencySubscriptionInput): Promise<AgencySubscriptionDTO> {
    const updateData: Record<string, unknown> = { ...input };
    if (input.planId) updateData.planId = new Types.ObjectId(input.planId);
    if (input.nextBillingAt) updateData.nextBillingAt = new Date(input.nextBillingAt);

    const subscription = await agencySubscriptionRepository.updateByIdAndAgency(new Types.ObjectId(id), agencyId, updateData);
    if (!subscription) {
      throw new AppError("Subscription not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    const plan = await subscriptionPlanRepository.findById(subscription.planId);
    return toAgencySubscriptionDTO(subscription, plan?.name);
  }

  async delete(agencyId: Types.ObjectId, id: string): Promise<void> {
    const deleted = await agencySubscriptionRepository.deleteByIdAndAgency(new Types.ObjectId(id), agencyId);
    if (!deleted) {
      throw new AppError("Subscription not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
  }

  async list(agencyId: Types.ObjectId, query: AgencySubscriptionListQuery): Promise<AgencySubscriptionListResponse> {
    const result = await agencySubscriptionRepository.listByAgency(agencyId, query);
    const items = await Promise.all(
      result.items.map(async (doc) => {
        const plan = await subscriptionPlanRepository.findById(doc.planId);
        return toAgencySubscriptionDTO(doc, plan?.name);
      })
    );
    return {
      items,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async listAll(query: AgencySubscriptionListQuery): Promise<AgencySubscriptionListResponse> {
    const result = await agencySubscriptionRepository.listAll(query);
    const items = await Promise.all(
      result.items.map(async (doc) => {
        const plan = await subscriptionPlanRepository.findById(doc.planId);
        return toAgencySubscriptionDTO(doc, plan?.name);
      })
    );
    return {
      items,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async cancel(agencyId: Types.ObjectId, id: string, cancelAtPeriodEnd: boolean = true): Promise<AgencySubscriptionDTO> {
    const subscription = await agencySubscriptionRepository.updateByIdAndAgency(
      new Types.ObjectId(id),
      agencyId,
      { cancelAtPeriodEnd, status: cancelAtPeriodEnd ? "active" : "cancelled", cancelledAt: cancelAtPeriodEnd ? undefined : new Date() }
    );
    if (!subscription) {
      throw new AppError("Subscription not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    const plan = await subscriptionPlanRepository.findById(subscription.planId);
    return toAgencySubscriptionDTO(subscription, plan?.name);
  }

  async reactivate(agencyId: Types.ObjectId, id: string): Promise<AgencySubscriptionDTO> {
    const subscription = await agencySubscriptionRepository.updateByIdAndAgency(
      new Types.ObjectId(id),
      agencyId,
      { status: "active", cancelAtPeriodEnd: false, cancelledAt: undefined }
    );
    if (!subscription) {
      throw new AppError("Subscription not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    const plan = await subscriptionPlanRepository.findById(subscription.planId);
    return toAgencySubscriptionDTO(subscription, plan?.name);
  }

  async getExpiringTrials(days: number = 3): Promise<AgencySubscriptionDTO[]> {
    const subscriptions = await agencySubscriptionRepository.getExpiringTrials(days);
    const results = await Promise.all(
      subscriptions.map(async (doc) => {
        const plan = await subscriptionPlanRepository.findById(doc.planId);
        return toAgencySubscriptionDTO(doc, plan?.name);
      })
    );
    return results;
  }

  async getPastDueSubscriptions(): Promise<AgencySubscriptionDTO[]> {
    const subscriptions = await agencySubscriptionRepository.getPastDueSubscriptions();
    const results = await Promise.all(
      subscriptions.map(async (doc) => {
        const plan = await subscriptionPlanRepository.findById(doc.planId);
        return toAgencySubscriptionDTO(doc, plan?.name);
      })
    );
    return results;
  }

  async getUpcomingRenewals(days: number = 7): Promise<AgencySubscriptionDTO[]> {
    const subscriptions = await agencySubscriptionRepository.getUpcomingRenewals(days);
    const results = await Promise.all(
      subscriptions.map(async (doc) => {
        const plan = await subscriptionPlanRepository.findById(doc.planId);
        return toAgencySubscriptionDTO(doc, plan?.name);
      })
    );
    return results;
  }

  async getStatusCounts(): Promise<Record<string, number>> {
    return agencySubscriptionRepository.countByStatus();
  }

  async recordPayment(
    agencyId: Types.ObjectId,
    subscriptionId: string,
    amount: number,
    method: string,
    _reference?: string
  ): Promise<AgencySubscriptionDTO> {
    const subscription = await agencySubscriptionRepository.updateByIdAndAgency(
      new Types.ObjectId(subscriptionId),
      agencyId,
      {
        status: "active",
        lastPaymentAt: new Date(),
        lastPaymentAmount: amount,
        lastPaymentMethod: method,
        nextBillingAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }
    );
    if (!subscription) {
      throw new AppError("Subscription not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    const plan = await subscriptionPlanRepository.findById(subscription.planId);
    return toAgencySubscriptionDTO(subscription, plan?.name);
  }
}

export const agencySubscriptionService = new AgencySubscriptionService();