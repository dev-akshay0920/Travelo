export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const ITINERARY_TAX_TYPES = ["inclusive", "exclusive", "none"] as const;
export type ItineraryTaxType = (typeof ITINERARY_TAX_TYPES)[number];

export interface ItineraryDay {
  day: number;
  title: string;
  description?: string;
  accommodation?: string;
  meals?: string[];
  transport?: string;
  sightseeing?: string[];
  highlights?: string[];
  distance?: string;
}

export interface Itinerary {
  id: string;
  agencyId: string;
  leadId?: string;
  packageId?: string;
  name: string;
  destination: string;
  durationDays: number;
  durationNights: number;
  days: ItineraryDay[];
  totalPrice: number;
  currency: string;
  taxType: ItineraryTaxType;
  taxPercentage: number;
  advancePercentage: number;
  isTemplate: boolean;
  templateCategory?: string;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItineraryInput {
  leadId?: string;
  packageId?: string;
  name: string;
  destination: string;
  durationDays: number;
  durationNights: number;
  days?: ItineraryDay[];
  totalPrice?: number;
  currency?: string;
  taxType?: ItineraryTaxType;
  taxPercentage?: number;
  advancePercentage?: number;
  isTemplate?: boolean;
  templateCategory?: string;
  aiGenerated?: boolean;
}

export interface AiItineraryDraft {
  name: string;
  destination: string;
  summary?: string;
  days: ItineraryDay[];
  estimatedTotalPrice?: number;
}

export const QUOTATION_STATUSES = [
  "draft",
  "sent",
  "viewed",
  "accepted",
  "expired",
  "converted",
] as const;
export type QuotationStatus = (typeof QUOTATION_STATUSES)[number];

export interface Quotation {
  id: string;
  agencyId: string;
  leadId: string;
  itineraryId?: string;
  quotationNumber: string;
  status: QuotationStatus;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  validUntil: string;
  pdfUrl?: string;
  pdfKey?: string;
  publicShareLink: string;
  shareLinkExpiresAt?: string;
  viewedAt?: string;
  acceptedAt?: string;
  convertedBookingId?: string;
  notes?: string;
  termsAndConditions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuotationInput {
  leadId: string;
  itineraryId?: string;
  status?: QuotationStatus;
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
  total: number;
  currency?: string;
  validUntil: string;
  notes?: string;
  termsAndConditions?: string;
}

export const BOOKING_STATUSES = [
  "enquiry",
  "quoted",
  "deposit_paid",
  "confirmed",
  "completed",
  "cancelled",
  "refunded",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface TravellerRoster {
  id?: string;
  name: string;
  passportNumber?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  email?: string;
  phone?: string;
}

export interface SupplierBooking {
  id?: string;
  supplierId: string;
  referenceNumber?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
  totalCost: number;
  currency: string;
  status: "pending" | "confirmed" | "cancelled";
  documentUrl?: string;
}

export interface Booking {
  id: string;
  agencyId: string;
  leadId?: string;
  quotationId?: string;
  bookingNumber: string;
  travellerId?: string;
  travellers: TravellerRoster[];
  packageId?: string;
  itineraryId?: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  totalPrice: number;
  paidAmount: number;
  currency: string;
  departureDate: string;
  staffId?: string;
  supplierBookings: SupplierBooking[];
  voucherUrl?: string;
  voucherKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingInput {
  leadId?: string;
  quotationId?: string;
  travellerId?: string;
  travellers: TravellerRoster[];
  packageId?: string;
  itineraryId?: string;
  startDate: string;
  endDate: string;
  status?: BookingStatus;
  totalPrice?: number;
  paidAmount?: number;
  currency?: string;
  departureDate: string;
  staffId?: string;
  supplierBookings?: SupplierBooking[];
}

export const INVOICE_STATUSES = [
  "unpaid",
  "partial",
  "paid",
  "overdue",
  "cancelled",
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const INVOICE_TYPES = ["proforma", "tax_invoice", "receipt"] as const;
export type InvoiceType = (typeof INVOICE_TYPES)[number];

export interface InvoicePayment {
  amount: number;
  method: PaymentMethod;
  transactionId?: string;
  notes?: string;
  paidAt: string;
  recordedBy?: string;
}

export interface Invoice {
  id: string;
  agencyId: string;
  bookingId?: string;
  leadId?: string;
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  gstin?: string;
  taxPercentage: number;
  dueDate?: string;
  paidAmount: number;
  payments?: InvoicePayment[];
  pdfUrl?: string;
  pdfKey?: string;
  paymentLinkUrl?: string;
  paymentLinkExpiresAt?: string;
  notes?: string;
  termsAndConditions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceInput {
  bookingId?: string;
  leadId?: string;
  type: InvoiceType;
  subtotal: number;
  taxAmount?: number;
  total: number;
  currency?: string;
  gstin?: string;
  taxPercentage?: number;
  dueDate?: string;
  paidAmount?: number;
  notes?: string;
  termsAndConditions?: string;
}

export const PAYMENT_METHODS = [
  "cash",
  "bank_transfer",
  "cheque",
  "online_link",
  "razorpay",
  "stripe",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface BookingPayment {
  id: string;
  agencyId: string;
  bookingId: string;
  invoiceId?: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  transactionId?: string;
  paidAt: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const SUPPLIER_CATEGORIES = [
  "hotel",
  "transport",
  "airline",
  "guide",
  "activity",
  "insurance",
  "other",
] as const;
export type SupplierCategory = (typeof SUPPLIER_CATEGORIES)[number];

export interface Supplier {
  id: string;
  agencyId: string;
  name: string;
  category: SupplierCategory;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  gstin?: string;
  rating?: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierInput {
  name: string;
  category: SupplierCategory;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  gstin?: string;
  rating?: number;
  notes?: string;
  isActive?: boolean;
}

export interface SupplierRateCard {
  id: string;
  supplierId: string;
  itemName: string;
  seasonStart?: string;
  seasonEnd?: string;
  price: number;
  currency: string;
  unit: string;
  minQuantity?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierRateCardInput {
  itemName: string;
  seasonStart?: string;
  seasonEnd?: string;
  price: number;
  currency?: string;
  unit: string;
  minQuantity?: number;
  notes?: string;
}

export const DOCUMENT_CATEGORIES = [
  "passport",
  "contract",
  "voucher",
  "itinerary",
  "quote",
  "invoice",
  "other",
] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export interface DocumentFile {
  id: string;
  agencyId: string;
  leadId?: string;
  bookingId?: string;
  invoiceId?: string;
  category: DocumentCategory;
  fileName: string;
  url: string;
  key: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentInput {
  leadId?: string;
  bookingId?: string;
  invoiceId?: string;
  category: DocumentCategory;
  fileName: string;
  url: string;
  key: string;
  mimeType: string;
  size: number;
  description?: string;
}

export const TASK_TYPES = [
  "call",
  "email",
  "meeting",
  "follow_up",
  "document",
  "payment",
  "booking",
  "other",
] as const;
export type TaskType = (typeof TASK_TYPES)[number];

export const TASK_STATUSES = [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface TaskItem {
  id: string;
  agencyId: string;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt?: string;
  completedAt?: string;
  assignedTo: string;
  createdBy: string;
  leadId?: string;
  bookingId?: string;
  invoiceId?: string;
  documentId?: string;
  reminderAt?: string;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  type?: TaskType;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueAt?: string;
  assignedTo: string;
  leadId?: string;
  bookingId?: string;
  invoiceId?: string;
  documentId?: string;
  reminderAt?: string;
}

export const STAFF_ROLES = [
  "owner",
  "admin",
  "manager",
  "agent",
  "accountant",
  "viewer",
] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export interface StaffMember {
  id: string;
  agencyId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  role: StaffRole;
  permissions: string[];
  isActive: boolean;
  invitedBy?: string;
  joinedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: Array<{
    key: string;
    name: string;
    description?: string;
    included: boolean;
  }>;
  limits: {
    maxStaff: number;
    maxLeadsPerMonth: number;
    maxBookingsPerMonth: number;
    maxStorageGB: number;
    apiAccess: boolean;
    customBranding: boolean;
    prioritySupport: boolean;
  };
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgencySubscription {
  id: string;
  agencyId: string;
  planId: string;
  planName?: string;
  status: "trial" | "active" | "past_due" | "cancelled" | "expired";
  billingCycle: "monthly" | "yearly";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt?: string;
  cancelledAt?: string;
  cancelAtPeriodEnd: boolean;
  paymentMethod?: string;
  autoRenew: boolean;
  lastPaymentAt?: string;
  lastPaymentAmount?: number;
  lastPaymentMethod?: string;
  nextBillingAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformInvoice {
  id: string;
  agencyId: string;
  subscriptionId: string;
  invoiceNumber: string;
  status: "draft" | "sent" | "paid" | "overdue" | "void" | "refunded";
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  taxPercentage: number;
  dueDate: string;
  paidAt?: string;
  paymentMethod?: string;
  paymentReference?: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  createdAt: string;
  updatedAt: string;
}

export const STATUS_TONES: Record<
  string,
  "default" | "success" | "warning" | "danger" | "info" | "muted"
> = {
  new: "info",
  contacted: "warning",
  qualified: "info",
  won: "success",
  closed: "muted",
  draft: "muted",
  sent: "info",
  viewed: "warning",
  accepted: "success",
  expired: "danger",
  converted: "success",
  enquiry: "info",
  quoted: "warning",
  deposit_paid: "warning",
  confirmed: "success",
  completed: "success",
  cancelled: "danger",
  refunded: "muted",
  unpaid: "warning",
  partial: "warning",
  paid: "success",
  overdue: "danger",
  pending: "warning",
  in_progress: "info",
  trial: "info",
  active: "success",
  past_due: "danger",
  void: "muted",
};

export function titleCase(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
