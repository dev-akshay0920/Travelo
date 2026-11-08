"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

import { ArrowLeft } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(false);
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

  const loadPackages = useCallback(async (tab: TabValue) => {
    if (!agencyId) {
      console.log("[loadPackages] No agencyId, skipping fetch");
      setPackages([]);
      setIsLoading(false);
      return;
    }
    console.log("[loadPackages] Starting fetch for tab:", tab, "agencyId:", agencyId);
    setIsLoading(true);
    try {
      let data: TravelPackage[] = [];
      if (tab === "all") {
        const response = await getPackagesApi({ limit: 100, agencyId });
        console.log("[loadPackages] getPackagesApi response:", response);
        data = response.items;
      } else if (tab === "upcoming") {
        const response = await getUpcomingPackagesApi(agencyId);
        console.log("[loadPackages] getUpcomingPackagesApi response:", response);
        data = response.items;
      } else if (tab === "current") {
        const response = await getCurrentPackagesApi(agencyId);
        console.log("[loadPackages] getCurrentPackagesApi response:", response);
        data = response.items;
      } else if (tab === "history") {
        const response = await getHistoryPackagesApi(agencyId);
        console.log("[loadPackages] getHistoryPackagesApi response:", response);
        data = response.items;
      }
      console.log("[loadPackages] Setting packages:", data.length, "items");
      setPackages(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load packages.";
      console.error("[loadPackages] Error:", err);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [agencyId]);

  useEffect(() => {
    let cancelled = false;
    loadPackages(activeTab);

    return () => {
      cancelled = true;
    };
  }, [activeTab, agencyId, loadPackages]);

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
    <div className="flex flex-col gap-4">
      {viewMode === "list" ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Packages</h1>
              <p className="text-xs text-muted-foreground">Manage your travel packages and track their lifecycle.</p>
            </div>
            <div className="inline-flex items-center gap-1 rounded-md bg-muted p-1 text-muted-foreground">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  data-state={activeTab === tab.value ? "active" : "inactive"}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-[5px] px-3 py-1.5 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleFormCancel}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[5px] border border-border transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-foreground">
              {formMode === "create" ? "Create Package" : "Edit Package"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {formMode === "create" ? "Add a new travel package to your agency." : "Update your travel package details."}
            </p>
          </div>
        </div>
      )}

      {viewMode === "form" ? (
        <PackageForm
          mode={formMode}
          package={selectedPackageForForm}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          agencyId={agencyId}
        />
      ) : (
        <PackageList
          packages={packages}
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
