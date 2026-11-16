import { apiClient } from "@/lib/api";
import type {
  FollowUpChannel,
  FollowUpReminder,
  FollowUpReminderListResponse,
  Lead,
  LeadActivity,
  LeadActivityListResponse,
  LeadActivityType,
  LeadListResponse,
  LeadPipeline,
  LeadSource,
  LeadSourceListResponse,
  LeadStatus,
} from "@/features/leads/types/lead.types";
import type {
  AgencySubscription,
  AiItineraryDraft,
  Booking,
  BookingPayment,
  BookingStatus,
  CreateBookingInput,
  CreateDocumentInput,
  CreateInvoiceInput,
  CreateItineraryInput,
  CreateQuotationInput,
  CreateSupplierInput,
  CreateSupplierRateCardInput,
  CreateTaskInput,
  DocumentFile,
  Invoice,
  InvoiceStatus,
  InvoiceType,
  Itinerary,
  Paged,
  PaymentMethod,
  PlatformInvoice,
  Quotation,
  QuotationStatus,
  StaffMember,
  StaffRole,
  SubscriptionPlan,
  Supplier,
  SupplierCategory,
  SupplierRateCard,
  TaskItem,
  TaskPriority,
  TaskStatus,
  TaskType,
} from "@/features/agency/types/crm.types";

type Envelope<T> = { success: true; data: T };

function q(value: object) {
  const query: Record<string, string | number | boolean | undefined> = {};
  for (const [key, item] of Object.entries(value)) {
    if (item === undefined || item === null || item === "") continue;
    query[key] = item as string | number | boolean;
  }
  return query;
}

export interface LeadListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: LeadStatus;
  pipelineStageId?: string;
  leadSourceId?: string;
  assignedStaffId?: string;
  packageId?: string;
}

export interface AgencyLeadInput {
  travelerName: string;
  travelerEmail: string;
  travelerPhone?: string;
  message?: string;
  packageId?: string;
  requestedStartDate?: string;
  travelerCount?: number;
  pipelineStageId?: string;
  leadSourceId?: string;
  assignedStaffId?: string;
  estimatedValue?: number;
  probability?: number;
  expectedCloseDate?: string;
  nextFollowUpAt?: string;
  utmSource?: string;
}

