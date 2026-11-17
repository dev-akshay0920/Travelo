"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CreditCard,
  Loader2,
  Plus,
  Receipt,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageStack } from "@/components/shared/page-container";
import { AgencyModulePage } from "@/features/agency/components/agency-module-page";
import { DetailRow, EmptyBlock, SectionCard, StatusPill } from "@/features/agency/components/crm-ui";
import {
  Chat,
} from "@/features/chat/components/chat";
import {
  addSupplierBookingApi,
  createBookingPaymentApi,
  deleteBookingApi,
  deleteBookingPaymentApi,
  getBookingApi,
  listBookingPaymentsApi,
  listInvoicesApi,
  listSuppliersApi,
  updateBookingApi,
  updateBookingStatusApi,
} from "@/features/agency/api/crm.api";
import { formatCurrency, formatDate, formatDateTime, toDateInputValue } from "@/features/agency/lib/format";
import type {
  Booking,
  BookingPayment,
  BookingStatus,
  Invoice,
  PaymentMethod,
  Supplier,
} from "@/features/agency/types/crm.types";
import { BOOKING_STATUSES, PAYMENT_METHODS } from "@/features/agency/types/crm.types";

const toIso = (value: string) =>
  value ? new Date(`${value}T00:00:00.000Z`).toISOString() : undefined;

