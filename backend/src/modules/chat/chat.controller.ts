import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/async-handler";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { ChatService } from "./chat.service";

export const startConversation = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
    return;
  }

  const { agencyId, leadId } = req.body;
  if (!agencyId || typeof agencyId !== "string") {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Agency ID is required." },
    });
    return;
  }

  const conversation = await ChatService.startConversation({
    travellerId: req.user.sub,
    agencyId,
    leadId,
  });

  res.status(HTTP_STATUS.OK).json(success({ conversation }));
});

export const getConversation = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
    return;
  }

  const { id } = req.params;
  if (!id || typeof id !== "string") {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Conversation ID is required." },
    });
    return;
  }

  const conversation = await ChatService.getConversation(id, req.user.sub);
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
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
    return;
  }

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 20;

  const result = await ChatService.listConversations(
    { page, limit },
    req.user.sub,
    req.user.roleKey as "traveller" | "agency"
  );

  res.status(HTTP_STATUS.OK).json(success(result));
});

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
    return;
  }

  const { conversationId, content } = req.body;
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
    senderId: req.user.sub,
    senderRole: req.user.roleKey === "agency" ? "agency" : "traveller",
    content,
  });

  res.status(HTTP_STATUS.OK).json(success({ message }));
});

export const listMessages = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
    return;
  }

  const { id } = req.params;
  if (!id || typeof id !== "string") {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Conversation ID is required." },
    });
    return;
  }

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 50;

  const result = await ChatService.listMessages(
    { conversationId: id, page, limit },
    req.user.sub
  );

  res.status(HTTP_STATUS.OK).json(success(result));
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
    return;
  }

  const { id } = req.params;
  if (!id || typeof id !== "string") {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Conversation ID is required." },
    });
    return;
  }

  await ChatService.markAsRead(id, req.user.sub);
  res.status(HTTP_STATUS.OK).json(success({ marked: true }));
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
    return;
  }

  const { id } = req.params;
  if (!id || typeof id !== "string") {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Conversation ID is required." },
    });
    return;
  }

  const count = await ChatService.getUnreadCount(id, req.user.sub);
  res.status(HTTP_STATUS.OK).json(success({ unreadCount: count }));
});
