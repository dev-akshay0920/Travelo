"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Building2, Loader2, Plus, Search, Star } from "lucide-react";
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
  createSupplierApi,
  getSupplierCategoryCountsApi,
  listSuppliersApi,
} from "@/features/agency/api/crm.api";
import {
  SUPPLIER_CATEGORIES,
  titleCase,
  type Supplier,
  type SupplierCategory,
} from "@/features/agency/types/crm.types";

const EMPTY_FORM = {
  name: "",
  category: "hotel" as SupplierCategory,
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  gstin: "",
  rating: "",
  notes: "",
};

export default function AgencySuppliersPage() {
  const [items, setItems] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<SupplierCategory | "all">("all");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listSuppliersApi({
        page,
        limit: 20,
        search: search || undefined,
        category: category === "all" ? undefined : category,
      });
      setItems(response.items);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load suppliers.");
    } finally {
      setIsLoading(false);
    }
  }, [category, page, search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    getSupplierCategoryCountsApi()
      .then((value) => {
        if (!cancelled) setCounts(value);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const updateForm = (key: keyof typeof EMPTY_FORM, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error("Supplier name is required.");
      return;
    }
    setIsSaving(true);
    try {
      await createSupplierApi({
        name: form.name.trim(),
        category: form.category,
        contactPerson: form.contactPerson.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        gstin: form.gstin.trim() || undefined,
        rating: form.rating ? Number(form.rating) : undefined,
        notes: form.notes.trim() || undefined,
      });
      toast.success("Supplier created.");
      setIsDialogOpen(false);
      setForm({ ...EMPTY_FORM });
      setPage(1);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create supplier.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AgencyModulePage
      tab="suppliers"
      title="Suppliers"
      description="Your hotels, transporters, airlines and local partners."
      actions={
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          New supplier
        </Button>
      }
    >
      <PageStack>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Suppliers" value={total} icon={Building2} />
          <StatCard label="Hotels" value={counts.hotel ?? 0} />
          <StatCard label="Transport" value={counts.transport ?? 0} />
          <StatCard label="Activities" value={counts.activity ?? 0} />
        </div>

        <Card>
          <CardHeader className="gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>All suppliers</CardTitle>
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
                    if (event.key === "Enter") {
                      setPage(1);
                      setSearch(searchInput.trim());
                    }
                  }}
                  placeholder="Search suppliers"
                  className="pl-9 sm:w-56"
                />
              </div>
              <Select
                value={category}
                onValueChange={(value) => {
                  setPage(1);
                  setCategory(value as SupplierCategory | "all");
                }}
              >
                <SelectTrigger className="sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {SUPPLIER_CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {titleCase(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingState variant="inline" />
            ) : error ? (
              <ErrorState
                title="Could not load suppliers"
                description={error}
                action={
                  <Button variant="outline" onClick={load}>
                    Retry
                  </Button>
                }
              />
            ) : items.length === 0 ? (
              <EmptyState
                icon={<Building2 />}
                title="No suppliers yet"
                description="Add the partners you book with to speed up quotes and bookings."
                action={
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="size-4" aria-hidden="true" />
                    New supplier
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Open</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">{supplier.name}</TableCell>
                        <TableCell>{titleCase(supplier.category)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {supplier.contactPerson ?? supplier.phone ?? supplier.email ?? "-"}
                        </TableCell>
                        <TableCell>
                          {supplier.rating ? (
                            <span className="inline-flex items-center gap-1">
                              <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                              {supplier.rating}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusPill status={supplier.isActive ? "active" : "inactive"} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/agency/suppliers/${supplier.id}`}>
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
            )}
          </CardContent>
        </Card>
      </PageStack>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>New supplier</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="supplier-name">Name</Label>
              <Input
                id="supplier-name"
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) => updateForm("category", value)}
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
              <Label htmlFor="supplier-contact">Contact person</Label>
              <Input
                id="supplier-contact"
                value={form.contactPerson}
                onChange={(event) => updateForm("contactPerson", event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="supplier-phone">Phone</Label>
              <Input
                id="supplier-phone"
                value={form.phone}
                onChange={(event) => updateForm("phone", event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="supplier-email">Email</Label>
              <Input
                id="supplier-email"
                type="email"
                value={form.email}
                onChange={(event) => updateForm("email", event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="supplier-gstin">GSTIN</Label>
              <Input
                id="supplier-gstin"
                value={form.gstin}
                onChange={(event) => updateForm("gstin", event.target.value)}
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
                onChange={(event) => updateForm("rating", event.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="supplier-address">Address</Label>
              <Input
                id="supplier-address"
                value={form.address}
                onChange={(event) => updateForm("address", event.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="supplier-notes">Notes</Label>
              <textarea
                id="supplier-notes"
                rows={3}
                value={form.notes}
                onChange={(event) => updateForm("notes", event.target.value)}
                className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isSaving}>
              {isSaving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Create supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AgencyModulePage>
  );
}
