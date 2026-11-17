export interface OutstandingReportQuery {
  page?: number;
  limit?: number;
}

export interface OutstandingInvoice {
  id: string;
  invoiceNumber: string;
  leadId?: string;
  travellerName?: string;
  travellerEmail?: string;
  bookingId?: string;
  bookingNumber?: string;
  total: number;
  paidAmount: number;
  outstanding: number;
  currency: string;
  dueDate?: string;
  daysOverdue: number;
  status: "unpaid" | "partial";
}

export interface OutstandingReportResponse {
  items: OutstandingInvoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CommissionStaff {
  staffId: string;
  staffName: string;
  staffEmail: string;
  commissionRate: number;
  totalPaid: number;
  paymentCount: number;
  commission: number;
}

export interface CommissionReportQuery {
  paidFrom?: string;
  paidTo?: string;
}

export interface CommissionReportResponse {
  items: CommissionStaff[];
  totalCommission: number;
  staffCount: number;
}
