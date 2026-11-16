import { Types } from "mongoose";
import { itineraryRepository } from "./itinerary.repository";
import type { CreateItineraryInput, UpdateItineraryInput, ItineraryListQuery, ItineraryDTO, ItineraryListResponse } from "./itinerary.types";
import { toItineraryDTO } from "./itinerary.types";
import { AppError } from "../../shared/errors/app-error";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { ERROR_CODES } from "../../shared/constants/error-codes";
import { env } from "../../config/env";
import {
  aiGeneratedItineraryDraftSchema,
  type AiGenerateItineraryInput,
  type AiGeneratedItineraryDraft,
} from "./itinerary.validation";

function extractJsonObject(content: string): unknown {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced?.[1]?.trim() ?? trimmed;

  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(raw.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export class ItineraryService {
  async create(agencyId: Types.ObjectId, input: CreateItineraryInput): Promise<ItineraryDTO> {
    const data = {
      ...input,
      agencyId,
      leadId: input.leadId ? new Types.ObjectId(input.leadId) : undefined,
      packageId: input.packageId ? new Types.ObjectId(input.packageId) : undefined,
    };

    const itinerary = await itineraryRepository.create(data);
    return toItineraryDTO(itinerary);
  }

  async getById(id: string, agencyId: Types.ObjectId): Promise<ItineraryDTO> {
    const itinerary = await itineraryRepository.findByIdAndAgency(new Types.ObjectId(id), agencyId);
    if (!itinerary) {
      throw new AppError("Itinerary not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toItineraryDTO(itinerary);
  }

  async update(id: string, agencyId: Types.ObjectId, input: UpdateItineraryInput): Promise<ItineraryDTO> {
    const updateData: Record<string, unknown> = { ...input };
    if (input.leadId) updateData.leadId = new Types.ObjectId(input.leadId);
    if (input.packageId) updateData.packageId = new Types.ObjectId(input.packageId);

    const itinerary = await itineraryRepository.updateByIdAndAgency(new Types.ObjectId(id), agencyId, updateData);
    if (!itinerary) {
      throw new AppError("Itinerary not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toItineraryDTO(itinerary);
  }

  async delete(id: string, agencyId: Types.ObjectId): Promise<void> {
    const deleted = await itineraryRepository.deleteByIdAndAgency(new Types.ObjectId(id), agencyId);
    if (!deleted) {
      throw new AppError("Itinerary not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
  }

  async generateAiDraft(input: AiGenerateItineraryInput): Promise<AiGeneratedItineraryDraft> {
    const apiKey = env.AI_API_KEY;
    if (!apiKey) {
      throw new AppError(
        "AI itinerary generation is not configured. Set AI_API_KEY on the backend.",
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        ERROR_CODES.SERVICE_UNAVAILABLE
      );
    }

    const baseUrl = (env.AI_BASE_URL ?? "https://opencode.ai/zen/v1").replace(/\/+$/, "");
    const model = env.AI_MODEL ?? "big-pickle";
    const preferences = [
      input.travelerCount ? `${input.travelerCount} traveller(s)` : null,
      input.budget ? `budget around ${input.currency} ${input.budget}` : null,
      input.style ? `travel style: ${input.style}` : null,
      input.interests?.length ? `interests: ${input.interests.join(", ")}` : null,
      input.notes ? `extra notes: ${input.notes}` : null,
    ]
      .filter(Boolean)
      .join("; ");

    const systemPrompt =
      "You are an expert travel planner for a tour agency. Create practical, day-by-day itineraries. " +
      "Reply with valid JSON only, no markdown fences, using this shape: " +
      '{"name":string,"destination":string,"summary":string,' +
      '"days":[{"day":number,"title":string,"description":string,"accommodation":string,' +
      '"meals":string[],"transport":string,"sightseeing":string[],"highlights":string[],"distance":string}],' +
      '"estimatedTotalPrice":number}. Keep descriptions concise and realistic.';

    const userPrompt = [
      `Destination: ${input.destination}`,
      `Duration: ${input.durationDays} days`,
      preferences ? `Preferences: ${preferences}` : null,
      "Return exactly one JSON object.",
    ]
      .filter(Boolean)
      .join("\n");

    let response: Response;
    try {
      response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.7,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      });
    } catch {
      throw new AppError(
        "Unable to reach the AI provider. Please try again.",
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        ERROR_CODES.SERVICE_UNAVAILABLE
      );
    }

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 300);
      throw new AppError(
        `AI provider returned ${response.status}. ${detail}`.trim(),
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        ERROR_CODES.SERVICE_UNAVAILABLE
      );
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new AppError(
        "AI provider returned an empty response.",
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        ERROR_CODES.SERVICE_UNAVAILABLE
      );
    }

    const parsed = aiGeneratedItineraryDraftSchema.safeParse(extractJsonObject(content));
    if (!parsed.success) {
      throw new AppError(
        "AI returned an invalid itinerary draft. Please try again.",
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        ERROR_CODES.SERVICE_UNAVAILABLE
      );
    }

    return parsed.data;
  }

  async list(agencyId: Types.ObjectId, query: ItineraryListQuery): Promise<ItineraryListResponse> {
    const result = await itineraryRepository.listByAgency(agencyId, query);
    return {
      items: result.items.map(toItineraryDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getTemplates(agencyId: Types.ObjectId): Promise<ItineraryDTO[]> {
    const templates = await itineraryRepository.getTemplatesByAgency(agencyId);
    return templates.map(toItineraryDTO);
  }

  async duplicate(id: string, agencyId: Types.ObjectId, newName: string): Promise<ItineraryDTO> {
    const duplicated = await itineraryRepository.duplicateItinerary(new Types.ObjectId(id), agencyId, newName);
    if (!duplicated) {
      throw new AppError("Itinerary not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toItineraryDTO(duplicated);
  }
}

export const itineraryService = new ItineraryService();