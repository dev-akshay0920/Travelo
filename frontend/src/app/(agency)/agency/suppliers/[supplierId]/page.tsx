"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { DetailRow, SectionCard, StatusPill } from "@/features/agency/components/crm-ui";
import {
  createRateCardApi,
  deleteRateCardApi,
  deleteSupplierApi,
  getSupplierApi,
  listRateCardsApi,
  updateRateCardApi,
  updateSupplierApi,
} from "@/features/agency/api/crm.api";
import { formatCurrency, formatDate, toDateInputValue } from "@/features/agency/lib/format";
import {
  SUPPLIER_CATEGORIES,
  titleCase,
  type Supplier,
  type SupplierCategory,
  type SupplierRateCard,
} from "@/features/agency/types/crm.types";

const toIso = (value: string) =>
  value ? new Date(`${value}T00:00:00.000Z`).toISOString() : undefined;

const EMPTY_RATE = {
  itemName: "",
  seasonStart: "",
  seasonEnd: "",
  price: "",
  currency: "INR",
  unit: "per night",
  minQuantity: "",
  notes: "",
};

export default function SupplierDetailPage() {
  const params = useParams<{ supplierId: string }>();
  const supplierId = String(params.supplierId ?? "");
  const router = useRouter();

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [rateCards, setRateCards] = useState<SupplierRateCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRateOpen, setIsRateOpen] = useState(false);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [isRateSaving, setIsRateSaving] = useState(false);
  const [rateForm, setRateForm] = useState({ ...EMPTY_RATE });
  const [form, setForm] = useState({
    name: "",
    category: "hotel" as SupplierCategory,
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    gstin: "",
    rating: "",
    notes: "",
    isActive: true,
  });

  const load = useCallback(async () => {
    if (!supplierId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [value, cards] = await Promise.all([
        getSupplierApi(supplierId),
        listRateCardsApi(supplierId).catch(() => ({
          items: [] as SupplierRateCard[],
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        })),
      ]);
      setSupplier(value);
      setRateCards(cards.items);
      setForm({
        name: value.name,
        category: value.category,
        contactPerson: value.contactPerson ?? "",
        phone: value.phone ?? "",
        email: value.email ?? "",
        address: value.address ?? "",
        gstin: value.gstin ?? "",
        rating: value.rating ? String(value.rating) : "",
        notes: value.notes ?? "",
        isActive: value.isActive,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load supplier.");
    } finally {
      setIsLoading(false);
    }
  }, [supplierId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Supplier name is required.");
      return;
    }
    setIsSaving(true);
    try {
      await updateSupplierApi(supplierId, {
        name: form.name.trim(),
        category: form.category,
        contactPerson: form.contactPerson.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        gstin: form.gstin.trim() || undefined,
        rating: form.rating ? Number(form.rating) : undefined,
        notes: form.notes.trim() || undefined,
        isActive: form.isActive,
      });
      toast.success("Supplier updated.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update supplier.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this supplier?")) return;
    try {
      await deleteSupplierApi(supplierId);
      toast.success("Supplier deleted.");
      router.push("/agency/suppliers");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete supplier.");
    }
  };

  const openCreateRate = () => {
    setEditingRateId(null);
    setRateForm({ ...EMPTY_RATE });
    setIsRateOpen(true);
  };

  const openEditRate = (card: SupplierRateCard) => {
    setEditingRateId(card.id);
    setRateForm({
      itemName: card.itemName,
      seasonStart: toDateInputValue(card.seasonStart),
      seasonEnd: toDateInputValue(card.seasonEnd),
      price: String(card.price),
      currency: card.currency,
      unit: card.unit,
      minQuantity: card.minQuantity ? String(card.minQuantity) : "",
      notes: card.notes ?? "",
    });
    setIsRateOpen(true);
  };

  const handleSaveRate = async () => {
    if (!rateForm.itemName.trim() || !rateForm.unit.trim()) {
      toast.error("Item name and unit are required.");
      return;
    }
    const payload = {
      itemName: rateForm.itemName.trim(),
      seasonStart: toIso(rateForm.seasonStart),
      seasonEnd: toIso(rateForm.seasonEnd),
      price: Number(rateForm.price) || 0,
      currency: rateForm.currency.toUpperCase(),
      unit: rateForm.unit.trim(),
      minQuantity: rateForm.minQuantity ? Number(rateForm.minQuantity) : undefined,
      notes: rateForm.notes.trim() || undefined,
    };
    setIsRateSaving(true);
    try {
      if (editingRateId) {
        await updateRateCardApi(supplierId, editingRateId, payload);
        toast.success("Rate card updated.");
      } else {
        await createRateCardApi(supplierId, payload);
        toast.success("Rate card added.");
      }
      setIsRateOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save rate card.");
    } finally {
      setIsRateSaving(false);
    }
  };

  const handleDeleteRate = async (rateCardId: string) => {
    if (!window.confirm("Delete this rate card?")) return;
    try {
      await deleteRateCardApi(supplierId, rateCardId);
      toast.success("Rate card deleted.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete rate card.");
    }
  };

  if (isLoading) {
    return (
      <AgencyModulePage tab="suppliers" title="Supplier">
        <LoadingState />
      </AgencyModulePage>
    );
  }

  if (error || !supplier) {
    return (
      <AgencyModulePage tab="suppliers" title="Supplier">
        <ErrorState
          title="Could not load this supplier"
          description={error ?? "Supplier not found."}
          action={
            <Button variant="outline" onClick={() => router.push("/agency/suppliers")}>
              Back to suppliers
            </Button>
          }
        />
      </AgencyModulePage>
    );
  }

  return (
    <AgencyModulePage
      tab="suppliers"
      title={supplier.name}
      description={`${titleCase(supplier.category)} supplier`}
      actions={
        <>
          <Button variant="outline" asChild>
            <Link href="/agency/suppliers">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
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
                <StatusPill status={supplier.isActive ? "active" : "inactive"} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-caption uppercase text-muted-foreground">Category</p>
              <p className="mt-2 text-xl font-semibold">{titleCase(supplier.category)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-caption uppercase text-muted-foreground">Rating</p>
              <p className="mt-2 text-xl font-semibold">{supplier.rating ?? "-"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-caption uppercase text-muted-foreground">Rate cards</p>
              <p className="mt-2 text-xl font-semibold">{rateCards.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <SectionCard title="Supplier details">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="supplier-name">Name</Label>
                  <Input
                    id="supplier-name"
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        category: value as SupplierCategory,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPLIER_CATEGORIES.map((item) => (
                        <SelectItem key={item} value={item}>
                          {titleCase(item)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={form.isActive ? "active" : "inactive"}
                    onValueChange={(value) =>
                      setForm((current) => ({ ...current, isActive: value === "active" }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="supplier-contact">Contact person</Label>
                  <Input
                    id="supplier-contact"
                    value={form.contactPerson}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        contactPerson: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="supplier-phone">Phone</Label>
                  <Input
                    id="supplier-phone"
                    value={form.phone}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, phone: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="supplier-email">Email</Label>
                  <Input
                    id="supplier-email"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, email: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="supplier-gstin">GSTIN</Label>
                  <Input
                    id="supplier-gstin"
                    value={form.gstin}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, gstin: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="supplier-rating">Rating</Label>
                  <Input
                    id="supplier-rating"
                    type="number"
                    min={1}
                    max={5}
                    value={form.rating}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, rating: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="supplier-address">Address</Label>
                  <Input
                    id="supplier-address"
                    value={form.address}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, address: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="supplier-notes">Notes</Label>
                  <textarea
                    id="supplier-notes"
                    rows={3}
                    value={form.notes}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, notes: event.target.value }))
                    }
                    className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Rate cards"
              description="Pricing you have negotiated with this supplier."
              action={
                <Button size="sm" onClick={openCreateRate}>
                  <Plus className="size-4" aria-hidden="true" />
                  Add rate card
                </Button>
              }
            >
              {rateCards.length === 0 ? (
                <EmptyState
                  title="No rate cards yet"
                  description="Add negotiated rates to reuse them in quotes."
                  action={
                    <Button size="sm" onClick={openCreateRate}>
                      <Plus className="size-4" aria-hidden="true" />
                      Add rate card
                    </Button>
                  }
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Season</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rateCards.map((card) => (
                      <TableRow key={card.id}>
                        <TableCell className="font-medium">{card.itemName}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {card.seasonStart || card.seasonEnd
                            ? `${formatDate(card.seasonStart)} - ${formatDate(card.seasonEnd)}`
                            : "All year"}
                        </TableCell>
                        <TableCell>{formatCurrency(card.price, card.currency)}</TableCell>
                        <TableCell>{card.unit}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditRate(card)}
                              aria-label="Edit rate card"
                            >
                              <Pencil className="size-4" aria-hidden="true" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteRate(card.id)}
                              aria-label="Delete rate card"
                            >
                              <Trash2 className="size-4 text-destructive" aria-hidden="true" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </SectionCard>
          </div>

          <div className="space-y-5">
            <SectionCard title="Profile">
              <DetailRow label="Created" value={formatDate(supplier.createdAt)} />
              <DetailRow label="Last updated" value={formatDate(supplier.updatedAt)} />
              <DetailRow label="Phone" value={supplier.phone ?? "-"} />
              <DetailRow label="Email" value={supplier.email ?? "-"} />
              <DetailRow label="GSTIN" value={supplier.gstin ?? "-"} />
            </SectionCard>

            <SectionCard title="Actions">
              <Button
                variant="outline"
                className="w-full justify-start text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Delete supplier
              </Button>
            </SectionCard>
          </div>
        </div>
      </PageStack>

      <Dialog open={isRateOpen} onOpenChange={setIsRateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRateId ? "Edit rate card" : "Add rate card"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="rate-item">Item name</Label>
              <Input
                id="rate-item"
                value={rateForm.itemName}
                onChange={(event) =>
                  setRateForm((current) => ({ ...current, itemName: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rate-season-start">Season start</Label>
              <Input
                id="rate-season-start"
                type="date"
                value={rateForm.seasonStart}
                onChange={(event) =>
                  setRateForm((current) => ({ ...current, seasonStart: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rate-season-end">Season end</Label>
              <Input
                id="rate-season-end"
                type="date"
                value={rateForm.seasonEnd}
                onChange={(event) =>
                  setRateForm((current) => ({ ...current, seasonEnd: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rate-price">Price</Label>
              <Input
                id="rate-price"
                type="number"
                min={0}
                value={rateForm.price}
                onChange={(event) =>
                  setRateForm((current) => ({ ...current, price: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rate-currency">Currency</Label>
              <Input
                id="rate-currency"
                maxLength={3}
                value={rateForm.currency}
                onChange={(event) =>
                  setRateForm((current) => ({
                    ...current,
                    currency: event.target.value.toUpperCase(),
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rate-unit">Unit</Label>
              <Input
                id="rate-unit"
                value={rateForm.unit}
                onChange={(event) =>
                  setRateForm((current) => ({ ...current, unit: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rate-min-qty">Min quantity</Label>
              <Input
                id="rate-min-qty"
                type="number"
                min={1}
                value={rateForm.minQuantity}
                onChange={(event) =>
                  setRateForm((current) => ({ ...current, minQuantity: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="rate-notes">Notes</Label>
              <Input
                id="rate-notes"
                value={rateForm.notes}
                onChange={(event) =>
                  setRateForm((current) => ({ ...current, notes: event.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRate} disabled={isRateSaving}>
              {isRateSaving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {editingRateId ? "Save changes" : "Add rate card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AgencyModulePage>
  );
}