export interface LeadUpdateInput {
  status?: LeadStatus;
  agencyNote?: string;
  pipelineStageId?: string;
  leadSourceId?: string;
  assignedStaffId?: string;
  estimatedValue?: number;
  probability?: number;
  expectedCloseDate?: string;
  lastFollowUpAt?: string;
  nextFollowUpAt?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export async function listLeadsApi(params: LeadListParams): Promise<LeadListResponse> {
  const response = await apiClient.get<Envelope<LeadListResponse>>("/leads", {
    query: q(params),
  });
  return response.data;
}

export async function getLeadApi(id: string): Promise<Lead> {
  const response = await apiClient.get<Envelope<{ lead: Lead }>>(
    `/leads/${encodeURIComponent(id)}`,
  );
  return response.data.lead;
}

export async function createAgencyLeadApi(input: AgencyLeadInput): Promise<Lead> {
  const response = await apiClient.post<Envelope<{ lead: Lead }>>("/leads/agency", {
    body: input,
  });
  return response.data.lead;
}

export async function bulkImportLeadsApi(leads: AgencyLeadInput[]): Promise<{
  created: number;
  failed: number;
  leadIds: string[];
  errors: Array<{ email: string; message: string }>;
}> {
  const response = await apiClient.post<Envelope<{ result: {
    created: number;
    failed: number;
    leadIds: string[];
    errors: Array<{ email: string; message: string }>;
  } }>>("/leads/bulk-import", { body: { leads } });
  return response.data.result;
}

export async function updateLeadCrmApi(id: string, input: LeadUpdateInput): Promise<Lead> {
  const response = await apiClient.patch<Envelope<{ lead: Lead }>>(
    `/leads/${encodeURIComponent(id)}`,
    { body: input },
  );
  return response.data.lead;
}

export async function listPipelinesApi(): Promise<Paged<LeadPipeline>> {
  const response = await apiClient.get<Envelope<{ items: LeadPipeline[]; total: number; page: number; limit: number; totalPages: number }>>(
    "/leads/pipeline",
    { query: { page: 1, limit: 100 } },
  );
  return response.data;
}

export async function createPipelineApi(input: {
  name: string;
  order?: number;
  probability?: number;
  color?: string;
  isDefault?: boolean;
  isClosedWon?: boolean;
  isClosedLost?: boolean;
}): Promise<LeadPipeline> {
  const response = await apiClient.post<Envelope<{ pipeline: LeadPipeline }>>(
    "/leads/pipeline",
    { body: input },
  );
  return response.data.pipeline;
}

export async function updatePipelineApi(
  id: string,
  input: Partial<LeadPipeline>,
): Promise<LeadPipeline> {
  const response = await apiClient.patch<Envelope<{ pipeline: LeadPipeline }>>(
    `/leads/pipeline/${encodeURIComponent(id)}`,
    { body: input },
  );
  return response.data.pipeline;
}

export async function deletePipelineApi(id: string): Promise<void> {
  await apiClient.delete(`/leads/pipeline/${encodeURIComponent(id)}`);
}

export async function listLeadSourcesApi(): Promise<LeadSourceListResponse> {
  const response = await apiClient.get<Envelope<LeadSourceListResponse>>(
    "/leads/sources",
    { query: { page: 1, limit: 100 } },
  );
  return response.data;
}

export async function createLeadSourceApi(input: {
  name: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  costPerLead?: number;
  isActive?: boolean;
}): Promise<LeadSource> {
  const response = await apiClient.post<Envelope<{ source: LeadSource }>>(
    "/leads/sources",
    { body: input },
  );
  return response.data.source;
}

export async function deleteLeadSourceApi(id: string): Promise<void> {
  await apiClient.delete(`/leads/sources/${encodeURIComponent(id)}`);
}

export async function listFollowUpsApi(params: {
  page?: number;
  limit?: number;
  isCompleted?: boolean;
  staffId?: string;
}): Promise<FollowUpReminderListResponse> {
  const response = await apiClient.get<Envelope<FollowUpReminderListResponse>>(
    "/followups",
    { query: q(params) },
  );
  return response.data;
}

export async function createFollowUpApi(input: {
  leadId: string;
  staffId?: string;
  reminderAt: string;
  title: string;
  notes?: string;
  channel: FollowUpChannel;
}): Promise<FollowUpReminder> {
  const response = await apiClient.post<Envelope<{ reminder: FollowUpReminder }>>(
    "/followups",
    { body: input },
  );
  return response.data.reminder;
}

export async function updateFollowUpApi(
  id: string,
  input: Partial<{
    reminderAt: string;
    title: string;
    notes: string;
    isCompleted: boolean;
    channel: FollowUpChannel;
  }>,
): Promise<FollowUpReminder> {
  const response = await apiClient.patch<Envelope<{ reminder: FollowUpReminder }>>(
    `/followups/${encodeURIComponent(id)}`,
    { body: input },
  );
  return response.data.reminder;
}

export async function deleteFollowUpApi(id: string): Promise<void> {
  await apiClient.delete(`/followups/${encodeURIComponent(id)}`);
}

export async function listLeadActivitiesApi(
  leadId: string,
  page = 1,
  limit = 50,
): Promise<LeadActivityListResponse> {
  const response = await apiClient.get<Envelope<LeadActivityListResponse>>(
    `/leads/${encodeURIComponent(leadId)}/activities`,
    { query: { page, limit } },
  );
  return response.data;
}

export async function createLeadActivityApi(input: {
  leadId: string;
  type: LeadActivityType;
  subject: string;
  description?: string;
  metadata?: Record<string, unknown>;
}): Promise<LeadActivity> {
  const response = await apiClient.post<Envelope<{ activity: LeadActivity }>>(
    `/leads/${encodeURIComponent(input.leadId)}/activities`,
    { body: input },
  );
  return response.data.activity;
}

export interface ItineraryListParams {
  page?: number;
  limit?: number;
  search?: string;
  isTemplate?: boolean;
  leadId?: string;
  packageId?: string;
}

export async function listItinerariesApi(
  params: ItineraryListParams,
): Promise<Paged<Itinerary>> {
  const response = await apiClient.get<Envelope<{ itineraries: Paged<Itinerary> }>>(
    "/itineraries",
    { query: q(params) },
  );
  return response.data.itineraries;
}

export async function getItineraryApi(id: string): Promise<Itinerary> {
  const response = await apiClient.get<Envelope<{ itinerary: Itinerary }>>(
    `/itineraries/${encodeURIComponent(id)}`,
  );
  return response.data.itinerary;
}

export async function createItineraryApi(input: CreateItineraryInput): Promise<Itinerary> {
  const response = await apiClient.post<Envelope<{ itinerary: Itinerary }>>(
    "/itineraries",
    { body: input },
  );
  return response.data.itinerary;
}

export async function updateItineraryApi(
  id: string,
  input: Partial<CreateItineraryInput>,
): Promise<Itinerary> {
  const response = await apiClient.put<Envelope<{ itinerary: Itinerary }>>(
    `/itineraries/${encodeURIComponent(id)}`,
    { body: input },
  );
  return response.data.itinerary;
}

export async function deleteItineraryApi(id: string): Promise<void> {
  await apiClient.delete(`/itineraries/${encodeURIComponent(id)}`);
}

export async function duplicateItineraryApi(id: string, newName: string): Promise<Itinerary> {
  const response = await apiClient.post<Envelope<{ itinerary: Itinerary }>>(
    `/itineraries/${encodeURIComponent(id)}/duplicate`,
    { body: { newName } },
  );
  return response.data.itinerary;
}

export async function generateAiItineraryApi(input: {
  destination: string;
  durationDays: number;
  travelerCount?: number;
  budget?: number;
  currency?: string;
  style?: string;
  interests?: string[];
  notes?: string;
}): Promise<AiItineraryDraft> {
  const response = await apiClient.post<Envelope<{ draft: AiItineraryDraft }>>(
    "/itineraries/ai-generate",
    { body: input },
  );
  return response.data.draft;
}

export interface QuotationListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: QuotationStatus;
  leadId?: string;
}

