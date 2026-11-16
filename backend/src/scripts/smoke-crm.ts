/* eslint-disable no-console */
import { env } from "../config/env";

const BASE_URL = (process.env.SMOKE_BASE_URL ?? `http://localhost:${env.PORT}/api/v1`).replace(/\/$/, "");
const EMAIL = process.env.SMOKE_EMAIL;
const PASSWORD = process.env.SMOKE_PASSWORD;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: Record<string, unknown>;
  error?: { code?: string; message?: string };
}

class SmokeFailure extends Error {}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new SmokeFailure(message);
  }
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  options: { token?: string; body?: unknown; query?: Record<string, string | number | boolean> } = {},
): Promise<ApiResponse<T>> {
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
  });

  const payload = (await response.json().catch(() => ({}))) as ApiResponse<T>;
  if (!response.ok || payload.success === false) {
    throw new SmokeFailure(
      `${method} ${url.pathname} failed with ${response.status}: ${payload.error?.message ?? "unknown error"}`
    );
  }
  return payload;
}

function assertPaginationMeta(data: unknown, label: string): void {
  const meta = data as Record<string, unknown> | undefined;
  assert(meta, `${label}: missing payload`);
  for (const key of ["items", "total", "page", "limit", "totalPages"]) {
    assert(key in (meta ?? {}), `${label}: missing pagination key "${key}"`);
  }
}

