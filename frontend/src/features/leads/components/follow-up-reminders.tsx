"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, CheckCircle, User, Calendar, MessageSquare, Phone, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getDueFollowUpRemindersApi, updateFollowUpReminderApi } from "@/features/leads/api/followups.api";
import type { FollowUpReminder } from "@/features/leads/types/lead.types";

interface FollowUpReminderListProps {
  agencyId: string;
}

const channelIcons: Record<string, typeof Phone> = {
  phone: Phone,
  email: Mail,
  whatsapp: MessageSquare,
  meeting: Calendar,
};

export function FollowUpReminderList({ agencyId }: FollowUpReminderListProps) {
  const [reminders, setReminders] = useState<FollowUpReminder[]>([]);
  const [isDueLoading, setIsDueLoading] = useState(true);

  const loadDue = useCallback(async () => {
    setIsDueLoading(true);
    try {
      const due = await getDueFollowUpRemindersApi();
      setReminders(due);
    } catch {
      toast.error("Failed to load due reminders");
    } finally {
      setIsDueLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDue();
  }, [loadDue]);

  const handleComplete = async (id: string) => {
    try {
      await updateFollowUpReminderApi(id, { isCompleted: true });
      toast.success("Follow-up marked as complete");
      await loadDue();
    } catch {
      toast.error("Failed to update reminder");
    }
  };

  const getTimeUntil = (reminderAt: string) => {
    const now = new Date();
    const target = new Date(reminderAt);
    const diff = target.getTime() - now.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 0) return "Overdue";
    if (mins < 60) return `${mins}m left`;
    if (hours < 24) return `${hours}h left`;
    return `${days}d left`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Follow-ups</h2>
          <p className="text-sm text-muted-foreground">Reminders for leads that need your attention</p>
        </div>
      </div>

      {isDueLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded border border-border/50 animate-pulse" />
          ))}
        </div>
      ) : reminders.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Clock className="h-10 w-10 opacity-50" />
            <p className="text-body-sm">No follow-up reminders due.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder) => {
            const Icon = channelIcons[reminder.channel] || Clock;
            const isOverdue = reminder.reminderAt < new Date().toISOString();
            return (
              <Card key={reminder.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold truncate">{reminder.title}</h4>
                        <Badge variant={isOverdue ? "destructive" : "secondary"} className="shrink-0">
                          {isOverdue ? "Overdue" : getTimeUntil(reminder.reminderAt)}
                        </Badge>
                      </div>
                      <p className="text-body-sm text-muted-foreground truncate">{reminder.notes}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Icon className="h-3 w-3" />
                          {reminder.channel}
                        </span>
                        {reminder.staffName && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {reminder.staffName}
                          </span>
                        )}
                        <span>{new Date(reminder.reminderAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleComplete(reminder.id)}
                      className="shrink-0 text-emerald-600 hover:text-emerald-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}