export async function listQuotationsApi(
  params: QuotationListParams,
): Promise<Paged<Quotation>> {
  const response = await apiClient.get<Envelope<{ quotations: Paged<Quotation> }>>(
    "/quotations",
    { query: q(params) },
  );
  return response.data.quotations;
}

export async function getQuotationStatusCountsApi(): Promise<Record<string, number>> {
  const response = await apiClient.get<Envelope<{ counts: Record<string, number> }>>(
    "/quotations/status-counts",
  );
  return response.data.counts;
}

export async function getQuotationApi(id: string): Promise<Quotation> {
  const response = await apiClient.get<Envelope<{ quotation: Quotation }>>(
    `/quotations/${encodeURIComponent(id)}`,
  );
  return response.data.quotation;
}

export async function createQuotationApi(input: CreateQuotationInput): Promise<Quotation> {
  const response = await apiClient.post<Envelope<{ quotation: Quotation }>>(
    "/quotations",
    { body: input },
  );
  return response.data.quotation;
}

export async function updateQuotationApi(
  id: string,
  input: Partial<CreateQuotationInput> & { status?: QuotationStatus },
): Promise<Quotation> {
  const response = await apiClient.put<Envelope<{ quotation: Quotation }>>(
    `/quotations/${encodeURIComponent(id)}`,
    { body: input },
  );
  return response.data.quotation;
}

export async function sendQuotationApi(id: string): Promise<Quotation> {
  const response = await apiClient.post<Envelope<{ quotation: Quotation }>>(
    `/quotations/${encodeURIComponent(id)}/send`,
  );
  return response.data.quotation;
}

export async function acceptQuotationApi(id: string): Promise<Quotation> {
  const response = await apiClient.post<Envelope<{ quotation: Quotation }>>(
    `/quotations/${encodeURIComponent(id)}/accept`,
  );
  return response.data.quotation;
}

export async function deleteQuotationApi(id: string): Promise<void> {
  await apiClient.delete(`/quotations/${encodeURIComponent(id)}`);
}

