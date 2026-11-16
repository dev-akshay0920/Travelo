"use client";

import { useCallback, useEffect, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, Phone, Trash2, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AgencyModulePage } from "@/features/agency/components/agency-module-page";
import {
  createFollowUpApi,
  deleteFollowUpApi,
  listFollowUpsApi,
  listStaffApi,
  updateFollowUpApi,
} from "@/features/agency/api/crm.api";
import { formatDateTime } from "@/features/agency/lib/format";
import type { FollowUpChannel, FollowUpReminder } from "@/features/leads/types/lead.types";
import type { StaffMember } from "@/features/agency/types/crm.types";

type StatusFilter = "all" | "open" | "completed";

const PAGE_LIMIT = 20;
const CHANNELS: FollowUpChannel[] = ["phone", "email", "whatsapp", "meeting"];

export default function AgencyFollowUpsPage() {
  const [reminders, setReminders] = useState<FollowUpReminder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [reminderFrom, setReminderFrom] = useState("");
  const [reminderTo, setReminderTo] = useState("");
  const [staffFilter, setStaffFilter] = useState("");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState({
    leadId: "",
    staffId: "",
    reminderAt: "",
    title: "",
    channel: "phone" as FollowUpChannel,
    notes: "",
  });

  const loadStaff = useCallback(async () => {
    try {
      const value = await listStaffApi({ page: 1, limit: 100 });
      setStaff(value.items);
    } catch {
      setStaff([]);
    }
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      await loadStaff();
      const value = await listFollowUpsApi({
        page,
        limit: PAGE_LIMIT,
        isCompleted: statusFilter === "completed" ? true : statusFilter === "open" ? false : undefined,
        staffId: staffFilter || undefined,
        reminderFrom: reminderFrom || undefined,
        reminderTo: reminderTo || undefined,
      });
      setReminders(value.items);
      setTotal(value.total);
    } catch {
      setReminders([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, staffFilter, reminderFrom, reminderTo, loadStaff]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [statusFilter, staffFilter, reminderFrom, reminderTo]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const handleToggle = async (id: string, isCompleted: boolean) => {
    try {
      await updateFollowUpApi(id, { isCompleted });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update reminder.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this follow-up?")) return;
    try {
      await deleteFollowUpApi(id);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete reminder.");
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.reminderAt || !form.leadId.trim()) {
      alert("Title, lead and reminder time are required.");
      return;
    }
    try {
      await createFollowUpApi({
        leadId: form.leadId,
        staffId: form.staffId || undefined,
        reminderAt: new Date(form.reminderAt).toISOString(),
        title: form.title.trim(),
        channel: form.channel,
        notes: form.notes.trim() || undefined,
      });
      setDialog(false);
      setForm({
        leadId: "",
        staffId: "",
        reminderAt: "",
        title: "",
        channel: "phone",
        notes: "",
      });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to schedule follow-up.");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const channelLabel = (channel: FollowUpChannel) => {
    const icons: Record<FollowUpChannel, string> = {
      phone: "Phone",
      email: "Email",
      whatsapp: "WhatsApp",
      meeting: "Meeting",
    };
    return icons[channel] ?? channel;
  };

  return (
    <AgencyModulePage
      tab="followups"
      title="Follow-ups"
      description="Scheduled reminders across your leads and bookings."
      actions={
        <>
          <Button onClick={() => setDialog(true)}>
            <Calendar className="size-4 mr-2" aria-hidden="true" />
            Schedule follow-up
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reminder-from">From</Label>
            <Input
              id="reminder-from"
              type="datetime-local"
              value={reminderFrom}
              onChange={(event) => setReminderFrom(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reminder-to">To</Label>
            <Input
              id="reminder-to"
              type="datetime-local"
              value={reminderTo}
              onChange={(event) => setReminderTo(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="staff-filter">Staff</Label>
            <Select value={staffFilter} onValueChange={(value) => setStaffFilter(value ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                {staff.map((member) => (
                  <SelectItem key={member.userId} value={member.userId}>
                    {member.userName ?? member.userEmail ?? member.userId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-caption text-muted-foreground">
            {total} follow-up{(total === 1 ? "" : "s")}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || isLoading}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Button>
            <span className="text-caption text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded border border-border/50 animate-pulse" />
            ))}
          </div>
        ) : reminders.length === 0 ? (
          <div className="rounded-lg border border-border/50 p-8 text-center">
            <p className="text-muted-foreground">No follow-up reminders match these filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50 rounded-lg border border-border">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-body-sm font-medium">{reminder.title}</p>
                  <p className="mt-0.5 text-caption text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3" aria-hidden="true" />
                    {formatDateTime(reminder.reminderAt)}
                  </p>
                  <p className="mt-0.5 text-caption text-muted-foreground flex items-center gap-1">
                    <User className="size-3" aria-hidden="true" />
                    {reminder.staffName ?? "-"} &middot; {channelLabel(reminder.channel)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggle(reminder.id, !reminder.isCompleted)}
                  >
                    {reminder.isCompleted ? (
                      <Clock className="size-4" aria-hidden="true" />
                    ) : (
                      <Phone className="size-4" aria-hidden="true" />
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(reminder.id)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule follow-up</DialogTitle>
            <DialogDescription>Set a reminder tied to a lead.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="followup-title">Title</Label>
                <Input
                  id="followup-title"
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="followup-channel">Channel</Label>
                <Select value={form.channel} onValueChange={(value) => setForm((current) => ({ ...current, channel: value as FollowUpChannel }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANNELS.map((channel) => (
                      <SelectItem key={channel} value={channel}>
                        {channel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="followup-at">Remind at</Label>
              <Input id="followup-at" type="datetime-local" value={form.reminderAt} onChange={(event) => setForm((current) => ({ ...current, reminderAt: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="followup-staff">Staff (optional)</Label>
              <Select value={form.staffId} onValueChange={(value) => setForm((current) => ({ ...current, staffId: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {staff.map((member) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      {member.userName ?? member.userEmail ?? member.userId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="followup-lead">Lead ID (optional)</Label>
              <Input
                id="followup-lead"
                value={form.leadId}
                onChange={(event) => setForm((current) => ({ ...current, leadId: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="followup-notes">Notes</Label>
              <Input
                id="followup-notes"
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Schedule</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AgencyModulePage>
  );
}
