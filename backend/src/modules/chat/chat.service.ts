import type {
  ConversationFilters,
  MessageFilters,
} from "./chat.repository";
import { ChatRepository } from "./chat.repository";
import { ForbiddenError, NotFoundError, ValidationError } from "../../shared/errors/app-error";
import { Types } from "mongoose";
import { AgencyRepository } from "../agencies/agency.repository";
import { LeadRepository } from "../leads/lead.repository";

export interface StartConversationInput {
  travellerId: string;
  agencyId: string;
  leadId?: string;
}

export interface SendMessageInput {
  conversationId: string;
  senderId: string;
  senderRole: "traveller" | "agency";
  content: string;
}

export interface ConversationDTO {
  id: string;
  travellerId: string;
  agencyId: string;
  leadId?: string;
  status: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageDTO {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: "traveller" | "agency";
  content: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const ChatService = {
  async startConversation(input: StartConversationInput): Promise<ConversationDTO> {
    const { travellerId, agencyId, leadId } = input;

    if (!Types.ObjectId.isValid(travellerId)) {
      throw new ValidationError("Invalid traveller ID.");
    }
    if (!Types.ObjectId.isValid(agencyId)) {
      throw new ValidationError("Invalid agency ID.");
    }
    if (leadId && !Types.ObjectId.isValid(leadId)) {
      throw new ValidationError("Invalid lead ID.");
    }

    const agency = await AgencyRepository.findById(agencyId);
    if (!agency || agency.status !== "approved") {
      throw new NotFoundError("Agency not found.");
    }
    if (leadId) {
      const lead = await LeadRepository.findByIdAndTraveler(leadId, travellerId);
      if (!lead || String(lead.agencyId) !== agencyId) {
        throw new NotFoundError("Lead not found.");
      }
    }

    const existing = await ChatRepository.findConversation(
      new Types.ObjectId(travellerId),
      new Types.ObjectId(agencyId)
    );

    if (existing) {
      return {
        id: String(existing._id),
        travellerId: String(existing.travellerId),
        agencyId: String(existing.agencyId),
        leadId: existing.leadId ? String(existing.leadId) : undefined,
        status: existing.status,
        lastMessageAt: existing.lastMessageAt?.toISOString(),
        createdAt: existing.createdAt.toISOString(),
        updatedAt: existing.updatedAt.toISOString(),
      };
    }

    const created = await ChatRepository.create({
      travellerId: new Types.ObjectId(travellerId),
      agencyId: new Types.ObjectId(agencyId),
      leadId: leadId ? new Types.ObjectId(leadId) : undefined,
    });

    return {
      id: String(created._id),
      travellerId: String(created.travellerId),
      agencyId: String(created.agencyId),
      leadId: created.leadId ? String(created.leadId) : undefined,
      status: created.status,
      lastMessageAt: created.lastMessageAt?.toISOString(),
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  },

  async getConversation(id: string, userId: string): Promise<ConversationDTO | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const conv = await ChatRepository.findById(id);
    if (!conv) {
      return null;
    }
    if (String(conv.travellerId) !== userId && String(conv.agencyId) !== userId) {
      return null;
    }
    return {
      id: String(conv._id),
      travellerId: String(conv.travellerId),
      agencyId: String(conv.agencyId),
      leadId: conv.leadId ? String(conv.leadId) : undefined,
      status: conv.status,
      lastMessageAt: conv.lastMessageAt?.toISOString(),
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
    };
  },

  async listConversations(filters: ConversationFilters, userId: string, roleKey: "traveller" | "agency"): Promise<{ items: ConversationDTO[]; total: number; page: number; limit: number; totalPages: number }> {
    const queryFilters: ConversationFilters = { ...filters, status: "active" };
    if (roleKey === "traveller") {
      queryFilters.travellerId = userId;
    } else if (roleKey === "agency") {
      queryFilters.agencyId = userId;
    }

    const result = await ChatRepository.listConversations(queryFilters);
    return {
      items: result.items.map((item) => ({
        id: item.id,
        travellerId: item.travellerId,
        agencyId: item.agencyId,
        leadId: item.leadId,
        status: item.status,
        lastMessageAt: item.lastMessageAt?.toISOString(),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  },

  async sendMessage(input: SendMessageInput): Promise<MessageDTO> {
    const { conversationId, senderId, senderRole, content } = input;

    if (!Types.ObjectId.isValid(conversationId)) {
      throw new ValidationError("Invalid conversation ID.");
    }
    if (!Types.ObjectId.isValid(senderId)) {
      throw new ValidationError("Invalid sender ID.");
    }
    if (!content || content.trim().length === 0) {
      throw new ValidationError("Message content is required.");
    }
    if (content.trim().length > 2000) {
      throw new ValidationError("Message content is too long.");
    }

    const conversation = await ChatRepository.findById(conversationId);
    if (!conversation) {
      throw new NotFoundError("Conversation not found.");
    }

    const isTraveller = String(conversation.travellerId) === senderId;
    const isAgency = String(conversation.agencyId) === senderId;
    if (!isTraveller && !isAgency) {
      throw new NotFoundError("Conversation not found.");
    }
    if ((senderRole === "traveller") !== isTraveller) {
      throw new ForbiddenError("Sender role does not match the conversation participant.");
    }

    const created = await ChatRepository.createMessage({
      conversationId: new Types.ObjectId(conversationId),
      senderId: new Types.ObjectId(senderId),
      senderRole,
      content: content.trim(),
    });

    await ChatRepository.updateLastMessage(new Types.ObjectId(conversationId), created.createdAt);

    return {
      id: String(created._id),
      conversationId: String(created.conversationId),
      senderId: String(created.senderId),
      senderRole: created.senderRole,
      content: created.content,
      readAt: created.readAt?.toISOString(),
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  },

  async listMessages(filters: MessageFilters, userId: string): Promise<{ items: MessageDTO[]; total: number; page: number; limit: number; totalPages: number }> {
    // Verify user is a participant of the conversation
    if (!Types.ObjectId.isValid(filters.conversationId)) {
      throw new ValidationError("Invalid conversation ID.");
    }
    const conversation = await ChatRepository.findById(filters.conversationId);
    if (!conversation) {
      throw new NotFoundError("Conversation not found.");
    }
    if (String(conversation.travellerId) !== userId && String(conversation.agencyId) !== userId) {
      throw new NotFoundError("Conversation not found.");
    }

    const result = await ChatRepository.listMessages(filters);
    return {
      items: result.items.map((item) => ({
        id: item.id,
        conversationId: item.conversationId,
        senderId: item.senderId,
        senderRole: item.senderRole,
        content: item.content,
        readAt: item.readAt?.toISOString(),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  },

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(conversationId)) {
      throw new ValidationError("Invalid conversation ID.");
    }
    const conversation = await ChatRepository.findById(conversationId);
    if (!conversation || (String(conversation.travellerId) !== userId && String(conversation.agencyId) !== userId)) {
      throw new NotFoundError("Conversation not found.");
    }
    await ChatRepository.markAsRead(new Types.ObjectId(conversationId), new Types.ObjectId(userId));
  },

  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    if (!Types.ObjectId.isValid(conversationId)) {
      throw new ValidationError("Invalid conversation ID.");
    }
    const conversation = await ChatRepository.findById(conversationId);
    if (!conversation || (String(conversation.travellerId) !== userId && String(conversation.agencyId) !== userId)) {
      throw new NotFoundError("Conversation not found.");
    }
    return ChatRepository.getUnreadCount(new Types.ObjectId(conversationId), new Types.ObjectId(userId));
  },
};
