"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { PackageList } from "@/features/packages/components/package-list";
import { PackageDetailModal } from "@/features/packages/components/package-detail-modal";
import { PackageForm } from "@/features/packages/components/package-form";

import {
  getPackagesApi,
  getUpcomingPackagesApi,
  getCurrentPackagesApi,
  getHistoryPackagesApi,
  deletePackageApi,
  updatePackageStatusApi,
} from "@/features/packages/api/package.api";
import type { TravelPackage, PackageStatus } from "@/features/packages/types/package.types";
import { Button, IconButton } from "@/components/ui/button";

type TabValue = "all" | "upcoming" | "current" | "history";
type PackageFormMode = "create" | "edit";

const tabs: { value: TabValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "current", label: "Current" },
  { value: "history", label: "History" },
];

export function PackagesTab({ agencyId }: { agencyId?: string }) {
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<TravelPackage | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<PackageStatus | null>(null);
  const [detailPackage, setDetailPackage] = useState<TravelPackage | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [formMode, setFormMode] = useState<PackageFormMode>("create");
  const [selectedPackageForForm, setSelectedPackageForForm] = useState<TravelPackage | null>(null);
  const requestKey = `${agencyId ?? ""}:${activeTab}`;
  const [loadedRequestKey, setLoadedRequestKey] = useState("");
  const isLoading = Boolean(agencyId) && loadedRequestKey !== requestKey;

  useEffect(() => {
    let cancelled = false;
    if (!agencyId) return () => { cancelled = true; };

    const loadPackages = async () => {
      try {
        let data: TravelPackage[];
        if (activeTab === "all") {
          const response = await getPackagesApi({ limit: 100, agencyId });
          data = response.items;
        } else if (activeTab === "upcoming") {
          const response = await getUpcomingPackagesApi(agencyId);
          data = response.items;
        } else if (activeTab === "current") {
          const response = await getCurrentPackagesApi(agencyId);
          data = response.items;
        } else {
          const response = await getHistoryPackagesApi(agencyId);
          data = response.items;
        }

        if (!cancelled) setPackages(data);
      } catch (err) {
        if (!cancelled) {
          setPackages([]);
          const message = err instanceof Error ? err.message : "Failed to load packages.";
          toast.error(message);
        }
      } finally {
        if (!cancelled) setLoadedRequestKey(requestKey);
      }
    };

    void loadPackages();

    return () => {
      cancelled = true;
    };
  }, [activeTab, agencyId, requestKey]);

  const handleCreateNew = () => {
    setFormMode("create");
    setSelectedPackageForForm(null);
    setViewMode("form");
  };

  const handleEdit = (pkg: TravelPackage) => {
    setFormMode("edit");
    setSelectedPackageForForm(pkg);
    setViewMode("form");
  };

  const handleFormSuccess = (pkg: TravelPackage) => {
    setPackages((prev) => {
      const index = prev.findIndex((p) => p.id === pkg.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = pkg;
        return updated;
      }
      return [pkg, ...prev];
    });
    setViewMode("list");
    setSelectedPackageForForm(null);
  };

  const handleFormCancel = () => {
    setViewMode("list");
    setSelectedPackageForForm(null);
  };

  const handleDeleteClick = (pkg: TravelPackage) => {
    setSelectedPackage(pkg);
    setDeleteConfirmOpen(true);
  };

  const handleStatusChangeClick = (pkg: TravelPackage, status: PackageStatus) => {
    setSelectedPackage(pkg);
    setPendingStatus(status);
    setStatusConfirmOpen(true);
  };

  const handleViewDetail = (pkg: TravelPackage) => {
    setDetailPackage(pkg);
    setDetailOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPackage) return;
    setIsDeleting(true);
    try {
      await deletePackageApi(selectedPackage.id);
      toast.success("Package deleted successfully.");
      setPackages((prev) => prev.filter((p) => p.id !== selectedPackage.id));
      setDeleteConfirmOpen(false);
      setSelectedPackage(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete package.";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmStatusChange = async () => {
    if (!selectedPackage || !pendingStatus) return;
    setIsUpdatingStatus(true);
    try {
      const response = await updatePackageStatusApi(selectedPackage.id, { status: pendingStatus });
      toast.success(`Package status updated to ${pendingStatus.replace("_", " ")}.`);
      setPackages((prev) =>
        prev.map((p) => (p.id === selectedPackage.id ? response.package : p))
      );
      setStatusConfirmOpen(false);
      setSelectedPackage(null);
      setPendingStatus(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update package status.";
      toast.error(message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {viewMode === "list" ? (
        <PageHeader
          title="Packages"
          description="Manage your travel packages and track their lifecycle."
          actions={
            <div className="inline-flex items-center gap-1 rounded-md bg-muted p-1">
              {tabs.map((tab) => (
                <Button
                  key={tab.value}
                  type="button"
                  size="xs"
                  variant={activeTab === tab.value ? "secondary" : "ghost"}
                  onClick={() => setActiveTab(tab.value)}
                  aria-pressed={activeTab === tab.value}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          }
        />
      ) : (
        <PageHeader
          title={formMode === "create" ? "Create Package" : "Edit Package"}
          description={formMode === "create" ? "Add a new travel package to your agency." : "Update your travel package details."}
          actions={
            <IconButton
              variant="outline"
              onClick={handleFormCancel}
              label="Back to packages"
            >
              <ArrowLeft />
            </IconButton>
          }
        />
      )}

      {viewMode === "form" ? (
        <PackageForm
          key={`${formMode}:${selectedPackageForForm?.id ?? "new"}`}
          mode={formMode}
          package={selectedPackageForForm}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          agencyId={agencyId}
        />
      ) : (
        <PackageList
          packages={agencyId ? packages : []}
          isLoading={isLoading}
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onStatusChange={handleStatusChangeClick}
          onViewDetail={handleViewDetail}
        />
      )}

      <PackageDetailModal
        package={detailPackage}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={(pkg) => {
          setDetailOpen(false);
          handleEdit(pkg);
        }}
      />

      <dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} className="rounded-lg p-6 shadow-lg">
        <h2 className="text-lg font-semibold">Delete Package</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Are you sure you want to delete &ldquo;{selectedPackage?.name}&rdquo;? This action cannot be undone.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={isDeleting}
            className="inline-flex h-8 items-center rounded-[5px] border border-border px-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmDelete}
            disabled={isDeleting}
            className="inline-flex h-8 items-center rounded-[5px] bg-destructive px-3 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </dialog>

      <dialog open={statusConfirmOpen} onClose={() => setStatusConfirmOpen(false)} className="rounded-lg p-6 shadow-lg">
        <h2 className="text-lg font-semibold">Update Status</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Are you sure you want to change the status of &ldquo;{selectedPackage?.name}&rdquo; to{" "}
          <span className="font-medium">{pendingStatus?.replace("_", " ")}</span>?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setStatusConfirmOpen(false)}
            disabled={isUpdatingStatus}
            className="inline-flex h-8 items-center rounded-[5px] border border-border px-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmStatusChange}
            disabled={isUpdatingStatus}
            className="inline-flex h-8 items-center rounded-[5px] bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {isUpdatingStatus ? "Updating..." : "Update Status"}
          </button>
        </div>
      </dialog>
    </div>
  );
}
