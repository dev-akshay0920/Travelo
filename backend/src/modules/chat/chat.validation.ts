import { z } from "zod";

export const startConversationSchema = z.object({
  agencyId: z.string().trim().min(1, "Agency ID is required."),
  leadId: z.string().trim().min(1, "Lead ID is required.").optional(),
});

export const sendMessageSchema = z.object({
  conversationId: z.string().trim().min(1, "Conversation ID is required."),
  content: z.string().trim().min(1, "Message content is required.").max(2000, "Message too long."),
});

export type StartConversationInput = z.infer<typeof startConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
