"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { chatApi } from "@/features/chat/api/chat.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle, Clock, Users, AlertTriangle, ChevronLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  senderId: string;
  senderRole: "traveller" | "agency";
  content: string;
  createdAt: string;
}

export default function TravellerConversationPage({
  conversationId,
}: {
  conversationId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const convData = await chatApi.get(conversationId);
      setConversation(convData.conversation);

      const msgData = await chatApi.listMessages(conversationId, 1, 100);
      setMessages(msgData.items.reverse());

      await chatApi.markAsRead(conversationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversation");
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || sending) return;

    setSending(true);
    try {
      const data = await chatApi.sendMessage(conversationId, inputValue.trim());
      setMessages((prev) => [...prev, data.message]);
      setInputValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900">Failed to load conversation</h2>
        <p className="text-gray-500 mt-2 max-w-md">{error}</p>
        <Button onClick={loadConversation} variant="outline" className="mt-6">
          <RefreshCw className="h-4 w-4 mr-2" />Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-200px)]">
        <Card className="flex-1 flex flex-col border-gray-100 shadow-sm overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <Users className="h-3 w-3" />
              <span>{conversation?.travellerId?.slice(-6)} (You)</span>
              <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                Traveller
              </span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageCircle className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">No messages yet. Start the conversation.</p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3 max-w-[80%]",
                  msg.senderId === conversation?.travellerId ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "rounded-2xl p-3 text-sm shadow-sm",
                    msg.senderId === conversation?.travellerId
                      ? "bg-primary text-white rounded-tr-none"
                      : "bg-gray-100 text-gray-900 rounded-tl-none"
                  )}
                >
                  <p className="leading-relaxed">{msg.content}</p>
                  <span className="text-[10px] mt-1 block text-right opacity-70">
                    {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>
          <CardFooter className="border-t border-gray-100">
            <form onSubmit={sendMessage} className="flex gap-2 p-3 bg-gray-50">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
                disabled={sending}
              />
              <Button type="submit" disabled={sending || !inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