export async function getPublicQuotationApi(token: string): Promise<Quotation> {
  const response = await apiClient.get<Envelope<{ quotation: Quotation }>>(
    `/quotations/public/${encodeURIComponent(token)}`,
  );
  return response.data.quotation;
}

export async function acceptPublicQuotationApi(token: string): Promise<Quotation> {
  const response = await apiClient.post<Envelope<{ quotation: Quotation }>>(
    `/quotations/public/${encodeURIComponent(token)}/accept`,
  );
  return response.data.quotation;
}

export interface BookingListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: BookingStatus;
  leadId?: string;
  packageId?: string;
  itineraryId?: string;
  staffId?: string;
  departureFrom?: string;
  departureTo?: string;
}

export async function listBookingsApi(params: BookingListParams): Promise<Paged<Booking>> {
  const response = await apiClient.get<Envelope<{ bookings: Paged<Booking> }>>(
    "/bookings",
    { query: q(params) },
  );
  return response.data.bookings;
}

export async function getBookingStatusCountsApi(): Promise<Record<string, number>> {
  const response = await apiClient.get<Envelope<{ counts: Record<string, number> }>>(
    "/bookings/status-counts",
  );
  return response.data.counts;
}

export async function getBookingApi(id: string): Promise<Booking> {
  const response = await apiClient.get<Envelope<{ booking: Booking }>>(
    `/bookings/${encodeURIComponent(id)}`,
  );
  return response.data.booking;
}

export async function createBookingApi(input: CreateBookingInput): Promise<Booking> {
  const response = await apiClient.post<Envelope<{ booking: Booking }>>("/bookings", {
    body: input,
  });
  return response.data.booking;
}

export async function updateBookingApi(
  id: string,
  input: Partial<CreateBookingInput> & {
    voucherUrl?: string;
    voucherKey?: string;
  },
): Promise<Booking> {
  const response = await apiClient.put<Envelope<{ booking: Booking }>>(
    `/bookings/${encodeURIComponent(id)}`,
    { body: input },
  );
  return response.data.booking;
}

export async function updateBookingStatusApi(
  id: string,
  status: BookingStatus,
): Promise<Booking> {
  const response = await apiClient.patch<Envelope<{ booking: Booking }>>(
    `/bookings/${encodeURIComponent(id)}/status`,
    { body: { status } },
  );
  return response.data.booking;
}

export async function listUpcomingDeparturesApi(): Promise<Booking[]> {
  const response = await apiClient.get<Envelope<{ bookings: Booking[] }>>(
    "/bookings/upcoming-departures",
  );
  return response.data.bookings;
}

export async function addSupplierBookingApi(
  bookingId: string,
  input: {
    supplierId: string;
    referenceNumber?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    rooms?: number;
    totalCost: number;
    currency?: string;
    status?: "pending" | "confirmed" | "cancelled";
    documentUrl?: string;
  },
): Promise<Booking> {
  const response = await apiClient.post<Envelope<{ booking: Booking }>>(
    `/bookings/${encodeURIComponent(bookingId)}/supplier-bookings`,
    { body: input },
  );
  return response.data.booking;
}

export async function deleteBookingApi(id: string): Promise<void> {
  await apiClient.delete(`/bookings/${encodeURIComponent(id)}`);
}

export interface InvoiceListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: InvoiceType;
  status?: InvoiceStatus;
  bookingId?: string;
  leadId?: string;
}

export async function listInvoicesApi(params: InvoiceListParams): Promise<Paged<Invoice>> {
  const response = await apiClient.get<Envelope<{ invoices: Paged<Invoice> }>>(
    "/invoices",
    { query: q(params) },
  );
  return response.data.invoices;
}

export async function getInvoiceStatusCountsApi(): Promise<Record<string, number>> {
  const response = await apiClient.get<Envelope<{ counts: Record<string, number> }>>(
    "/invoices/status-counts",
  );
  return response.data.counts;
}

export async function listOverdueInvoicesApi(): Promise<Invoice[]> {
  const response = await apiClient.get<Envelope<{ invoices: Invoice[] }>>("/invoices/overdue");
  return response.data.invoices;
}

