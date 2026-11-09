import { Types } from "mongoose";
import type { ConversationDocument, MessageDocument, ConversationStatus, MessageSenderRole } from "./chat.model";
import { Conversation, Message } from "./chat.model";

export interface ConversationCreateInput {
  travellerId: Types.ObjectId;
  agencyId: Types.ObjectId;
  leadId?: Types.ObjectId;
}

export interface MessageCreateInput {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  senderRole: MessageSenderRole;
  content: string;
}

export interface ConversationFilters {
  travellerId?: string;
  agencyId?: string;
  status?: ConversationStatus;
  page?: number;
  limit?: number;
}

export interface MessageFilters {
  conversationId: string;
  page?: number;
  limit?: number;
}

export interface ConversationListItem {
  id: string;
  travellerId: string;
  agencyId: string;
  leadId?: string;
  status: ConversationStatus;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageListItem {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: MessageSenderRole;
  content: string;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const ChatRepository = {
  async findConversation(travellerId: Types.ObjectId, agencyId: Types.ObjectId): Promise<ConversationDocument | null> {
    if (!Types.ObjectId.isValid(travellerId) || !Types.ObjectId.isValid(agencyId)) {
      return null;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return await Conversation.findOne({ travellerId, agencyId, status: "active" }).exec();
  },

  async findById(id: string): Promise<ConversationDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return await Conversation.findById(id).exec();
  },

  async create(input: ConversationCreateInput): Promise<ConversationDocument> {
    const conversation = new Conversation(input);
    return conversation.save();
  },

  async updateLastMessage(conversationId: Types.ObjectId, lastMessageAt: Date): Promise<void> {
    if (!Types.ObjectId.isValid(conversationId)) {
      return;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    await Conversation.findByIdAndUpdate(conversationId, { $set: { lastMessageAt } }).exec();
  },

  async listConversations(filters: ConversationFilters): Promise<{ items: ConversationListItem[]; total: number; page: number; limit: number; totalPages: number }> {
    const query: Record<string, unknown> = {};
    if (filters.travellerId && Types.ObjectId.isValid(filters.travellerId)) {
      query.travellerId = filters.travellerId;
    }
    if (filters.agencyId && Types.ObjectId.isValid(filters.agencyId)) {
      query.agencyId = filters.agencyId;
    }
    if (filters.status) {
      query.status = filters.status;
    }

    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      Conversation.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).exec(),
      Conversation.countDocuments(query).exec(),
    ]);

    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

    return {
      items: items.map((doc: ConversationDocument) => ({
        id: String(doc._id),
        travellerId: String(doc.travellerId),
        agencyId: String(doc.agencyId),
        leadId: doc.leadId ? String(doc.leadId) : undefined,
        status: doc.status,
        lastMessageAt: doc.lastMessageAt,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),
      total,
      page,
      limit,
      totalPages,
    };
  },

  async createMessage(input: MessageCreateInput): Promise<MessageDocument> {
    const message = new Message(input);
    return message.save();
  },

  async listMessages(filters: MessageFilters): Promise<{ items: MessageListItem[]; total: number; page: number; limit: number; totalPages: number }> {
    if (!Types.ObjectId.isValid(filters.conversationId)) {
      return { items: [], total: 0, page: 1, limit: filters.limit || 20, totalPages: 0 };
    }

    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 50;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      Message.find({ conversationId: filters.conversationId }).sort({ createdAt: 1 }).skip(skip).limit(limit).exec(),
      Message.countDocuments({ conversationId: filters.conversationId }).exec(),
    ]);

    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

    return {
      items: items.map((doc: MessageDocument) => ({
        id: String(doc._id),
        conversationId: String(doc.conversationId),
        senderId: String(doc.senderId),
        senderRole: doc.senderRole,
        content: doc.content,
        readAt: doc.readAt,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),
      total,
      page,
      limit,
      totalPages,
    };
  },

  async markAsRead(conversationId: Types.ObjectId, senderId: Types.ObjectId): Promise<void> {
    if (!Types.ObjectId.isValid(conversationId) || !Types.ObjectId.isValid(senderId)) {
      return;
    }
    await Message.updateMany(
      { conversationId, senderId: { $ne: senderId }, readAt: { $exists: false } },
      { $set: { readAt: new Date() } }
    ).exec();
  },

  async getUnreadCount(conversationId: Types.ObjectId, senderId: Types.ObjectId): Promise<number> {
    if (!Types.ObjectId.isValid(conversationId) || !Types.ObjectId.isValid(senderId)) {
      return 0;
    }
    return Message.countDocuments({
      conversationId,
      senderId: { $ne: senderId },
      readAt: { $exists: false },
    }).exec();
  },
};
