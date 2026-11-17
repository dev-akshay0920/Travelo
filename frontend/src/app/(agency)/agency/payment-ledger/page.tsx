"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, CreditCard, Trash2 } from "lucide-react";

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
import { formatCurrency, formatDateTime } from "@/features/agency/lib/format";
import {
  createBookingPaymentApi,
  deleteBookingPaymentApi,
  listAllBookingPaymentsApi,
} from "@/features/agency/api/crm.api";
import type { BookingPayment } from "@/features/agency/types/crm.types";

type MethodFilter = "all" | "cash" | "bank_transfer" | "cheque" | "online_link" | "razorpay" | "stripe";

const PAGE_LIMIT = 20;

const METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  bank_transfer: "Bank transfer",
  cheque: "Cheque",
  online_link: "Online link",
  razorpay: "Razorpay",
  stripe: "Stripe",
};

export default function AgencyPaymentLedgerPage() {
  const [payments, setPayments] = useState<BookingPayment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [methodFilter, setMethodFilter] = useState<MethodFilter>("all");
  const [paidFrom, setPaidFrom] = useState("");
  const [paidTo, setPaidTo] = useState("");
  const [bookingIdFilter, setBookingIdFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState({
    bookingId: "",
    invoiceId: "",
    amount: "",
    method: "cash" as BookingPayment["method"],
    transactionId: "",
    notes: "",
  });

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const value = await listAllBookingPaymentsApi({
        page,
        limit: PAGE_LIMIT,
        method: methodFilter === "all" ? undefined : methodFilter,
        paidFrom: paidFrom || undefined,
        paidTo: paidTo || undefined,
        bookingId: bookingIdFilter || undefined,
      });
      setPayments(value.items);
      setTotal(value.total);
    } catch {
      setPayments([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, methodFilter, paidFrom, paidTo, bookingIdFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [methodFilter, paidFrom, paidTo, bookingIdFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const grandTotal = payments.reduce((sum, p) => sum + p.amount, 0);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this payment record?")) return;
    try {
      await deleteBookingPaymentApi(id);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete payment.");
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.bookingId.trim() || !form.amount.trim()) {
      alert("Booking and amount are required.");
      return;
    }
    const amount = Number(form.amount);
    if (!amount || amount <= 0) {
      alert("Enter a valid amount.");
      return;
    }
    setDialog(false);
    try {
      await createBookingPaymentApi({
        bookingId: form.bookingId,
        invoiceId: form.invoiceId || undefined,
        amount,
        method: form.method,
        transactionId: form.transactionId || undefined,
        notes: form.notes || undefined,
      });
      setForm({
        bookingId: "",
        invoiceId: "",
        amount: "",
        method: "cash",
        transactionId: "",
        notes: "",
      });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to record payment.");
    }
  };

  return (
    <AgencyModulePage
      tab="ledger"
      title="Payment ledger"
      description="All payments recorded across your agency."
      actions={
        <Button onClick={() => setDialog(true)}>
          <CreditCard className="size-4 mr-2" aria-hidden="true" />
          Record payment
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="method-filter">Method</Label>
            <Select value={methodFilter} onValueChange={(value) => setMethodFilter(value as MethodFilter)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {Object.entries(METHOD_LABELS).map(([method, label]) => (
                  <SelectItem key={method} value={method as MethodFilter}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paid-from">From</Label>
            <Input id="paid-from" type="datetime-local" value={paidFrom} onChange={(event) => setPaidFrom(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paid-to">To</Label>
            <Input id="paid-to" type="datetime-local" value={paidTo} onChange={(event) => setPaidTo(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="booking-filter">Booking ID</Label>
            <Input id="booking-filter" value={bookingIdFilter} onChange={(event) => setBookingIdFilter(event.target.value)} placeholder="Optional" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-caption text-muted-foreground">
            {total} payment{(total === 1 ? "" : "s")} &middot;
            {formatCurrency(grandTotal, "INR")} total
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1 || isLoading} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Button>
            <span className="text-caption text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= totalPages || isLoading} onClick={() => setPage(page + 1)}>
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
        ) : payments.length === 0 ? (
          <div className="rounded-lg border border-border/50 p-8 text-center">
            <p className="text-muted-foreground">No payments match these filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50 rounded-lg border border-border">
            {payments.map((payment) => (
              <div key={payment.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-body-sm font-medium">{payment.bookingId}</p>
                  <p className="mt-0.5 text-caption text-muted-foreground flex items-center gap-1">
                    {payment.invoiceId ? `Invoice ${payment.invoiceId}` : "No invoice"} &middot;
                    {METHOD_LABELS[payment.method]}
                  </p>
                  <p className="mt-0.5 text-caption text-muted-foreground flex items-center gap-1">
                    {formatDateTime(payment.paidAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-right font-medium text-body-sm">
                    {formatCurrency(payment.amount, payment.currency)}
                  </span>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(payment.id)}>
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
            <DialogTitle>Record payment</DialogTitle>
            <DialogDescription>Record a payment against a booking.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pl-booking">Booking ID</Label>
                <Input
                  id="pl-booking"
                  value={form.bookingId}
                  onChange={(event) => setForm((current) => ({ ...current, bookingId: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pl-invoice">Invoice ID (optional)</Label>
                <Input
                  id="pl-invoice"
                  value={form.invoiceId}
                  onChange={(event) => setForm((current) => ({ ...current, invoiceId: event.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pl-amount">Amount</Label>
                <Input
                  id="pl-amount"
                  type="number"
                  min={0}
                  value={form.amount}
                  onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pl-method">Method</Label>
                <Select value={form.method} onValueChange={(value) => setForm((current) => ({ ...current, method: value as BookingPayment["method"] }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(METHOD_LABELS).map(([method, label]) => (
                      <SelectItem key={method} value={method as BookingPayment["method"]}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pl-txn">Transaction ID</Label>
              <Input
                id="pl-txn"
                value={form.transactionId}
                onChange={(event) => setForm((current) => ({ ...current, transactionId: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pl-notes">Notes</Label>
              <Input
                id="pl-notes"
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Record payment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AgencyModulePage>
  );
}
