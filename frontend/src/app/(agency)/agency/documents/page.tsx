"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, FileText, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
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
import { StatusPill } from "@/features/agency/components/crm-ui";
import {
  createDocumentApi,
  deleteDocumentApi,
  listDocumentsApi,
  updateDocumentApi,
} from "@/features/agency/api/crm.api";
import { formatBytes, formatDate } from "@/features/agency/lib/format";
import {
  DOCUMENT_CATEGORIES,
  titleCase,
  type DocumentCategory,
  type DocumentFile,
} from "@/features/agency/types/crm.types";

const EMPTY_FORM = {
  category: "other" as DocumentCategory,
  fileName: "",
  url: "",
  key: "",
  mimeType: "",
  size: "",
  description: "",
  leadId: "",
  bookingId: "",
  invoiceId: "",
};

const keyFromUrl = (url: string): string => {
  try {
    const path = new URL(url).pathname;
    return decodeURIComponent(path.split("/").filter(Boolean).pop() ?? "");
  } catch {
    return "";
  }
};

export default function AgencyDocumentsPage() {
  const [items, setItems] = useState<DocumentFile[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<DocumentCategory | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listDocumentsApi({
        page,
        limit: 20,
        search: search || undefined,
        category: category === "all" ? undefined : category,
      });
      setItems(response.items);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load documents.");
    } finally {
      setIsLoading(false);
    }
  }, [category, page, search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const updateForm = (key: keyof typeof EMPTY_FORM, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setIsDialogOpen(true);
  };

  const openEdit = (doc: DocumentFile) => {
    setEditingId(doc.id);
    setForm({
      category: doc.category,
      fileName: doc.fileName,
      url: doc.url,
      key: doc.key,
      mimeType: doc.mimeType,
      size: String(doc.size),
      description: doc.description ?? "",
      leadId: doc.leadId ?? "",
      bookingId: doc.bookingId ?? "",
      invoiceId: doc.invoiceId ?? "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.fileName.trim() || !form.url.trim()) {
      toast.error("File name and URL are required.");
      return;
    }
    const key = form.key.trim() || keyFromUrl(form.url.trim());
    if (!key) {
      toast.error("Storage key is required.");
      return;
    }
    if (!form.mimeType.trim() || !(Number(form.size) > 0)) {
      toast.error("MIME type and file size are required.");
      return;
    }
    const payload = {
      category: form.category,
      fileName: form.fileName.trim(),
      url: form.url.trim(),
      key,
      mimeType: form.mimeType.trim(),
      size: Number(form.size),
      description: form.description.trim() || undefined,
      leadId: form.leadId.trim() || undefined,
      bookingId: form.bookingId.trim() || undefined,
      invoiceId: form.invoiceId.trim() || undefined,
    };
    setIsSaving(true);
    try {
      if (editingId) {
        await updateDocumentApi(editingId, payload);
        toast.success("Document updated.");
      } else {
        await createDocumentApi(payload);
        toast.success("Document registered.");
      }
      setIsDialogOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save document.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this document record?")) return;
    try {
      await deleteDocumentApi(id);
      toast.success("Document deleted.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete document.");
    }
  };

  return (
    <AgencyModulePage
      tab="documents"
      title="Documents"
      description="Contracts, vouchers, passports and invoices in one place."
      actions={
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          Register document
        </Button>
      }
    >
      <PageStack>
        <Card>
          <CardHeader className="gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>All documents</CardTitle>
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
                  placeholder="Search documents"
                  className="pl-9 sm:w-56"
                />
              </div>
              <Select
                value={category}
                onValueChange={(value) => {
                  setPage(1);
                  setCategory(value as DocumentCategory | "all");
                }}
              >
                <SelectTrigger className="sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {DOCUMENT_CATEGORIES.map((item) => (
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
                title="Could not load documents"
                description={error}
                action={
                  <Button variant="outline" onClick={load}>
                    Retry
                  </Button>
                }
              />
            ) : items.length === 0 ? (
              <EmptyState
                icon={<FileText />}
                title="No documents yet"
                description="Register a hosted file to keep it linked to leads, bookings or invoices."
                action={
                  <Button onClick={openCreate}>
                    <Plus className="size-4" aria-hidden="true" />
                    Register document
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Linked to</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="max-w-xs">
                          <div className="flex items-center gap-2">
                            <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                            <div className="min-w-0">
                              <p className="truncate font-medium">{doc.fileName}</p>
                              <p className="truncate text-caption text-muted-foreground">
                                {doc.mimeType}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusPill status={doc.category} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {doc.bookingId
                            ? "Booking"
                            : doc.invoiceId
                              ? "Invoice"
                              : doc.leadId
                                ? "Lead"
                                : "-"}
                        </TableCell>
                        <TableCell>{formatBytes(doc.size)}</TableCell>
                        <TableCell>{formatDate(doc.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" asChild aria-label="Open document">
                              <a href={doc.url} target="_blank" rel="noreferrer">
                                <ExternalLink className="size-4" aria-hidden="true" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(doc)}
                              aria-label="Edit document"
                            >
                              <Pencil className="size-4" aria-hidden="true" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(doc.id)}
                              aria-label="Delete document"
                            >
                              <Trash2 className="size-4 text-destructive" aria-hidden="true" />
                            </Button>
                          </div>
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
            <DialogTitle>{editingId ? "Edit document" : "Register document"}</DialogTitle>
          </DialogHeader>
          <p className="text-body-sm text-muted-foreground">
            File uploads are not enabled yet. Paste a URL to a hosted file and include its metadata.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
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
                  {DOCUMENT_CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {titleCase(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-name">File name</Label>
              <Input
                id="doc-name"
                value={form.fileName}
                onChange={(event) => updateForm("fileName", event.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="doc-url">File URL</Label>
              <Input
                id="doc-url"
                value={form.url}
                onChange={(event) => updateForm("url", event.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-key">Storage key</Label>
              <Input
                id="doc-key"
                value={form.key}
                onChange={(event) => updateForm("key", event.target.value)}
                placeholder="Auto-derived from URL"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-mime">MIME type</Label>
              <Input
                id="doc-mime"
                value={form.mimeType}
                onChange={(event) => updateForm("mimeType", event.target.value)}
                placeholder="application/pdf"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-size">Size (bytes)</Label>
              <Input
                id="doc-size"
                type="number"
                min={1}
                value={form.size}
                onChange={(event) => updateForm("size", event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-description">Description</Label>
              <Input
                id="doc-description"
                value={form.description}
                onChange={(event) => updateForm("description", event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-lead">Lead ID</Label>
              <Input
                id="doc-lead"
                value={form.leadId}
                onChange={(event) => updateForm("leadId", event.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-booking">Booking ID</Label>
              <Input
                id="doc-booking"
                value={form.bookingId}
                onChange={(event) => updateForm("bookingId", event.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-invoice">Invoice ID</Label>
              <Input
                id="doc-invoice"
                value={form.invoiceId}
                onChange={(event) => updateForm("invoiceId", event.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {editingId ? "Save changes" : "Register"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AgencyModulePage>
  );
}