export default function BookingDetailPage() {
  const params = useParams<{ bookingId: string }>();
  const bookingId = String(params.bookingId ?? "");
  const router = useRouter();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [payments, setPayments] = useState<BookingPayment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [form, setForm] = useState({
    status: "enquiry" as BookingStatus,
    startDate: "",
    endDate: "",
    departureDate: "",
    totalPrice: "",
    paidAmount: "",
    currency: "INR",
    voucherUrl: "",
    voucherKey: "",
  });
  const [supplierForm, setSupplierForm] = useState({
    supplierId: "",
    referenceNumber: "",
    checkIn: "",
    checkOut: "",
    guests: "",
    rooms: "",
    totalCost: "",
    currency: "INR",
    status: "pending" as "pending" | "confirmed" | "cancelled",
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "cash" as PaymentMethod,
    transactionId: "",
    notes: "",
  });

  const load = useCallback(async () => {
    if (!bookingId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [bookingValue, supplierValue, paymentValue, invoiceValue] = await Promise.all([
        getBookingApi(bookingId),
        listSuppliersApi({ page: 1, limit: 100, isActive: true }).catch(() => ({ items: [], total: 0, page: 1, limit: 0, totalPages: 0 })),
        listBookingPaymentsApi(bookingId).catch(() => []),
        listInvoicesApi({ bookingId, page: 1, limit: 20 }).catch(() => ({ items: [], total: 0, page: 1, limit: 0, totalPages: 0 })),
      ]);
      setBooking(bookingValue);
      setSuppliers(supplierValue.items);
      setPayments(paymentValue);
      setInvoices(invoiceValue.items);
      setForm({
        status: bookingValue.status,
        startDate: toDateInputValue(bookingValue.startDate),
        endDate: toDateInputValue(bookingValue.endDate),
        departureDate: toDateInputValue(bookingValue.departureDate),
        totalPrice: String(bookingValue.totalPrice ?? ""),
        paidAmount: String(bookingValue.paidAmount ?? ""),
        currency: bookingValue.currency,
        voucherUrl: bookingValue.voucherUrl ?? "",
        voucherKey: bookingValue.voucherKey ?? "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load booking.");
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateBookingApi(bookingId, {
        startDate: toIso(form.startDate),
        endDate: toIso(form.endDate),
        departureDate: toIso(form.departureDate),
        totalPrice: form.totalPrice ? Number(form.totalPrice) : undefined,
        paidAmount: form.paidAmount ? Number(form.paidAmount) : undefined,
        currency: form.currency.toUpperCase(),
        voucherUrl: form.voucherUrl.trim() || undefined,
        voucherKey: form.voucherKey.trim() || undefined,
      });
      await updateBookingStatusApi(bookingId, form.status);
      toast.success("Booking updated.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update booking.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSupplier = async () => {
    if (!supplierForm.supplierId || !supplierForm.totalCost) {
      toast.error("Select a supplier and enter the cost.");
      return;
    }
    setIsAddingSupplier(true);
    try {
      await addSupplierBookingApi(bookingId, {
        supplierId: supplierForm.supplierId,
        referenceNumber: supplierForm.referenceNumber.trim() || undefined,
        checkIn: supplierForm.checkIn ? toIso(supplierForm.checkIn) : undefined,
        checkOut: supplierForm.checkOut ? toIso(supplierForm.checkOut) : undefined,
        guests: supplierForm.guests ? Number(supplierForm.guests) : undefined,
        rooms: supplierForm.rooms ? Number(supplierForm.rooms) : undefined,
        totalCost: Number(supplierForm.totalCost),
        currency: supplierForm.currency.toUpperCase(),
        status: supplierForm.status,
      });
      toast.success("Supplier booking added.");
      setSupplierForm({
        supplierId: "",
        referenceNumber: "",
        checkIn: "",
        checkOut: "",
        guests: "",
        rooms: "",
        totalCost: "",
        currency: "INR",
        status: "pending",
      });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add supplier booking.");
    } finally {
      setIsAddingSupplier(false);
    }
  };

  const handleAddPayment = async () => {
    if (!paymentForm.amount) {
      toast.error("Enter a payment amount.");
      return;
    }
    setIsAddingPayment(true);
    try {
      await createBookingPaymentApi({
        bookingId,
        amount: Number(paymentForm.amount),
        currency: booking?.currency,
        method: paymentForm.method,
        transactionId: paymentForm.transactionId.trim() || undefined,
        notes: paymentForm.notes.trim() || undefined,
      });
      toast.success("Payment recorded.");
      setPaymentForm({ amount: "", method: "cash", transactionId: "", notes: "" });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to record payment.");
    } finally {
      setIsAddingPayment(false);
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!window.confirm("Delete this payment record?")) return;
    try {
      await deleteBookingPaymentApi(id);
      await load();
      toast.success("Payment deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete payment.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this booking? This cannot be undone.")) return;
    try {
      await deleteBookingApi(bookingId);
      toast.success("Booking deleted.");
      router.push("/agency/bookings");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete booking.");
    }
  };

  if (isLoading) {
    return (
      <AgencyModulePage tab="bookings" title="Booking">
        <LoadingState />
      </AgencyModulePage>
    );
  }

  if (error || !booking) {
    return (
      <AgencyModulePage tab="bookings" title="Booking">
        <ErrorState
          title="Could not load this booking"
          description={error ?? "Booking not found."}
          action={
            <Button variant="outline" onClick={() => router.push("/agency/bookings")}>
              Back to bookings
            </Button>
          }
        />
      </AgencyModulePage>
    );
  }

  const balance = booking.totalPrice - booking.paidAmount;

  return (
    <AgencyModulePage
      tab="bookings"
      title={`Booking ${booking.bookingNumber}`}
      description={`${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}`}
      actions={
        <>
          <Button variant="outline" asChild>
            <Link href="/agency/bookings">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/agency/invoices/new?bookingId=${booking.id}&subtotal=${booking.totalPrice}`}>
              <Receipt className="size-4" aria-hidden="true" />
              Invoice
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="size-4" aria-hidden="true" />
            )}
            Save
          </Button>
        </>
      }
    >
      <PageStack>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-caption uppercase text-muted-foreground">Status</p>
              <div className="mt-2">
                <StatusPill status={booking.status} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-caption uppercase text-muted-foreground">Total</p>
              <p className="mt-2 text-xl font-semibold">
                {formatCurrency(booking.totalPrice, booking.currency)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-caption uppercase text-muted-foreground">Paid</p>
              <p className="mt-2 text-xl font-semibold">
                {formatCurrency(booking.paidAmount, booking.currency)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-caption uppercase text-muted-foreground">Balance</p>
              <p className="mt-2 text-xl font-semibold">
                {formatCurrency(balance, booking.currency)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <SectionCard title="Travellers" description={`${booking.travellers.length} traveller(s) on this booking.`}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Passport</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {booking.travellers.map((traveller, index) => (
                    <TableRow key={`${traveller.name}-${index}`}>
                      <TableCell className="font-medium">{traveller.name}</TableCell>
                      <TableCell>{traveller.passportNumber ?? "-"}</TableCell>
                      <TableCell>{traveller.email ?? "-"}</TableCell>
                      <TableCell>{traveller.phone ?? "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SectionCard>

            <SectionCard
              title="Supplier bookings"
              description="Hotels, transport and activities attached to this trip."
            >
              {booking.supplierBookings.length === 0 ? (
                <EmptyBlock title="No supplier bookings" description="Add one below." />
              ) : (
                <div className="space-y-2">
                  {booking.supplierBookings.map((item, index) => (
                    <div
                      key={item.id ?? `${item.supplierId}-${index}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/70 px-3 py-2"
                    >
                      <div>
                        <p className="text-body-sm font-medium">
                          {suppliers.find((supplier) => supplier.id === item.supplierId)?.name ??
                            "Supplier"}
                        </p>
                        <p className="text-caption text-muted-foreground">
                          {item.referenceNumber ? `${item.referenceNumber} - ` : ""}
                          {item.checkIn ? formatDate(item.checkIn) : "-"} to{" "}
                          {item.checkOut ? formatDate(item.checkOut) : "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-body-sm">
                          {formatCurrency(item.totalCost, item.currency)}
                        </span>
                        <StatusPill status={item.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 grid gap-3 rounded-lg border border-dashed border-border p-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Supplier</Label>
                  <Select
                    value={supplierForm.supplierId || "none"}
                    onValueChange={(value) =>
                      setSupplierForm((current) => ({
                        ...current,
                        supplierId: value === "none" ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select supplier</SelectItem>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="supplier-reference">Reference</Label>
                  <Input
                    id="supplier-reference"
                    value={supplierForm.referenceNumber}
                    onChange={(event) =>
                      setSupplierForm((current) => ({
                        ...current,
                        referenceNumber: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="supplier-checkin">Check in</Label>
                  <Input
                    id="supplier-checkin"
                    type="date"
                    value={supplierForm.checkIn}
                    onChange={(event) =>
                      setSupplierForm((current) => ({ ...current, checkIn: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="supplier-checkout">Check out</Label>
                  <Input
                    id="supplier-checkout"
                    type="date"
                    value={supplierForm.checkOut}
                    onChange={(event) =>
                      setSupplierForm((current) => ({ ...current, checkOut: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="supplier-cost">Total cost</Label>
                  <Input
                    id="supplier-cost"
                    type="number"
                    min={0}
                    value={supplierForm.totalCost}
                    onChange={(event) =>
                      setSupplierForm((current) => ({
                        ...current,
                        totalCost: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={supplierForm.status}
                    onValueChange={(value) =>
                      setSupplierForm((current) => ({
                        ...current,
                        status: value as "pending" | "confirmed" | "cancelled",
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Button onClick={handleAddSupplier} disabled={isAddingSupplier}>
                    {isAddingSupplier ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Plus className="size-4" aria-hidden="true" />
                    )}
                    Add supplier booking
                  </Button>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Payments" description="Every payment recorded against this booking.">
              {payments.length === 0 ? (
                <EmptyBlock title="No payments yet" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Paid at</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {formatCurrency(payment.amount, payment.currency)}
                        </TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDateTime(payment.paidAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePayment(payment.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <div className="mt-4 grid gap-3 rounded-lg border border-dashed border-border p-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="payment-amount">Amount</Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    min={0}
                    value={paymentForm.amount}
                    onChange={(event) =>
                      setPaymentForm((current) => ({ ...current, amount: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Method</Label>
                  <Select
                    value={paymentForm.method}
                    onValueChange={(value) =>
                      setPaymentForm((current) => ({
                        ...current,
                        method: value as PaymentMethod,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="payment-reference">Transaction ID</Label>
                  <Input
                    id="payment-reference"
                    value={paymentForm.transactionId}
                    onChange={(event) =>
                      setPaymentForm((current) => ({
                        ...current,
                        transactionId: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    className="w-full"
                    onClick={handleAddPayment}
                    disabled={isAddingPayment}
                  >
                    {isAddingPayment ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <CreditCard className="size-4" aria-hidden="true" />
                    )}
                    Record payment
                  </Button>
                </div>
              </div>
            </SectionCard>
            <SectionCard title="Chat" description="Message the traveller about this booking.">
              <Chat leadId={booking.leadId ?? ""} />
            </SectionCard>
          </div>

          <div className="space-y-5">
            <SectionCard title="Booking details">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      setForm((current) => ({ ...current, status: value as BookingStatus }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BOOKING_STATUSES.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="booking-start-date">Start date</Label>
                  <Input
                    id="booking-start-date"
                    type="date"
                    value={form.startDate}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, startDate: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="booking-end-date">End date</Label>
                  <Input
                    id="booking-end-date"
                    type="date"
                    value={form.endDate}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, endDate: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="booking-departure-date">Departure</Label>
                  <Input
                    id="booking-departure-date"
                    type="date"
                    value={form.departureDate}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, departureDate: event.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="booking-total-price">Total</Label>
                    <Input
                      id="booking-total-price"
                      type="number"
                      min={0}
                      value={form.totalPrice}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, totalPrice: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="booking-paid-amount">Paid</Label>
                    <Input
                      id="booking-paid-amount"
                      type="number"
                      min={0}
                      value={form.paidAmount}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, paidAmount: event.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="booking-currency-code">Currency</Label>
                  <Input
                    id="booking-currency-code"
                    maxLength={3}
                    value={form.currency}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        currency: event.target.value.toUpperCase(),
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="booking-voucher">Voucher URL</Label>
                  <Input
                    id="booking-voucher"
                    value={form.voucherUrl}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, voucherUrl: event.target.value }))
                    }
                    placeholder="https://"
                  />
                </div>
                <Button className="w-full" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Save className="size-4" aria-hidden="true" />
                  )}
                  Save changes
                </Button>
              </div>
            </SectionCard>

            <SectionCard title="Linked records">
              <DetailRow label="Lead" value={booking.leadId ?? "-"} />
              <DetailRow label="Quotation" value={booking.quotationId ?? "-"} />
              <DetailRow label="Itinerary" value={booking.itineraryId ?? "-"} />
              <DetailRow label="Created" value={formatDateTime(booking.createdAt)} />
              <div className="mt-3 space-y-2">
                {invoices.length === 0 ? (
                  <EmptyBlock
                    title="No invoices"
                    action={
                      <Button size="sm" asChild>
                        <Link href={`/agency/invoices/new?bookingId=${booking.id}`}>
                          <Receipt className="size-4" aria-hidden="true" />
                          Create invoice
                        </Link>
                      </Button>
                    }
                  />
                ) : (
                  invoices.map((invoice) => (
                    <Link
                      key={invoice.id}
                      href={`/agency/invoices/${invoice.id}`}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-body-sm hover:border-primary/50"
                    >
                      <span className="font-medium">{invoice.invoiceNumber}</span>
                      <StatusPill status={invoice.status} />
                    </Link>
                  ))
                )}
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/agency/suppliers`}>
                    <Building2 className="size-4" aria-hidden="true" />
                    Manage suppliers
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Delete booking
                </Button>
              </div>
            </SectionCard>
          </div>
        </div>
      </PageStack>
    </AgencyModulePage>
  );
}
