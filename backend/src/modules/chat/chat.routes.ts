import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  startConversation,
  getConversation,
  listConversations,
  sendMessage,
  listMessages,
  markAsRead,
  getUnreadCount,
} from "./chat.controller";

const router = Router();

router.use(authMiddleware);

router.post("/conversations", startConversation);
router.get("/conversations", listConversations);
router.get("/conversations/:id", getConversation);
router.post("/conversations/:id/messages", sendMessage);
router.get("/conversations/:id/messages", listMessages);
router.post("/conversations/:id/read", markAsRead);
router.get("/conversations/:id/unread-count", getUnreadCount);

export const chatRouter = router;
