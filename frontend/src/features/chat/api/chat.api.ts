import { apiClient } from "@/lib/api/client";

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

export interface ConversationsResponse {
  items: ConversationDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MessagesResponse {
  items: MessageDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export const chatApi = {
  async startConversation(agencyId: string, leadId?: string): Promise<{ conversation: ConversationDTO }> {
    const data = await apiClient.post<{ data: { conversation: ConversationDTO } }>(
      "/chat/conversations",
      { body: { agencyId, leadId } }
    );
    return data.data;
  },

  async list(page = 1, limit = 20): Promise<ConversationsResponse> {
    const data = await apiClient.get<{ data: ConversationsResponse }>(
      `/chat/conversations?page=${page}&limit=${limit}`
    );
    return data.data;
  },

  async get(id: string): Promise<{ conversation: ConversationDTO }> {
    const data = await apiClient.get<{ data: { conversation: ConversationDTO } }>(
      `/chat/conversations/${encodeURIComponent(id)}`
    );
    return data.data;
  },

  async sendMessage(conversationId: string, content: string): Promise<{ message: MessageDTO }> {
    const data = await apiClient.post<{ data: { message: MessageDTO } }>(
      `/chat/conversations/${encodeURIComponent(conversationId)}/messages`,
      { body: { conversationId, content } }
    );
    return data.data;
  },

  async listMessages(conversationId: string, page = 1, limit = 50): Promise<MessagesResponse> {
    const data = await apiClient.get<{ data: MessagesResponse }>(
      `/chat/conversations/${encodeURIComponent(conversationId)}/messages?page=${page}&limit=${limit}`
    );
    return data.data;
  },

  async markAsRead(conversationId: string): Promise<{ marked: boolean }> {
    const data = await apiClient.post<{ data: { marked: boolean } }>(
      `/chat/conversations/${encodeURIComponent(conversationId)}/read`,
      { body: {} }
    );
    return data.data;
  },

  async getUnreadCount(conversationId: string): Promise<UnreadCountResponse> {
    const data = await apiClient.get<{ data: UnreadCountResponse }>(
      `/chat/conversations/${encodeURIComponent(conversationId)}/unread-count`
    );
    return data.data;
  },
};
