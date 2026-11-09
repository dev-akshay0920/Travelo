import { Schema, model, models } from "mongoose";
import type { Document, Types } from "mongoose";

export type ConversationStatus = "active" | "archived" | "closed";
export type MessageSenderRole = "traveller" | "agency";

export interface ConversationDocument extends Document {
  travellerId: Types.ObjectId;
  agencyId: Types.ObjectId;
  leadId?: Types.ObjectId;
  status: ConversationStatus;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageDocument extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  senderRole: MessageSenderRole;
  content: string;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<ConversationDocument>(
  {
    travellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    agencyId: {
      type: Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
      index: true,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "archived", "closed"],
      default: "active",
      required: true,
    },
    lastMessageAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

ConversationSchema.index({ travellerId: 1, agencyId: 1, status: 1 }, { unique: true, partialFilterExpression: { status: "active" } });
ConversationSchema.index({ travellerId: 1, updatedAt: -1 });
ConversationSchema.index({ agencyId: 1, updatedAt: -1 });

const MessageSchema = new Schema<MessageDocument>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderRole: {
      type: String,
      enum: ["traveller", "agency"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });
MessageSchema.index({ conversationId: 1, readAt: 1 });

export const Conversation = models.Conversation || model<ConversationDocument>("Conversation", ConversationSchema);
export const Message = models.Message || model<MessageDocument>("Message", MessageSchema);
