import { Types } from "mongoose";
import { subscriptionPlanRepository } from "./subscription-plan.repository";
import type { CreateSubscriptionPlanInput, UpdateSubscriptionPlanInput, SubscriptionPlanListQuery, SubscriptionPlanDTO, SubscriptionPlanListResponse } from "./subscription-plan.types";
import { toSubscriptionPlanDTO } from "./subscription-plan.types";
import { AppError } from "../../shared/errors/app-error";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { ERROR_CODES } from "../../shared/constants/error-codes";

export class SubscriptionPlanService {
  async create(input: CreateSubscriptionPlanInput): Promise<SubscriptionPlanDTO> {
    const existing = await subscriptionPlanRepository.findBySlug(input.slug);
    if (existing) {
      throw new AppError("Plan slug already exists", HTTP_STATUS.CONFLICT, ERROR_CODES.CONFLICT);
    }

    const plan = await subscriptionPlanRepository.create(input);
    return toSubscriptionPlanDTO(plan);
  }

  async getById(id: string): Promise<SubscriptionPlanDTO> {
    const plan = await subscriptionPlanRepository.findById(new Types.ObjectId(id));
    if (!plan) {
      throw new AppError("Plan not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toSubscriptionPlanDTO(plan);
  }

  async getBySlug(slug: string): Promise<SubscriptionPlanDTO> {
    const plan = await subscriptionPlanRepository.findBySlug(slug);
    if (!plan) {
      throw new AppError("Plan not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toSubscriptionPlanDTO(plan);
  }

  async update(id: string, input: UpdateSubscriptionPlanInput): Promise<SubscriptionPlanDTO> {
    const plan = await subscriptionPlanRepository.updateById(new Types.ObjectId(id), input);
    if (!plan) {
      throw new AppError("Plan not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toSubscriptionPlanDTO(plan);
  }

  async delete(id: string): Promise<void> {
    const deleted = await subscriptionPlanRepository.deleteById(new Types.ObjectId(id));
    if (!deleted) {
      throw new AppError("Plan not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
  }

  async list(query: SubscriptionPlanListQuery): Promise<SubscriptionPlanListResponse> {
    const result = await subscriptionPlanRepository.list(query);
    return {
      items: result.items.map(toSubscriptionPlanDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getActivePlans(): Promise<SubscriptionPlanDTO[]> {
    const plans = await subscriptionPlanRepository.getActivePlans();
    return plans.map(toSubscriptionPlanDTO);
  }
}

export const subscriptionPlanService = new SubscriptionPlanService();