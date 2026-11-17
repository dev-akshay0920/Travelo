"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronRight, Clock, Send, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chatApi } from "@/features/chat/api/chat.api";
import type { ConversationDTO, MessageDTO } from "@/features/chat/api/chat.api";
import { formatDateTime } from "@/features/agency/lib/format";

interface ChatProps {
  agencyId: string;
  leadId?: string;
  className?: string;
}

export function Chat({ agencyId, leadId, className }: ChatProps) {
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDTO | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await chatApi.list(1, 50);
      setConversations(data.items);
      if (!selectedConversation && data.items.length > 0) {
        setSelectedConversation(data.items[0]);
      }
    } catch {
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (selectedConversation) {
      void chatApi.listMessages(selectedConversation.id, 1, 50).then((data) => {
        setMessages(data.items);
      });
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedConversation) return;

    setIsSending(true);
    try {
      const data = await chatApi.sendMessage(selectedConversation.id, inputValue.trim());
      setInputValue("");
      setMessages((prev) => [...prev, data.message]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id
            ? { ...c, lastMessageAt: data.message.createdAt }
            : c
        )
      );
    } catch {
      // error handled by toast in caller
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectConversation = (conversation: ConversationDTO) => {
    setSelectedConversation(conversation);
  };

  const startConversation = async () => {
    if (!leadId) return;
    try {
      const data = await chatApi.startConversation(agencyId, leadId);
      setConversations((prev) => [data.conversation, ...prev]);
      setSelectedConversation(data.conversation);
    } catch (err) {
      // Error handled by caller
      throw err;
    }
  };

  return (
    <div className={`space-y-4 ${className ?? ""}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Chat</h2>
        {!selectedConversation && leadId ? (
          <Button
            size="sm"
            variant="outline"
            onClick={startConversation}
            disabled={isLoading}
          >
            <User className="size-4 mr-2" aria-hidden="true" />
            Start conversation
          </Button>
        ) : null}
      </div>

      {isLoading && !conversations.length ? (
        <div className="h-48 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-4 w-24 rounded-full bg-muted animate-pulse" />
            <p className="text-xs text-muted-foreground">Loading conversations...</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-[500px]">
          {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center rounded-lg border border-border/50 p-6 text-center">
              <p className="text-muted-foreground text-sm">
                No conversations yet. Start a conversation to begin chatting with the traveller.
              </p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex-1 min-h-0 border-t border-border/50 px-4 py-3">
                <ScrollArea className="h-full w-full">
                  <ScrollAreaScrollbar className="h-full w-2"/>
                  <div className="space-y-3">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center py-10">
                        <p className="text-muted-foreground text-sm">No messages yet.</p>
                      </div>
                    ) : (
                      <>
                        {messages.map((message) => {
                          const isMe = message.senderRole === "agency";
                          return (
                            <div
                              key={message.id}
                              className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}
                            >
                              <div
                                className={`max-w-[80%] px-3 py-2 rounded-lg rounded-tr-lg rounded-bl-lg ${
                                  isMe
                                    ? "bg-blue-600 text-white"
                                    : "bg-muted text-foreground"
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <p className="text-[10px] text-blue-200/70 mt-1 text-right">
                                  {formatDateTime(message.createdAt)}
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>
                </ScrollArea>
              </div>
              <div className="border-t border-border/50 p-3">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type a message…"
                    disabled={isSending}
                    className="flex-1"
   