export async function getInvoiceApi(id: string): Promise<Invoice> {
  const response = await apiClient.get<Envelope<{ invoice: Invoice }>>(
    `/invoices/${encodeURIComponent(id)}`,
  );
  return response.data.invoice;
}

export async function createInvoiceApi(input: CreateInvoiceInput): Promise<Invoice> {
  const response = await apiClient.post<Envelope<{ invoice: Invoice }>>("/invoices", {
    body: input,
  });
  return response.data.invoice;
}

export async function updateInvoiceApi(
  id: string,
  input: Partial<CreateInvoiceInput> & { status?: InvoiceStatus },
): Promise<Invoice> {
  const response = await apiClient.put<Envelope<{ invoice: Invoice }>>(
    `/invoices/${encodeURIComponent(id)}`,
    { body: input },
  );
  return response.data.invoice;
}

export async function updateInvoiceStatusApi(
  id: string,
  status: InvoiceStatus,
): Promise<Invoice> {
  const response = await apiClient.patch<Envelope<{ invoice: Invoice }>>(
    `/invoices/${encodeURIComponent(id)}/status`,
    { body: { status } },
  );
  return response.data.invoice;
}

export async function recordInvoicePaymentApi(
  id: string,
  input: {
    amount: number;
    method: PaymentMethod;
    transactionId?: string;
    notes?: string;
  },
): Promise<Invoice> {
  const response = await apiClient.post<Envelope<{ invoice: Invoice }>>(
    `/invoices/${encodeURIComponent(id)}/payment`,
    { body: input },
  );
  return response.data.invoice;
}

export async function deleteInvoiceApi(id: string): Promise<void> {
  await apiClient.delete(`/invoices/${encodeURIComponent(id)}`);
}

export async function listBookingPaymentsApi(
  bookingId: string,
): Promise<BookingPayment[]> {
  const response = await apiClient.get<Envelope<{ payments: BookingPayment[] }>>(
    `/booking-payments/booking/${encodeURIComponent(bookingId)}`,
  );
  return response.data.payments;
}

export async function createBookingPaymentApi(input: {
  bookingId: string;
  invoiceId?: string;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  transactionId?: string;
  paidAt?: string;
  notes?: string;
}): Promise<BookingPayment> {
  const response = await apiClient.post<Envelope<{ payment: BookingPayment }>>(
    "/booking-payments",
    { body: input },
  );
  return response.data.payment;
}

export async function deleteBookingPaymentApi(id: string): Promise<void> {
  await apiClient.delete(`/booking-payments/${encodeURIComponent(id)}`);
}

export interface SupplierListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: SupplierCategory;
  isActive?: boolean;
}

export async function listSuppliersApi(
  params: SupplierListParams,
): Promise<Paged<Supplier>> {
  const response = await apiClient.get<Envelope<{ suppliers: Paged<Supplier> }>>(
    "/suppliers",
    { query: q(params) },
  );
  return response.data.suppliers;
}

export async function getSupplierCategoryCountsApi(): Promise<Record<string, number>> {
  const response = await apiClient.get<Envelope<{ counts: Record<string, number> }>>(
    "/suppliers/category-counts",
  );
  return response.data.counts;
}

export async function getSupplierApi(id: string): Promise<Supplier> {
  const response = await apiClient.get<Envelope<{ supplier: Supplier }>>(
    `/suppliers/${encodeURIComponent(id)}`,
  );
  return response.data.supplier;
}

export async function createSupplierApi(input: CreateSupplierInput): Promise<Supplier> {
  const response = await apiClient.post<Envelope<{ supplier: Supplier }>>(
    "/suppliers",
    { body: input },
  );
  return response.data.supplier;
}

export async function updateSupplierApi(
  id: string,
  input: Partial<CreateSupplierInput>,
): Promise<Supplier> {
  const response = await apiClient.put<Envelope<{ supplier: Supplier }>>(
    `/suppliers/${encodeURIComponent(id)}`,
    { body: input },
  );
  return response.data.supplier;
}

export async function deleteSupplierApi(id: string): Promise<void> {
  await apiClient.delete(`/suppliers/${encodeURIComponent(id)}`);
}

