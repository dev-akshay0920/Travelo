import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/async-handler";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { ChatService } from "./chat.service";
import { AgencyRepository } from "../agencies/agency.repository";
import { ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from "../../shared/errors/app-error";

async function getParticipant(req: Request): Promise<{ id: string; userId: string; role: "traveller" | "agency" }> {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  if (req.user.roleKey === "traveller") {
    return { id: req.user.sub, userId: req.user.sub, role: "traveller" };
  }
  if (req.user.roleKey === "agency") {
    const agency = await AgencyRepository.findByOwnerUserId(req.user.sub);
    if (!agency) {
      throw new NotFoundError("Agency profile not found.");
    }
    return { id: String(agency._id), userId: req.user.sub, role: "agency" };
  }
  throw new ForbiddenError("Chat access is not available for this account.");
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
  if (participant.role !== "traveller") {
    throw new ForbiddenError("Only travelers can start conversations.");
  }

  const { agencyId, leadId } = req.body ?? {};
  if (!agencyId || typeof agencyId !== "string") {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Agency ID is required." },
    });
    return;
  }
  if (leadId !== undefined && typeof leadId !== "string") {
    throw new ValidationError("Invalid lead ID.");
  }

  const conversation = await ChatService.startConversation({
    travellerId: participant.userId,
    agencyId,
    leadId,
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
    getPagination(req.query, 20),
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
