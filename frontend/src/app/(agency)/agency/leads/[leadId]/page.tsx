"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarPlus,
  CheckCircle2,
  FileText,
  Loader2,
  Map,
  MessageSquarePlus,
  Phone,
  Receipt,
  Save,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
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
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageStack } from "@/components/shared/page-container";
import { AgencyModulePage } from "@/features/agency/components/agency-module-page";
import { DetailRow, EmptyBlock, SectionCard, StatusPill } from "@/features/agency/components/crm-ui";
import {
  createFollowUpApi,
  createLeadActivityApi,
  getLeadApi,
  listBookingsByLeadApi,
  listDocumentsByLeadApi,
  listFollowUpsApi,
  listInvoicesByLeadApi,
  listItinerariesApi,
  listLeadActivitiesApi,
  listLeadSourcesApi,
  listPipelinesApi,
  listQuotationsByLeadApi,
  listStaffApi,
  listTasksByLeadApi,
  updateFollowUpApi,
  updateLeadCrmApi,
  type LeadUpdateInput,
} from "@/features/agency/api/crm.api";
import { formatCurrency, formatDate, formatDateTime, toDateInputValue } from "@/features/agency/lib/format";
import type {
  Itinerary,
  Quotation,
  StaffMember,
  TaskItem,
  Booking,
  Invoice,
  DocumentFile,
} from "@/features/agency/types/crm.types";
import type {
  FollowUpChannel,
  FollowUpReminder,
  Lead,
  LeadActivity,
  LeadActivityType,
  LeadPipeline,
  LeadSource,
  LeadStatus,
} from "@/features/leads/types/lead.types";
import { LEAD_STATUS_LABELS, LEAD_STATUSES } from "@/features/leads/types/lead.types";

const EMPTY_EDIT = {
  status: "new" as LeadStatus,
  pipelineStageId: "",
  leadSourceId: "",
  assignedStaffId: "",
  estimatedValue: "",
  probability: "",
  nextFollowUpAt: "",
  agencyNote: "",
};

const ACTIVITY_TYPES: LeadActivityType[] = ["note", "call", "email", "whatsapp", "document", "task"];
const CHANNELS: FollowUpChannel[] = ["phone", "email", "whatsapp", "meeting"];