export async function listRateCardsApi(
  supplierId: string,
): Promise<Paged<SupplierRateCard>> {
  const response = await apiClient.get<Envelope<{ rateCards: Paged<SupplierRateCard> }>>(
    `/suppliers/${encodeURIComponent(supplierId)}/rate-cards`,
    { query: { page: 1, limit: 100 } },
  );
  return response.data.rateCards;
}

export async function createRateCardApi(
  supplierId: string,
  input: CreateSupplierRateCardInput,
): Promise<SupplierRateCard> {
  const response = await apiClient.post<Envelope<{ rateCard: SupplierRateCard }>>(
    `/suppliers/${encodeURIComponent(supplierId)}/rate-cards`,
    { body: input },
  );
  return response.data.rateCard;
}

export async function updateRateCardApi(
  supplierId: string,
  rateCardId: string,
  input: Partial<CreateSupplierRateCardInput>,
): Promise<SupplierRateCard> {
  const response = await apiClient.put<Envelope<{ rateCard: SupplierRateCard }>>(
    `/suppliers/${encodeURIComponent(supplierId)}/rate-cards/${encodeURIComponent(rateCardId)}`,
    { body: input },
  );
  return response.data.rateCard;
}

export async function deleteRateCardApi(
  supplierId: string,
  rateCardId: string,
): Promise<void> {
  await apiClient.delete(
    `/suppliers/${encodeURIComponent(supplierId)}/rate-cards/${encodeURIComponent(rateCardId)}`,
  );
}

export interface DocumentListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  leadId?: string;
  bookingId?: string;
  invoiceId?: string;
}

export async function listDocumentsApi(
  params: DocumentListParams,
): Promise<Paged<DocumentFile>> {
  const response = await apiClient.get<Envelope<{ documents: Paged<DocumentFile> }>>(
    "/documents",
    { query: q(params) },
  );
  return response.data.documents;
}

export async function createDocumentApi(
  input: CreateDocumentInput,
): Promise<DocumentFile> {
  const response = await apiClient.post<Envelope<{ document: DocumentFile }>>(
    "/documents",
    { body: input },
  );
  return response.data.document;
}

export async function updateDocumentApi(
  id: string,
  input: Partial<CreateDocumentInput>,
): Promise<DocumentFile> {
  const response = await apiClient.put<Envelope<{ document: DocumentFile }>>(
    `/documents/${encodeURIComponent(id)}`,
    { body: input },
  );
  return response.data.document;
}

export async function deleteDocumentApi(id: string): Promise<void> {
  await apiClient.delete(`/documents/${encodeURIComponent(id)}`);
}

export interface TaskListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: TaskType;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  leadId?: string;
  bookingId?: string;
  invoiceId?: string;
}

export async function listTasksApi(params: TaskListParams): Promise<Paged<TaskItem>> {
  const response = await apiClient.get<Envelope<{ tasks: Paged<TaskItem> }>>(
    "/tasks",
    { query: q(params) },
  );
  return response.data.tasks;
}

export async function getTaskStatusCountsApi(): Promise<Record<string, number>> {
  const response = await apiClient.get<Envelope<{ counts: Record<string, number> }>>(
    "/tasks/status-counts",
  );
  return response.data.counts;
}

export async function listMyTasksApi(): Promise<TaskItem[]> {
  const response = await apiClient.get<Envelope<{ tasks: TaskItem[] }>>("/tasks/my-tasks");
  return response.data.tasks;
}

export async function listOverdueTasksApi(): Promise<TaskItem[]> {
  const response = await apiClient.get<Envelope<{ tasks: TaskItem[] }>>("/tasks/overdue");
  return response.data.tasks;
}

export async function getTaskApi(id: string): Promise<TaskItem> {
  const response = await apiClient.get<Envelope<{ task: TaskItem }>>(
    `/tasks/${encodeURIComponent(id)}`,
  );
  return response.data.task;
}

export async function createTaskApi(input: CreateTaskInput): Promise<TaskItem> {
  const response = await apiClient.post<Envelope<{ task: TaskItem }>>("/tasks", {
    body: input,
  });
  return response.data.task;
}

