import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/async-handler";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { ChatService } from "./chat.service";
import { LeadRepository } from "../leads/lead.repository";
import { NotFoundError, UnauthorizedError, ValidationError } from "../../shared/errors/app-error";
import { resolveAgencyId } from "../../shared/utils/agency-context";

async function getParticipant(req: Request): Promise<{ id: string; userId: string; role: "traveller" | "agency" }> {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  if (req.user.roleKey === "traveller") {
    return { id: req.user.sub, userId: req.user.sub, role: "traveller" };
  }
  const agencyId = resolveAgencyId(req);
  return { id: String(agencyId), userId: req.user.sub, role: "agency" };
}

function getPagination(query: Request["query"], defaultLimit: number): { page: number; limit: number } {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? defaultLimit : Number(query.limit);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new ValidationError("Page and limit must be positive integers, with limit at most 100.");
  }
  return { page, limit };
}

export const startConversation = asyncHandler(async (req: Request, res: Response) => {
  const participant = await getParticipant(req);
  const { leadId } = req.body ?? {};
  if (leadId !== undefined && typeof leadId !== "string") {
    throw new ValidationError("Invalid lead ID.");
  }

  let travellerId: string;
  let agencyId: string;

  if (participant.role === "traveller") {
    const { agencyId: bodyAgencyId } = req.body ?? {};
    if (!bodyAgencyId || typeof bodyAgencyId !== "string") {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: { code: "BAD_REQUEST", message: "Agency ID is required." },
      });
      return;
    }
    travellerId = participant.userId;
    agencyId = bodyAgencyId;
    if (leadId) {
      const lead = await LeadRepository.findByIdAndTraveler(leadId, travellerId);
      if (!lead || String(lead.agencyId) !== agencyId) {
        throw new NotFoundError("Lead not found.");
      }
    }
  } else {
    if (!leadId) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: { code: "BAD_REQUEST", message: "Lead ID is required." },
      });
      return;
    }
    agencyId = participant.id;
    const lead = await LeadRepository.findByIdAndAgency(leadId, agencyId);
    if (!lead || !lead.travelerId) {
      throw new NotFoundError("Lead not found.");
    }
    travellerId = String(lead.travelerId);
  }

  const conversation = await ChatService.startConversation({
    travellerId,
    agencyId,
    leadId: leadId || undefined,
  });

  res.status(HTTP_STATUS.OK).json(success({ conversation }));
});

export const getConversation = asyncHandler(async (req: Request, res: Response) => {
  const participant = await getParticipant(req);

  const { id } = req.params;
  if (!id || typeof id !== "string") {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Conversation ID is required." },
    });
    return;
  }

  const conversation = await ChatService.getConversation(id, participant.id);
  if (!conversation) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Conversation not found." },
    });
    return;
  }

  res.status(HTTP_STATUS.OK).json(success({ conversation }));
});

export const listConversations = asyncHandler(async (req: Request, res: Response) => {
  const participant = await getParticipant(req);

  const result = await ChatService.listConversations(
    { ...getPagination(req.query, 20), leadId: req.query.leadId as string | undefined },
    participant.id,
    participant.role
  );

  res.status(HTTP_STATUS.OK).json(success(result));
});

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const participant = await getParticipant(req);

  const conversationId = req.params.id;
  const { content } = req.body ?? {};
  if (!conversationId || typeof conversationId !== "string") {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Conversation ID is required." },
    });
    return;
  }
  if (!content || typeof content !== "string") {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Message content is required." },
    });
    return;
  }

  const message = await ChatService.sendMessage({
    conversationId,
    senderId: participant.id,
    senderRole: participant.role,
    content,
  });

  res.status(HTTP_STATUS.OK).json(success({ message }));
});

export const listMessages = asyncHandler(async (req: Request, res: Response) => {
  const participant = await getParticipant(req);

  const { id } = req.params;
  if (!id || typeof id !== "string") {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Conversation ID is required." },
    });
    return;
  }

  const result = await ChatService.listMessages(
    { conversationId: id, ...getPagination(req.query, 50) },
    participant.id
  );

  res.status(HTTP_STATUS.OK).json(success(result));
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const participant = await getParticipant(req);

  const { id } = req.params;
  if (!id || typeof id !== "string") {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Conversation ID is required." },
    });
    return;
  }

  await ChatService.markAsRead(id, participant.id);
  res.status(HTTP_STATUS.OK).json(success({ marked: true }));
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const participant = await getParticipant(req);

  const { id } = req.params;
  if (!id || typeof id !== "string") {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Conversation ID is required." },
    });
    return;
  }

  const count = await ChatService.getUnreadCount(id, participant.id);
  res.status(HTTP_STATUS.OK).json(success({ unreadCount: count }));
});
