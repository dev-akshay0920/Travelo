"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, ListTodo, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageStack } from "@/components/shared/page-container";
import { AgencyModulePage } from "@/features/agency/components/agency-module-page";
import { StatCard, StatusPill } from "@/features/agency/components/crm-ui";
import {
  createTaskApi,
  deleteTaskApi,
  getTaskStatusCountsApi,
  listOverdueTasksApi,
  listStaffApi,
  listTasksApi,
  updateTaskApi,
  updateTaskStatusApi,
} from "@/features/agency/api/crm.api";
import {
  dateTimeInputToIso,
  formatDateTime,
  isOverdue,
  toDateTimeInputValue,
} from "@/features/agency/lib/format";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_TYPES,
  titleCase,
  type StaffMember,
  type TaskItem,
  type TaskPriority,
  type TaskStatus,
  type TaskType,
} from "@/features/agency/types/crm.types";

const EMPTY_FORM = {
  title: "",
  description: "",
  type: "follow_up" as TaskType,
  status: "pending" as TaskStatus,
  priority: "medium" as TaskPriority,
  dueAt: "",
  reminderAt: "",
  assignedTo: "",
  leadId: "",
  bookingId: "",
  invoiceId: "",
};

export default function AgencyTasksPage() {
  const [items, setItems] = useState<TaskItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus | "all">("all");
  const [type, setType] = useState<TaskType | "all">("all");
  const [priority, setPriority] = useState<TaskPriority | "all">("all");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [overdue, setOverdue] = useState<TaskItem[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const staffNames = useMemo(() => {
    const map = new Map<string, string>();
    staff.forEach((member) => {
      map.set(member.userId, member.userName ?? member.userEmail ?? member.userId);
    });
    return map;
  }, [staff]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listTasksApi({
        page,
        limit: 20,
        search: search || undefined,
        status: status === "all" ? undefined : status,
        type: type === "all" ? undefined : type,
        priority: priority === "all" ? undefined : priority,
      });
      setItems(response.items);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load tasks.");
    } finally {
      setIsLoading(false);
    }
  }, [page, priority, search, status, type]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getTaskStatusCountsApi().catch(() => ({}) as Record<string, number>),
      listOverdueTasksApi().catch(() => [] as TaskItem[]),
    ]).then(([nextCounts, nextOverdue]) => {
      if (cancelled) return;
      setCounts(nextCounts);
      setOverdue(nextOverdue);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    listStaffApi({ page: 1, limit: 100, isActive: true })
      .then((response) => {
        if (!cancelled) setStaff(response.items);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshSummary = useCallback(async () => {
    const [nextCounts, nextOverdue] = await Promise.all([
      getTaskStatusCountsApi().catch(() => ({}) as Record<string, number>),
      listOverdueTasksApi().catch(() => [] as TaskItem[]),
    ]);
    setCounts(nextCounts);
    setOverdue(nextOverdue);
  }, []);

  const updateForm = (key: keyof typeof EMPTY_FORM, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, assignedTo: staff[0]?.userId ?? "" });
    setIsDialogOpen(true);
  };

  const openEdit = (task: TaskItem) => {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description ?? "",
      type: task.type,
      status: task.status,
      priority: task.priority,
      dueAt: toDateTimeInputValue(task.dueAt),
      reminderAt: toDateTimeInputValue(task.reminderAt),
      assignedTo: task.assignedTo,
      leadId: task.leadId ?? "",
      bookingId: task.bookingId ?? "",
      invoiceId: task.invoiceId ?? "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Task title is required.");
      return;
    }
    if (!form.assignedTo) {
      toast.error("Select who this task is assigned to.");
      return;
    }
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      type: form.type,
      status: form.status,
      priority: form.priority,
      dueAt: dateTimeInputToIso(form.dueAt),
      reminderAt: dateTimeInputToIso(form.reminderAt),
      assignedTo: form.assignedTo,
      leadId: form.leadId.trim() || undefined,
      bookingId: form.bookingId.trim() || undefined,
      invoiceId: form.invoiceId.trim() || undefined,
    };
    setIsSaving(true);
    try {
      if (editingId) {
        await updateTaskApi(editingId, payload);
        toast.success("Task updated.");
      } else {
        await createTaskApi(payload);
        toast.success("Task created.");
      }
      setIsDialogOpen(false);
      await Promise.all([load(), refreshSummary()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save task.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatus = async (task: TaskItem, next: TaskStatus) => {
    try {
      await updateTaskStatusApi(task.id, next);
      toast.success(`Task marked ${titleCase(next)}.`);
      await Promise.all([load(), refreshSummary()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update task.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTaskApi(id);
      toast.success("Task deleted.");
      await Promise.all([load(), refreshSummary()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete task.");
    }
  };

  return (
    <AgencyModulePage
      tab="tasks"
      title="Tasks"
      description="Follow-ups, reminders and internal work items."
      actions={
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          New task
        </Button>
      }
    >
      <PageStack>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Pending" value={counts.pending ?? 0} icon={ListTodo} tone="warning" />
          <StatCard
            label="In progress"
            value={counts.in_progress ?? 0}
            icon={Clock}
            tone="default"
          />
          <StatCard
            label="Completed"
            value={counts.completed ?? 0}
            icon={CheckCircle2}
            tone="success"
          />
          <StatCard label="Overdue" value={overdue.length} icon={Clock} tone="danger" />
        </div>

        {overdue.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Overdue tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {overdue.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{task.title}</p>
                    <p className="text-caption text-muted-foreground">
                      Due {formatDateTime(task.dueAt)}
                      {task.assignedTo ? ` - ${staffNames.get(task.assignedTo) ?? "Staff"}` : ""}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleStatus(task, "completed")}>
                    Mark complete
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>All tasks</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      setPage(1);
                      setSearch(searchInput.trim());
                    }
                  }}
                  placeholder="Search tasks"
                  className="pl-9 sm:w-44"
                />
              </div>
              <Select
                value={status}
                onValueChange={(value) => {
                  setPage(1);
                  setStatus(value as TaskStatus | "all");
                }}
              >
                <SelectTrigger className="sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {TASK_STATUSES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {titleCase(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={type}
                onValueChange={(value) => {
                  setPage(1);
                  setType(value as TaskType | "all");
                }}
              >
                <SelectTrigger className="sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {TASK_TYPES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {titleCase(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={priority}
                onValueChange={(value) => {
                  setPage(1);
                  setPriority(value as TaskPriority | "all");
                }}
              >
                <SelectTrigger className="sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any priority</SelectItem>
                  {TASK_PRIORITIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {titleCase(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingState variant="inline" />
            ) : error ? (
              <ErrorState
                title="Could not load tasks"
                description={error}
                action={
                  <Button variant="outline" onClick={load}>
                    Retry
                  </Button>
                }
              />
            ) : items.length === 0 ? (
              <EmptyState
                icon={<ListTodo />}
                title="No tasks yet"
                description="Create a task to track follow-ups and internal work."
                action={
                  <Button onClick={openCreate}>
                    <Plus className="size-4" aria-hidden="true" />
                    New task
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="max-w-xs">
                          <p className="truncate font-medium">{task.title}</p>
                          <p className="text-caption text-muted-foreground">
                            {titleCase(task.type)}
                          </p>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {staffNames.get(task.assignedTo) ?? "Staff"}
                        </TableCell>
                        <TableCell>
                          <StatusPill status={task.priority} />
                        </TableCell>
                        <TableCell>
                          <StatusPill status={task.status} />
                        </TableCell>
                        <TableCell>
                          <span className={isOverdue(task.dueAt) && task.status !== "completed" ? "text-destructive" : ""}>
                            {formatDateTime(task.dueAt)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {task.status !== "completed" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStatus(task, "completed")}
                                aria-label="Mark complete"
                              >
                                <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(task)}
                              aria-label="Edit task"
                            >
                              <Pencil className="size-4" aria-hidden="true" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(task.id)}
                              aria-label="Delete task"
                            >
                              <Trash2 className="size-4 text-destructive" aria-hidden="true" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </CardContent>
        </Card>
      </PageStack>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit task" : "New task"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                value={form.title}
                onChange={(event) => updateForm("title", event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Assignee</Label>
              <Select
                value={form.assignedTo}
                onValueChange={(value) => updateForm("assignedTo", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.userId}>
                      {member.userName ?? member.userEmail ?? member.userId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(value) => updateForm("type", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_TYPES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {titleCase(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => updateForm("status", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {titleCase(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(value) => updateForm("priority", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {titleCase(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-due">Due at</Label>
              <Input
                id="task-due"
                type="datetime-local"
                value={form.dueAt}
                onChange={(event) => updateForm("dueAt", event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-reminder">Reminder at</Label>
              <Input
                id="task-reminder"
                type="datetime-local"
                value={form.reminderAt}
                onChange={(event) => updateForm("reminderAt", event.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="task-description">Description</Label>
              <textarea
                id="task-description"
                rows={3}
                value={form.description}
                onChange={(event) => updateForm("description", event.target.value)}
                className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-lead">Lead ID</Label>
              <Input
                id="task-lead"
                value={form.leadId}
                onChange={(event) => updateForm("leadId", event.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-booking">Booking ID</Label>
              <Input
                id="task-booking"
                value={form.bookingId}
                onChange={(event) => updateForm("bookingId", event.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-invoice">Invoice ID</Label>
              <Input
                id="task-invoice"
                value={form.invoiceId}
                onChange={(event) => updateForm("invoiceId", event.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {editingId ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AgencyModulePage>
  );
}