async function run(): Promise<void> {
  assert(EMAIL, "SMOKE_EMAIL is required");
  assert(PASSWORD, "SMOKE_PASSWORD is required");

  const signIn = await request<{ accessToken: string; user: { id: string }; agency?: { id: string } }>(
    "POST",
    "/auth/signin",
    { body: { email: EMAIL, password: PASSWORD } }
  );
  const token = signIn.data?.accessToken;
  assert(token, "signin did not return an access token");
  console.log("[ok] sign in");

  const leads = await request<{ items: unknown[]; total: number; page: number; limit: number; totalPages: number }>(
    "GET",
    "/leads",
    { token, query: { page: 1, limit: 5 } }
  );
  assertPaginationMeta(leads.data, "GET /leads");
  console.log(`[ok] GET /leads (total=${leads.data?.total})`);

  const pipelines = await request<{ items: unknown[] }>("GET", "/leads/pipeline", {
    token,
    query: { page: 1, limit: 100 },
  });
  assertPaginationMeta(pipelines.data, "GET /leads/pipeline");
  console.log("[ok] GET /leads/pipeline (limit=100 accepted)");

  const sources = await request<{ items: unknown[] }>("GET", "/leads/sources", {
    token,
    query: { page: 1, limit: 100 },
  });
  assertPaginationMeta(sources.data, "GET /leads/sources");
  console.log("[ok] GET /leads/sources (limit=100 accepted)");

  const dueReminders = await request<{ reminders: unknown[] }>("GET", "/followups/due", { token });
  assert(Array.isArray(dueReminders.data?.reminders), "GET /followups/due: missing reminders array");
  console.log(`[ok] GET /followups/due (agency scoped, count=${dueReminders.data?.reminders.length})`);

  const stamp = Date.now();
  const lead = await request<{ lead: { id: string } }>("POST", "/leads/agency", {
    token,
    body: {
      travelerName: "Smoke Traveller",
      travelerEmail: `smoke-${stamp}@example.com`,
      travelerPhone: "9999999999",
      message: "Automated CRM smoke run inquiry",
      travelerCount: 2,
    },
  });
  const leadId = lead.data?.lead.id;
  assert(leadId, "lead creation did not return an id");
  console.log(`[ok] POST /leads/agency (leadId=${leadId})`);

  const fetchedLead = await request<{ lead: { id: string; status: string } }>("GET", `/leads/${leadId}`, { token });
  assert(fetchedLead.data?.lead.id === leadId, "GET /leads/:id returned a different lead");
  console.log("[ok] GET /leads/:id");

  const validUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  const quotation = await request<{ quotation: { id: string; total: number } }>("POST", "/quotations", {
    token,
    body: {
      leadId,
      status: "sent",
      subtotal: 10000,
      taxAmount: 1800,
      discountAmount: 0,
      total: 11800,
      currency: "INR",
      validUntil,
    },
  });
  const quotationId = quotation.data?.quotation.id;
  assert(quotationId, "quotation creation did not return an id");
  console.log(`[ok] POST /quotations (quotationId=${quotationId})`);

  const startDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const endDate = new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString();
  const booking = await request<{ booking: { id: string; totalPrice: number } }>("POST", "/bookings", {
    token,
    body: {
      leadId,
      quotationId,
      travellers: [{ name: "Smoke Traveller", email: `smoke-${stamp}@example.com` }],
      startDate,
      endDate,
      departureDate: startDate,
      status: "quoted",
      totalPrice: 11800,
      currency: "INR",
    },
  });
  const bookingId = booking.data?.booking.id;
  assert(bookingId, "booking creation did not return an id");
  console.log(`[ok] POST /bookings (bookingId=${bookingId})`);

  const invoice = await request<{ invoice: { id: string; total: number; status: string; paidAmount: number } }>(
    "POST",
    "/invoices",
    {
      token,
      body: {
        bookingId,
        leadId,
        type: "tax_invoice",
        subtotal: 10000,
        taxAmount: 1800,
        total: 11800,
        currency: "INR",
        taxPercentage: 18,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    }
  );
  const invoiceId = invoice.data?.invoice.id;
  assert(invoiceId, "invoice creation did not return an id");
  assert(invoice.data?.invoice.status === "unpaid", `expected new invoice to be unpaid, got ${invoice.data?.invoice.status}`);
  console.log(`[ok] POST /invoices (invoiceId=${invoiceId}, status=unpaid)`);

  const partial = await request<{ invoice: { paidAmount: number; status: string; payments: unknown[] } }>(
    "POST",
    `/invoices/${invoiceId}/payment`,
    {
      token,
      body: { amount: 5000, method: "bank_transfer", transactionId: `smoke-${stamp}`, notes: "smoke run" },
    }
  );
  assert(partial.data?.invoice.paidAmount === 5000, `expected paidAmount 5000, got ${partial.data?.invoice.paidAmount}`);
  assert(partial.data?.invoice.status === "partial", `expected status partial, got ${partial.data?.invoice.status}`);
  assert(
    (partial.data?.invoice.payments?.length ?? 0) === 0,
    "invoice linked to a booking should record the payment in the booking payment ledger"
  );
  console.log("[ok] POST /invoices/:id/payment (partial payment, status=partial)");

  const full = await request<{ invoice: { paidAmount: number; status: string } }>("POST", `/invoices/${invoiceId}/payment`, {
    token,
    body: { amount: 6800, method: "cash" },
  });
  assert(full.data?.invoice.paidAmount === 11800, `expected paidAmount 11800, got ${full.data?.invoice.paidAmount}`);
  assert(full.data?.invoice.status === "paid", `expected status paid, got ${full.data?.invoice.status}`);
  console.log("[ok] POST /invoices/:id/payment (full payment, status=paid)");

  const bookingTotal = await request<{ total: number }>("GET", `/booking-payments/booking/${bookingId}/total`, { token });
  assert(bookingTotal.data?.total === 11800, `expected booking payment total 11800, got ${bookingTotal.data?.total}`);
  console.log("[ok] GET /booking-payments/booking/:id/total (single ledger)");

  const refreshedBooking = await request<{ booking: { paidAmount: number; status: string } }>("GET", `/bookings/${bookingId}`, {
    token,
  });
  assert(
    refreshedBooking.data?.booking.paidAmount === 11800,
    `expected booking paidAmount 11800, got ${refreshedBooking.data?.booking.paidAmount}`
  );
  assert(
    refreshedBooking.data?.booking.status === "confirmed",
    `expected booking status confirmed, got ${refreshedBooking.data?.booking.status}`
  );
  console.log("[ok] GET /bookings/:id (paidAmount and status synced from ledger)");

  const invoices = await request<{ invoices: { items: unknown[]; total: number; page: number; limit: number; totalPages: number } }>(
    "GET",
    "/invoices",
    { token, query: { page: 1, limit: 20 } }
  );
  assertPaginationMeta(invoices.data?.invoices, "GET /invoices");
  console.log("[ok] GET /invoices (pagination meta present)");

  const tasks = await request<{ tasks: { items: unknown[]; total: number; page: number; limit: number; totalPages: number } }>(
    "GET",
    "/tasks",
    { token, query: { page: 1, limit: 20 } }
  );
  assertPaginationMeta(tasks.data?.tasks, "GET /tasks");
  console.log("[ok] GET /tasks (pagination meta present)");

  const staff = await request<{ staff: { items: unknown[]; total: number; page: number; limit: number; totalPages: number } }>(
    "GET",
    "/staff",
    { token, query: { page: 1, limit: 20 } }
  );
  assertPaginationMeta(staff.data?.staff, "GET /staff");
  console.log("[ok] GET /staff (pagination meta present)");

  console.log("\nAll CRM smoke checks passed.");
}

run().catch((error: unknown) => {
  if (error instanceof SmokeFailure) {
    console.error(`\n[fail] ${error.message}`);
  } else {
    console.error("\n[fail] unexpected error:", error);
  }
  process.exit(1);
});
