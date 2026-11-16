"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Filter,
  Kanban,
  List,
  Loader2,
  Plus,
  Search,
  Upload,
  Users,
  Wallet,
} from "lucide-react";
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
  createAgencyLeadApi,
  listLeadsApi,
  listLeadSourcesApi,
  listPipelinesApi,
  listStaffApi,
  type AgencyLeadInput,
} from "@/features/agency/api/crm.api";
import { formatCurrency, formatDate, initials } from "@/features/agency/lib/format";
import type { Lead, LeadSource, LeadStatus } from "@/features/leads/types/lead.types";
import { LEAD_STATUS_LABELS, LEAD_STATUSES } from "@/features/leads/types/lead.types";
import type { LeadDashboard } from "@/features/leads/types/lead.types";
import type { LeadPipeline } from "@/features/leads/types/lead.types";
import type { StaffMember } from "@/features/agency/types/crm.types";
import { getAgencyDashboardApi } from "@/features/leads/api/leads.api";

type ViewMode = "list" | "board";

const PAGE_SIZE = 25;

const EMPTY_FORM = {
  travelerName: "",
  travelerEmail: "",
  travelerPhone: "",
  message: "",
  travelerCount: "",
  requestedStartDate: "",
  estimatedValue: "",
  probability: "",
  pipelineStageId: "",
  leadSourceId: "",
  assignedStaffId: "",
  nextFollowUpAt: "",
};

