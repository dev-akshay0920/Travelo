"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
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
  createStaffApi,
  deleteStaffApi,
  listStaffApi,
  updateStaffApi,
} from "@/features/agency/api/crm.api";
import { formatDate } from "@/features/agency/lib/format";
import {
  STAFF_ROLES,
  titleCase,
  type StaffMember,
  type StaffRole,
} from "@/features/agency/types/crm.types";

const EMPTY_FORM = {
  userId: "",
  role: "agent" as StaffRole,
  permissions: "",
  isActive: true,
};

export default function AgencyStaffPage() {
  const [items, setItems] = useState<StaffMember[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<StaffRole | "all">("all");
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
      const response = await listStaffApi({
        page,
        limit: 20,
        search: search || undefined,
        role: role === "all" ? undefined : role,
      });
      setItems(response.items);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load staff.");
    } finally {
      setIsLoading(false);
    }
  }, [page, role, search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const updateForm = (key: keyof typeof EMPTY_FORM, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setIsDialogOpen(true);
  };

  const openEdit = (member: StaffMember) => {
    setEditingId(member.id);
    setForm({
      userId: member.userId,
      role: member.role,
      permissions: member.permissions.join(", "),
      isActive: member.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingId && !/^[0-9a-fA-F]{24}$/.test(form.userId.trim())) {
      toast.error("Enter a valid 24-character user ID.");
      return;
    }
    const permissions = form.permissions
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    setIsSaving(true);
    try {
      if (editingId) {
        await updateStaffApi(editingId, {
          role: form.role,
          permissions,
          isActive: form.isActive,
        });
        toast.success("Staff member updated.");
      } else {
        await createStaffApi({
          userId: form.userId.trim(),
          role: form.role,
          permissions,
          isActive: form.isActive,
        });
        toast.success("Staff member added.");
      }
      setIsDialogOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save staff member.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this staff member from the agency?")) return;
    try {
      await deleteStaffApi(id);
      toast.success("Staff member removed.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove staff member.");
    }
  };

  return (
    <AgencyModulePage
      tab="staff"
      title="Staff"
      description="Manage your team and their roles."
      actions={
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          Add staff
        </Button>
      }
    >
      <PageStack>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Team members" value={total} icon={Users} />
          <StatCard label="Agents" value={items.filter((m) => m.role === "agent").length} />
          <StatCard label="Managers" value={items.filter((m) => m.role === "manager").length} />
          <StatCard label="Active" value={items.filter((m) => m.isActive).length} />
        </div>

        <Card>
          <CardHeader className="gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>Team members</CardTitle>
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
                  placeholder="Search staff"
                  className="pl-9 sm:w-52"
                />
              </div>
              <Select
                value={role}
                onValueChange={(value) => {
                  setPage(1);
                  setRole(value as StaffRole | "all");
                }}
              >
                <SelectTrigger className="sm:w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {STAFF_ROLES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {titleCase(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 rounded-lg border border-dashed border-border bg-muted/30 p-3 text-body-sm text-muted-foreground">
              Users must already have a Travora account. Add them with their user ID.
            </p>
            {isLoading ? (
              <LoadingState variant="inline" />
            ) : error ? (
              <ErrorState
                title="Could not load staff"
                description={error}
                action={
                  <Button variant="outline" onClick={load}>
                    Retry
                  </Button>
                }
              />
            ) : items.length === 0 ? (
              <EmptyState
                icon={<Users />}
                title="No staff added yet"
                description="Invite teammates by adding their user ID."
                action={
                  <Button onClick={openCreate}>
                    <Plus className="size-4" aria-hidden="true" />
                    Add staff
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <p className="font-medium">
                            {member.userName ?? member.userEmail ?? "Unnamed member"}
                          </p>
                          <p className="text-caption text-muted-foreground">{member.userId}</p>
                        </TableCell>
                        <TableCell>
                          <StatusPill status={member.role} />
                        </TableCell>
                        <TableCell className="max-w-xs text-muted-foreground">
                          {member.permissions.length > 0 ? member.permissions.join(", ") : "-"}
                        </TableCell>
                        <TableCell>
                          <StatusPill status={member.isActive ? "active" : "inactive"} />
                        </TableCell>
                        <TableCell>{formatDate(member.joinedAt ?? member.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(member)}
                              aria-label="Edit staff member"
                            >
                              <Pencil className="size-4" aria-hidden="true" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(member.id)}
                              aria-label="Remove staff member"
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit staff member" : "Add staff member"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="staff-user">User ID</Label>
              <Input
                id="staff-user"
                value={form.userId}
                disabled={Boolean(editingId)}
                onChange={(event) => updateForm("userId", event.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(value) => updateForm("role", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAFF_ROLES.map((item) => (
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
                  onValueChange={(value) => updateForm("isActive", value === "active")}
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
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staff-permissions">Permissions</Label>
              <Input
                id="staff-permissions"
                value={form.permissions}
                onChange={(event) => updateForm("permissions", event.target.value)}
                placeholder="leads.read, bookings.write"
              />
              <p className="text-caption text-muted-foreground">
                Comma separated keys. Leave blank for role defaults.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {editingId ? "Save changes" : "Add staff"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AgencyModulePage>
  );
}