export async function updateTaskApi(
  id: string,
  input: Partial<TaskItem>,
): Promise<TaskItem> {
  const response = await apiClient.put<Envelope<{ task: TaskItem }>>(
    `/tasks/${encodeURIComponent(id)}`,
    { body: input },
  );
  return response.data.task;
}

export async function updateTaskStatusApi(
  id: string,
  status: TaskStatus,
): Promise<TaskItem> {
  const response = await apiClient.patch<Envelope<{ task: TaskItem }>>(
    `/tasks/${encodeURIComponent(id)}/status`,
    { body: { status } },
  );
  return response.data.task;
}

export async function deleteTaskApi(id: string): Promise<void> {
  await apiClient.delete(`/tasks/${encodeURIComponent(id)}`);
}

export async function listStaffApi(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: StaffRole;
  isActive?: boolean;
}): Promise<Paged<StaffMember>> {
  const response = await apiClient.get<Envelope<{ staff: Paged<StaffMember> }>>(
    "/staff",
    { query: q(params) },
  );
  return response.data.staff;
}

export async function createStaffApi(input: {
  userId: string;
  role: StaffRole;
  permissions?: string[];
  isActive?: boolean;
}): Promise<StaffMember> {
  const response = await apiClient.post<Envelope<{ staff: StaffMember }>>(
    "/staff",
    { body: input },
  );
  return response.data.staff;
}

export async function updateStaffApi(
  id: string,
  input: { role?: StaffRole; permissions?: string[]; isActive?: boolean },
): Promise<StaffMember> {
  const response = await apiClient.put<Envelope<{ staff: StaffMember }>>(
    `/staff/${encodeURIComponent(id)}`,
    { body: input },
  );
  return response.data.staff;
}

export async function deleteStaffApi(id: string): Promise<void> {
  await apiClient.delete(`/staff/${encodeURIComponent(id)}`);
}

export async function listSubscriptionPlansApi(): Promise<Paged<SubscriptionPlan>> {
  const response = await apiClient.get<Envelope<{ plans: Paged<SubscriptionPlan> }>>(
    "/subscription-plans",
    { query: { page: 1, limit: 50, isActive: true } },
  );
  return response.data.plans;
}

export async function getMySubscriptionApi(): Promise<AgencySubscription | null> {
  const response = await apiClient.get<Envelope<{ subscription: AgencySubscription | null }>>(
    "/agency-subscriptions/my",
  );
  return response.data.subscription;
}

export async function createSubscriptionApi(input: {
  planId: string;
  billingCycle: "monthly" | "yearly";
  trialDays?: number;
  autoRenew?: boolean;
}): Promise<AgencySubscription> {
  const response = await apiClient.post<Envelope<{ subscription: AgencySubscription }>>(
    "/agency-subscriptions",
    { body: input },
  );
  return response.data.subscription;
}

export async function cancelSubscriptionApi(
  id: string,
  cancelAtPeriodEnd = true,
): Promise<AgencySubscription> {
  const response = await apiClient.post<Envelope<{ subscription: AgencySubscription }>>(
    `/agency-subscriptions/${encodeURIComponent(id)}/cancel`,
    { body: { cancelAtPeriodEnd } },
  );
  return response.data.subscription;
}

export async function reactivateSubscriptionApi(
  id: string,
): Promise<AgencySubscription> {
  const response = await apiClient.post<Envelope<{ subscription: AgencySubscription }>>(
    `/agency-subscriptions/${encodeURIComponent(id)}/reactivate`,
  );
  return response.data.subscription;
}

export async function recordSubscriptionPaymentApi(
  id: string,
  input: { amount: number; method: string; reference?: string },
): Promise<AgencySubscription> {
  const response = await apiClient.post<Envelope<{ subscription: AgencySubscription }>>(
    `/agency-subscriptions/${encodeURIComponent(id)}/payment`,
    { body: input },
  );
  return response.data.subscription;
}

export async function listPlatformInvoicesApi(): Promise<Paged<PlatformInvoice>> {
  const response = await apiClient.get<Envelope<{ invoices: Paged<PlatformInvoice> }>>(
    "/platform-invoices",
    { query: { page: 1, limit: 50 } },
  );
  return response.data.invoices;
}
