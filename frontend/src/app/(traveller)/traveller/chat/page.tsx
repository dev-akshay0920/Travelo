"use client";

import { useState, useEffect, useCallback } from "react";
import { chatApi } from "@/features/chat/api/chat.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function TravellerChatPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await chatApi.list(page, 20);
      setConversations(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

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
        <h2 className="text-lg font-semibold text-gray-900">Failed to load messages</h2>
        <p className="text-gray-500 mt-2 max-w-md">{error}</p>
        <Button onClick={loadConversations} variant="outline" className="mt-6">
          <RefreshCw className="h-4 w-4 mr-2" />Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
            <MessageCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No conversations yet</h3>
          <p className="text-gray-500 max-w-md mt-2">
            Start a conversation with an agency from a package page or your leads.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {conversations.map((conv) => (
              <Card
                key={conv.id}
                className="cursor-pointer hover:border-primary/50 transition-colors border border-gray-100"
                onClick={() => {}}
              >
                <CardHeader className="pb-2">
                  <div className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Conversation</CardTitle>
                    {conv.unreadCount && conv.unreadCount > 0 && (
                      <Badge variant="secondary">{conv.unreadCount}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span>{conv.agencyId.slice(-6)}</span>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {conv.lastMessageAt ? "Last message" : "No messages yet"}
                      </p>
                      <span className="text-xs text-gray-500">
                        {conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString("en-IN") : "—"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)} variant="outline">
                Previous
              </Button>
              <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
              <Button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} variant="outline">
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