export default function AgencyLeadDetailPage() {
  const params = useParams<{ leadId: string }>();
  const leadId = String(params.leadId ?? "");
  const router = useRouter();

  const [lead, setLead] = useState<Lead | null>(null);
  const [pipelines, setPipelines] = useState<LeadPipeline[]>([]);
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpReminder[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [edit, setEdit] = useState({ ...EMPTY_EDIT });

  const [activityDialog, setActivityDialog] = useState(false);
  const [activityForm, setActivityForm] = useState({
    type: "note" as LeadActivityType,
    subject: "",
    description: "",
  });
  const [followUpDialog, setFollowUpDialog] = useState(false);
  const [followUpForm, setFollowUpForm] = useState({
    title: "",
    reminderAt: "",
    channel: "phone" as FollowUpChannel,
    notes: "",
  });

  const loadAll = useCallback(async () => {
    if (!leadId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [
        leadValue,
        pipelineValue,
        sourceValue,
        staffValue,
        activityValue,
        followValue,
        quoteValue,
        itineraryValue,
        bookingValue,
        invoiceValue,
        taskValue,
        documentValue,
      ] = await Promise.all([
        getLeadApi(leadId),
        listPipelinesApi().catch(() => ({ items: [], total: 0, page: 1, limit: 0, totalPages: 0 })),
        listLeadSourcesApi().catch(() => ({ items: [], total: 0, page: 1, limit: 0, totalPages: 0 })),
        listStaffApi({ page: 1, limit: 100 }).catch(() => ({ items: [], total: 0, page: 1, limit: 0, totalPages: 0 })),
        listLeadActivitiesApi(leadId).catch(() => ({ items: [], total: 0, page: 1, limit: 0, totalPages: 0 })),
        listFollowUpsApi({ page: 1, limit: 50 }).catch(() => ({ items: [], total: 0, page: 1, limit: 0, totalPages: 0 })),
        listQuotationsByLeadApi(leadId).catch(() => [] as Quotation[]),
        listItinerariesApi({ leadId, page: 1, limit: 10 }).catch(() => ({ items: [], total: 0, page: 1, limit: 0, totalPages: 0 })),
        listBookingsByLeadApi(leadId).catch(() => [] as Booking[]),
        listInvoicesByLeadApi(leadId).catch(() => [] as Invoice[]),
        listTasksByLeadApi(leadId).catch(() => [] as TaskItem[]),
        listDocumentsByLeadApi(leadId).catch(() => [] as DocumentFile[]),
      ]);
      setLead(leadValue);
      setPipelines(pipelineValue.items);
      setSources(sourceValue.items);
      setStaff(staffValue.items);
      setActivities(activityValue.items);
      setFollowUps(followValue.items.filter((item) => item.leadId === leadId));
      setQuotations(quoteValue);
      setItineraries(itineraryValue.items);
      setBookings(bookingValue);
      setInvoices(invoiceValue);
      setTasks(taskValue);
      setDocuments(documentValue);
      setEdit({
        status: leadValue.status,
        pipelineStageId: leadValue.pipelineStageId ?? "",
        leadSourceId: leadValue.leadSourceId ?? "",
        assignedStaffId: leadValue.assignedStaffId ?? "",
        estimatedValue: leadValue.estimatedValue ? String(leadValue.estimatedValue) : "",
        probability: leadValue.probability !== undefined ? String(leadValue.probability) : "",
        nextFollowUpAt: toDateInputValue(leadValue.nextFollowUpAt),
        agencyNote: leadValue.agencyNote ?? "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load lead.");
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAll();
  }, [loadAll]);

  const updateEdit = (key: keyof typeof EMPTY_EDIT, value: string) => {
    setEdit((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: LeadUpdateInput = {
        status: edit.status,
        pipelineStageId: edit.pipelineStageId || undefined,
        leadSourceId: edit.leadSourceId || undefined,
        assignedStaffId: edit.assignedStaffId || undefined,
        estimatedValue: edit.estimatedValue ? Number(edit.estimatedValue) : undefined,
        probability: edit.probability ? Number(edit.probability) : undefined,
        nextFollowUpAt: edit.nextFollowUpAt || undefined,
        agencyNote: edit.agencyNote,
      };
      await updateLeadCrmApi(leadId, payload);
      toast.success("Lead updated.");
      await loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update lead.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStageChange = async (stageId: string) => {
    setEdit((current) => ({ ...current, pipelineStageId: stageId === "none" ? "" : stageId }));
  };

  const handleAddActivity = async () => {
    if (!activityForm.subject.trim()) {
      toast.error("Add a subject for the activity.");
      return;
    }
    try {
      await createLeadActivityApi({
        leadId,
        type: activityForm.type,
        subject: activityForm.subject.trim(),
        description: activityForm.description.trim() || undefined,
      });
      toast.success("Activity logged.");
      setActivityDialog(false);
      setActivityForm({ type: "note", subject: "", description: "" });
      const value = await listLeadActivitiesApi(leadId);
      setActivities(value.items);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to log activity.");
    }
  };

  const handleAddFollowUp = async () => {
    if (!followUpForm.title.trim() || !followUpForm.reminderAt) {
      toast.error("Title and reminder time are required.");
      return;
    }
    try {
      await createFollowUpApi({
        leadId,
        title: followUpForm.title.trim(),
        reminderAt: new Date(followUpForm.reminderAt).toISOString(),
        channel: followUpForm.channel,
        notes: followUpForm.notes.trim() || undefined,
      });
      toast.success("Follow-up scheduled.");
      setFollowUpDialog(false);
      setFollowUpForm({ title: "", reminderAt: "", channel: "phone", notes: "" });
      const value = await listFollowUpsApi({ page: 1, limit: 50 });
      setFollowUps(value.items.filter((item) => item.leadId === leadId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to schedule follow-up.");
    }
  };

  const completeFollowUp = async (id: string) => {
    try {
      await updateFollowUpApi(id, { isCompleted: true });
      const value = await listFollowUpsApi({ page: 1, limit: 50 });
      setFollowUps(value.items.filter((item) => item.leadId === leadId));
      toast.success("Follow-up completed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update follow-up.");
    }
  };

  if (isLoading) {
    return (
      <AgencyModulePage tab="leads" title="Lead">
        <LoadingState />
      </AgencyModulePage>
    );
  }

  if (error || !lead) {
    return (
      <AgencyModulePage tab="leads" title="Lead">
        <ErrorState
          title="Could not load this lead"
          description={error ?? "Lead not found."}
          action={
            <Button variant="outline" onClick={() => router.push("/agency/leads")}>
              Back to leads
            </Button>
          }
        />
      </AgencyModulePage>
    );
  }

  const openFollowUps = followUps.filter((item) => !item.isCompleted);

  return (
    <AgencyModulePage
      tab="leads"
      title={lead.travelerName}
      description={`${lead.travelerEmail}${lead.travelerPhone ? ` - ${lead.travelerPhone}` : ""}`}
      actions={
        <>
          <Button variant="outline" asChild>
            <Link href="/agency/leads">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/agency/quotations/new?leadId=${lead.id}`}>
              <FileText className="size-4" aria-hidden="true" />
              New quotation
            </Link>
          </Button>
        </>
      }
    >
      <PageStack>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <SectionCard title="Requirement" description="What the traveler asked for.">
              <p className="whitespace-pre-line text-body-sm text-foreground">
                {lead.message || "No requirement captured yet."}
              </p>
              <div className="mt-4 grid gap-x-6 sm:grid-cols-2">
                <DetailRow label="Stage" value={lead.pipelineStage?.name ?? "Unstaged"} />
                <DetailRow label="Source" value={lead.leadSource?.name ?? "-"} />
                <DetailRow label="Travel date" value={formatDate(lead.requestedStartDate)} />
                <DetailRow label="Travelers" value={lead.travelerCount ?? "-"} />
                <DetailRow label="Created" value={formatDateTime(lead.createdAt)} />
                <DetailRow label="Owner" value={lead.assignedStaff?.name ?? "Unassigned"} />
              </div>
            </SectionCard>

            <SectionCard
              title="Activity timeline"
              description="Calls, emails, notes and status changes."
              action={
                <Button size="sm" variant="outline" onClick={() => setActivityDialog(true)}>
                  <MessageSquarePlus className="size-4" aria-hidden="true" />
                  Log activity
                </Button>
              }
            >
              {activities.length === 0 ? (
                <EmptyBlock title="No activity yet" description="Log the first touchpoint." />
              ) : (
                <ol className="space-y-4">
                  {activities.map((activity) => (
                    <li key={activity.id} className="flex gap-3">
                      <span className="mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Phone className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 border-b border-border/60 pb-3 last:border-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-body-sm font-medium">{activity.subject}</p>
                          <span className="rounded bg-muted px-1.5 py-0.5 text-caption uppercase text-muted-foreground">
                            {activity.type}
                          </span>
                        </div>
                        {activity.description && (
                          <p className="mt-1 whitespace-pre-line text-body-sm text-muted-foreground">
                            {activity.description}
                          </p>
                        )}
                        <p className="mt-1 text-caption text-muted-foreground">
                          {activity.staffName ? `${activity.staffName} - ` : ""}
                          {formatDateTime(activity.createdAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </SectionCard>

            <SectionCard
              title="Follow-ups"
              description="Keep the next conversation on the calendar."
              action={
                <Button size="sm" variant="outline" onClick={() => setFollowUpDialog(true)}>
                  <CalendarPlus className="size-4" aria-hidden="true" />
                  Schedule
                </Button>
              }
            >
              {openFollowUps.length === 0 ? (
                <EmptyBlock title="No open follow-ups" description="Schedule the next touchpoint." />
              ) : (
                <ul className="space-y-3">
                  {openFollowUps.map((reminder) => (
                    <li
                      key={reminder.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-border/70 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-body-sm font-medium">{reminder.title}</p>
                        <p className="text-caption text-muted-foreground">
                          {reminder.channel} - {formatDateTime(reminder.reminderAt)}
                        </p>
                        {reminder.notes && (
                          <p className="mt-1 text-caption text-muted-foreground">{reminder.notes}</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => completeFollowUp(reminder.id)}
                      >
                        <CheckCircle2 className="size-4" aria-hidden="true" />
                        Done
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <div className="grid gap-5 md:grid-cols-2">
              <SectionCard title="Quotations" description="Proposals shared with this traveler.">
                {quotations.length === 0 ? (
                  <EmptyBlock
                    title="No quotations"
                    action={
                      <Button size="sm" asChild>
                        <Link href={`/agency/quotations/new?leadId=${lead.id}`}>Create quotation</Link>
                      </Button>
                    }
                  />
                ) : (
                  <ul className="space-y-2">
                    {quotations.map((quotation) => (
                      <li key={quotation.id} className="flex items-center justify-between gap-2">
                        <Link
                          href={`/agency/quotations/${quotation.id}`}
                          className="text-body-sm font-medium hover:underline"
                        >
                          {quotation.quotationNumber}
                        </Link>
                        <div className="flex items-center gap-2">
                          <span className="text-caption">{formatCurrency(quotation.total, quotation.currency)}</span>
                          <StatusPill status={quotation.status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
              <SectionCard title="Itineraries" description="Drafts prepared for this lead.">
                {itineraries.length === 0 ? (
                  <EmptyBlock
                    title="No itineraries"
                    action={
                      <Button size="sm" asChild>
                        <Link href={`/agency/itineraries/new?leadId=${lead.id}`}>
                          <Map className="size-4" aria-hidden="true" />
                          Build itinerary
                        </Link>
                      </Button>
                    }
                  />
                ) : (
                  <ul className="space-y-2">
                    {itineraries.map((itinerary) => (
                      <li key={itinerary.id} className="flex items-center justify-between gap-2">
                        <Link
                          href={`/agency/itineraries/${itinerary.id}`}
                          className="text-body-sm font-medium hover:underline"
                        >
                          {itinerary.name}
                        </Link>
                        <span className="text-caption text-muted-foreground">
                          {itinerary.durationDays} days
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
            </div>
          </div>

          <div className="space-y-5">
            <SectionCard title="Lead details" description="Status, ownership and value.">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={edit.status}
                    onValueChange={(value) =>
                      setEdit((current) => ({ ...current, status: value as LeadStatus }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUSES.map((item) => (
                        <SelectItem key={item} value={item}>
                          {LEAD_STATUS_LABELS[item]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Stage</Label>
                  <Select
                    value={edit.pipelineStageId || "none"}
                    onValueChange={handleStageChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unstaged</SelectItem>
                      {pipelines.map((pipeline) => (
                        <SelectItem key={pipeline.id} value={pipeline.id}>
                          {pipeline.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Source</Label>
                  <Select
                    value={edit.leadSourceId || "none"}
                    onValueChange={(value) =>
                      updateEdit("leadSourceId", value === "none" ? "" : value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
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
                <div className="space-y-1.5">
                  <Label>Owner</Label>
                  <Select
                    value={edit.assignedStaffId || "none"}
                    onValueChange={(value) =>
                      updateEdit("assignedStaffId", value === "none" ? "" : value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="detail-value">Value</Label>
                    <Input
                      id="detail-value"
                      type="number"
                      min={0}
                      value={edit.estimatedValue}
                      onChange={(event) => updateEdit("estimatedValue", event.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="detail-probability">Probability</Label>
                    <Input
                      id="detail-probability"
                      type="number"
                      min={0}
                      max={100}
                      value={edit.probability}
                      onChange={(event) => updateEdit("probability", event.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="detail-follow-up">Next follow-up</Label>
                  <Input
                    id="detail-follow-up"
                    type="date"
                    value={edit.nextFollowUpAt}
                    onChange={(event) => updateEdit("nextFollowUpAt", event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="detail-note">Internal note</Label>
                  <textarea
                    id="detail-note"
                    value={edit.agencyNote}
                    onChange={(event) => updateEdit("agencyNote", event.target.value)}
                    rows={3}
                    className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                  />
                </div>
                <Button type="button" className="w-full" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Save className="size-4" aria-hidden="true" />
                  )}
                  Save changes
                </Button>
              </div>
            </SectionCard>

            <SectionCard title="Quick links" description="Move this lead forward.">
              <div className="grid gap-2">
                <Button variant="outline" className="justify-start" asChild>
                  <Link href={`/agency/itineraries/new?leadId=${lead.id}`}>
                    <Map className="size-4" aria-hidden="true" />
                    Build itinerary
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href={`/agency/bookings/new?leadId=${lead.id}`}>
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                    Create booking
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href={`/agency/invoices/new?leadId=${lead.id}`}>
                    <Receipt className="size-4" aria-hidden="true" />
                    Create invoice
                  </Link>
                </Button>
              </div>
            </SectionCard>
            <SectionCard title="Bookings" description="Bookings created from this lead.">
              {bookings.length === 0 ? (
                <EmptyBlock title="No bookings" />
              ) : (
                <ul className="space-y-2">
                  {bookings.map((booking) => (
                    <li key={booking.id} className="flex items-center justify-between gap-2">
                      <Link
                        href={`/agency/bookings/${booking.id}`}
                        className="text-body-sm font-medium hover:underline"
                      >
                        {booking.bookingNumber}
                      </Link>
                      <div className="flex items-center gap-2">
                        <span className="text-caption">
                          {formatCurrency(booking.totalPrice, booking.currency)}
                        </span>
                        <StatusPill status={booking.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
            <SectionCard title="Invoices" description="Raised against this lead.">
              {invoices.length === 0 ? (
                <EmptyBlock title="No invoices" />
              ) : (
                <ul className="space-y-2">
                  {invoices.map((invoice) => (
                    <li key={invoice.id} className="flex items-center justify-between gap-2">
                      <Link
                        href={`/agency/invoices/${invoice.id}`}
                        className="text-body-sm font-medium hover:underline"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                      <div className="flex items-center gap-2">
                        <span className="text-caption">{formatCurrency(invoice.total, invoice.currency)}</span>
                        <StatusPill status={invoice.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
            <SectionCard title="Tasks" description="Follow-up tasks for this lead.">
              {tasks.length === 0 ? (
                <EmptyBlock title="No tasks" />
              ) : (
                <ul className="space-y-2">
                  {tasks.map((task) => (
                    <li key={task.id} className="flex items-center justify-between gap-2">
                      <Link
                        href={`/agency/tasks/${task.id}`}
                        className="text-body-sm font-medium hover:underline"
                      >
                        {task.title}
                      </Link>
                      <StatusPill status={task.status} />
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
            <SectionCard title="Documents" description="Documents linked to this lead.">
              {documents.length === 0 ? (
                <EmptyBlock title="No documents" />
              ) : (
                <ul className="space-y-2">
                  {documents.map((document) => (
                    <li key={document.id} className="flex items-center justify-between gap-2">
                      <Link
                        href={`/agency/documents/${document.id}`}
                        className="text-body-sm font-medium hover:underline"
                      >
                        {document.fileName}
                      </Link>
                      <span className="text-caption">{document.category}</span>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>
        </div>
      </PageStack>

      <Dialog open={activityDialog} onOpenChange={setActivityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={activityForm.type}
                onValueChange={(value) =>
                  setActivityForm((current) => ({ ...current, type: value as LeadActivityType }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="activity-subject">Subject</Label>
              <Input
                id="activity-subject"
                value={activityForm.subject}
                onChange={(event) =>
                  setActivityForm((current) => ({ ...current, subject: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="activity-description">Details</Label>
              <textarea
                id="activity-description"
                rows={3}
                value={activityForm.description}
                onChange={(event) =>
                  setActivityForm((current) => ({ ...current, description: event.target.value }))
                }
                className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActivityDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddActivity}>Log activity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={followUpDialog} onOpenChange={setFollowUpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule follow-up</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="followup-title">Title</Label>
              <Input
                id="followup-title"
                value={followUpForm.title}
                onChange={(event) =>
                  setFollowUpForm((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="Call to confirm dates"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="followup-at">Remind at</Label>
              <Input
                id="followup-at"
                type="datetime-local"
                value={followUpForm.reminderAt}
                onChange={(event) =>
                  setFollowUpForm((current) => ({ ...current, reminderAt: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Channel</Label>
              <Select
                value={followUpForm.channel}
                onValueChange={(value) =>
                  setFollowUpForm((current) => ({ ...current, channel: value as FollowUpChannel }))
                }
              >
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
            <div className="space-y-1.5">
              <Label htmlFor="followup-notes">Notes</Label>
              <Input
                id="followup-notes"
                value={followUpForm.notes}
                onChange={(event) =>
                  setFollowUpForm((current) => ({ ...current, notes: event.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFollowUpDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFollowUp}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AgencyModulePage>
  );
}
