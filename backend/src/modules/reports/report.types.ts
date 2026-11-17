export interface OutstandingReportQuery {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
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
  summary: {
    totalInvoiced: number;
    totalPaid: number;
    totalOutstanding: number;
    invoiceCount: number;
  };
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
  summary: {
    totalPaid: number;
    paymentCount: number;
  };
}

export interface CsvExportResponse {
  filename: string;
  contentType: string;
  data: string;
}