export default function AgencyLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("list");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<LeadDashboard | null>(null);
  const [pipelines, setPipelines] = useState<LeadPipeline[]>([]);
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listLeadsApi({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: status === "all" ? undefined : status,
      });
      setLeads(response.items);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load leads.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadLeads();
  }, [loadLeads]);

  useEffect(() => {
    let cancelled = false;
    getAgencyDashboardApi()
      .then((value) => {
        if (!cancelled) setDashboard(value);
      })
      .catch(() => undefined);
    listPipelinesApi()
      .then((value) => {
        if (!cancelled) setPipelines(value.items);
      })
      .catch(() => undefined);
    listLeadSourcesApi()
      .then((value) => {
        if (!cancelled) setSources(value.items);
      })
      .catch(() => undefined);
    listStaffApi({ page: 1, limit: 100 })
      .then((value) => {
        if (!cancelled) setStaff(value.items);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const statusCounts = dashboard?.leads.byStatus;
  const wonLeads = statusCounts?.won ?? 0;
  const newLeads = statusCounts?.new ?? 0;
  const qualifiedLeads = statusCounts?.qualified ?? 0;

  const boardGroups = useMemo(() => {
    return pipelines.map((pipeline) => ({
      pipeline,
      leads: leads.filter((lead) => lead.pipelineStageId === pipeline.id),
    }));
  }, [pipelines, leads]);

  const unassigned = leads.filter(
    (lead) => !lead.pipelineStageId || !pipelines.some((p) => p.id === lead.pipelineStageId),
  );

  const submitSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const updateForm = (key: keyof typeof EMPTY_FORM, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleCreate = async () => {
    if (!form.travelerName.trim() || !form.travelerEmail.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    setIsSaving(true);
    try {
      const payload: AgencyLeadInput = {
        travelerName: form.travelerName.trim(),
        travelerEmail: form.travelerEmail.trim(),
        travelerPhone: form.travelerPhone.trim() || undefined,
        message: form.message.trim() || undefined,
        travelerCount: form.travelerCount ? Number(form.travelerCount) : undefined,
        requestedStartDate: form.requestedStartDate || undefined,
        estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : undefined,
        probability: form.probability ? Number(form.probability) : undefined,
        pipelineStageId: form.pipelineStageId || undefined,
        leadSourceId: form.leadSourceId || undefined,
        assignedStaffId: form.assignedStaffId || undefined,
        nextFollowUpAt: form.nextFollowUpAt || undefined,
      };
      await createAgencyLeadApi(payload);
      toast.success("Lead created.");
      setIsDialogOpen(false);
      setForm({ ...EMPTY_FORM });
      setPage(1);
      await loadLeads();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create lead.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AgencyModulePage
      tab="leads"
      title="Leads"
      description="Every traveler inquiry, from first contact to a confirmed trip."
      actions={
        <>
          <Button variant="outline" asChild>
            <Link href="/agency/leads/import">
              <Upload className="size-4" aria-hidden="true" />
              Import CSV
            </Link>
          </Button>
          <Button type="button" onClick={() => setIsDialogOpen(true)}>
            <Plus className="size-4" aria-hidden="true" />
            New lead
          </Button>
        </>
      }
    >
      <PageStack>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total leads" value={dashboard?.leads.total ?? total} icon={Users} />
          <StatCard label="New" value={newLeads} icon={Plus} tone="warning" />
          <StatCard label="Qualified" value={qualifiedLeads} icon={Filter} />
          <StatCard label="Won" value={wonLeads} icon={Wallet} tone="success" />
        </div>

        <Card>
          <CardHeader className="gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>Lead inbox</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") submitSearch();
                  }}
                  placeholder="Search name, email, phone"
                  className="pl-9 sm:w-64"
                />
              </div>
              <Select
                value={status}
                onValueChange={(value) => {
                  setPage(1);
                  setStatus(value as LeadStatus | "all");
                }}
              >
                <SelectTrigger className="sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {LEAD_STATUSES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {LEAD_STATUS_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="inline-flex items-center rounded-md border border-border p-1">
                <Button
                  type="button"
                  size="sm"
                  variant={view === "list" ? "secondary" : "ghost"}
                  aria-pressed={view === "list"}
                  onClick={() => setView("list")}
                >
                  <List className="size-4" aria-hidden="true" />
                  List
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={view === "board" ? "secondary" : "ghost"}
                  aria-pressed={view === "board"}
                  onClick={() => setView("board")}
                >
                  <Kanban className="size-4" aria-hidden="true" />
                  Board
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingState variant="inline" />
            ) : error ? (
              <ErrorState
                title="Could not load leads"
                description={error}
                action={
                  <Button type="button" variant="outline" onClick={loadLeads}>
                    Retry
                  </Button>
                }
              />
            ) : leads.length === 0 ? (
              <EmptyState
                icon={<Users />}
                title="No leads yet"
                description="Add your first inquiry or import a CSV to get started."
                action={
                  <Button type="button" onClick={() => setIsDialogOpen(true)}>
                    <Plus className="size-4" aria-hidden="true" />
                    New lead
                  </Button>
                }
              />
            ) : view === "list" ? (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Traveler</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Next follow-up</TableHead>
                      <TableHead className="text-right">Open</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="inline-flex size-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                              {initials(lead.travelerName)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">
                                {lead.travelerName}
                              </p>
                              <p className="truncate text-caption text-muted-foreground">
                                {lead.travelerEmail}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {lead.pipelineStage ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span
                                className="size-2 rounded-full"
                                style={{ backgroundColor: lead.pipelineStage.color }}
                              />
                              {lead.pipelineStage.name}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Unstaged</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusPill status={lead.status} />
                        </TableCell>
                        <TableCell>{formatCurrency(lead.estimatedValue)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {lead.assignedStaff?.name ?? "Unassigned"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(lead.nextFollowUpAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/agency/leads/${lead.id}`}>
                              View
                              <ArrowUpRight className="size-4" aria-hidden="true" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {boardGroups.map((group) => (
                    <div key={group.pipeline.id} className="w-72 shrink-0">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-2.5 rounded-full"
                            style={{ backgroundColor: group.pipeline.color }}
                          />
                          <p className="text-body-sm font-semibold">{group.pipeline.name}</p>
                        </div>
                        <span className="text-caption text-muted-foreground">
                          {group.leads.length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {group.leads.length === 0 ? (
                          <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-caption text-muted-foreground">
                            No leads
                          </p>
                        ) : (
                          group.leads.map((lead) => (
                            <Link
                              key={lead.id}
                              href={`/agency/leads/${lead.id}`}
                              className="block rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/50"
                            >
                              <p className="text-body-sm font-medium">{lead.travelerName}</p>
                              <p className="mt-0.5 truncate text-caption text-muted-foreground">
                                {lead.travelerEmail}
                              </p>
                              <div className="mt-2 flex items-center justify-between">
                                <StatusPill status={lead.status} />
                                <span className="text-caption font-medium">
                                  {formatCurrency(lead.estimatedValue)}
                                </span>
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                  {unassigned.length > 0 && (
                    <div className="w-72 shrink-0">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-body-sm font-semibold">Unstaged</p>
                        <span className="text-caption text-muted-foreground">
                          {unassigned.length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {unassigned.map((lead) => (
                          <Link
                            key={lead.id}
                            href={`/agency/leads/${lead.id}`}
                            className="block rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/50"
                          >
                            <p className="text-body-sm font-medium">{lead.travelerName}</p>
                            <p className="mt-0.5 truncate text-caption text-muted-foreground">
                              {lead.travelerEmail}
                            </p>
                            <div className="mt-2">
                              <StatusPill status={lead.status} />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </CardContent>
        </Card>
      </PageStack>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>New lead</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lead-name">Traveler name</Label>
              <Input
                id="lead-name"
                value={form.travelerName}
                onChange={(event) => updateForm("travelerName", event.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-email">Email</Label>
              <Input
                id="lead-email"
                type="email"
                value={form.travelerEmail}
                onChange={(event) => updateForm("travelerEmail", event.target.value)}
                placeholder="traveler@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-phone">Phone</Label>
              <Input
                id="lead-phone"
                value={form.travelerPhone}
                onChange={(event) => updateForm("travelerPhone", event.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-travelers">Travelers</Label>
              <Input
                id="lead-travelers"
                type="number"
                min={1}
                value={form.travelerCount}
                onChange={(event) => updateForm("travelerCount", event.target.value)}
                placeholder="2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-date">Travel date</Label>
              <Input
                id="lead-date"
                type="date"
                value={form.requestedStartDate}
                onChange={(event) => updateForm("requestedStartDate", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-value">Estimated value</Label>
              <Input
                id="lead-value"
                type="number"
                min={0}
                value={form.estimatedValue}
                onChange={(event) => updateForm("estimatedValue", event.target.value)}
                placeholder="INR"
              />
            </div>
            <div className="space-y-2">
              <Label>Stage</Label>
              <Select
                value={form.pipelineStageId || "none"}
                onValueChange={(value) =>
                  updateForm("pipelineStageId", value === "none" ? "" : value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No stage</SelectItem>
                  {pipelines.map((pipeline) => (
                    <SelectItem key={pipeline.id} value={pipeline.id}>
                      {pipeline.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Select
                value={form.leadSourceId || "none"}
                onValueChange={(value) =>
                  updateForm("leadSourceId", value === "none" ? "" : value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No source</SelectItem>
                  {sources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assign to</Label>
              <Select
                value={form.assignedStaffId || "none"}
                onValueChange={(value) =>
                  updateForm("assignedStaffId", value === "none" ? "" : value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.userId}>
                      {member.userName ?? member.userEmail ?? member.userId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-probability">Probability (%)</Label>
              <Input
                id="lead-probability"
                type="number"
                min={0}
                max={100}
                value={form.probability}
                onChange={(event) => updateForm("probability", event.target.value)}
                placeholder="50"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="lead-message">Requirement</Label>
              <textarea
                id="lead-message"
                value={form.message}
                onChange={(event) => updateForm("message", event.target.value)}
                rows={3}
                placeholder="Destinations, dates, budget, preferences"
                className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCreate} disabled={isSaving}>
              {isSaving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Create lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AgencyModulePage>
  );
}
