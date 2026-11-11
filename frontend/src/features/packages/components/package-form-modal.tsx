"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { TravelPackage } from "@/features/packages/types/package.types";
import { PackageForm } from "@/features/packages/components/package-form";

type PackageFormModalProps = {
  mode: "create" | "edit";
  package?: TravelPackage | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pkg: TravelPackage) => void;
};

export function PackageFormModal({ mode, package: pkg, isOpen, onClose, onSuccess }: PackageFormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex h-[90dvh] max-h-[56rem] max-w-5xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>{mode === "create" ? "Create Package" : "Edit Package"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new travel package to your agency."
              : "Update your travel package details."}
          </DialogDescription>
        </DialogHeader>
        <PackageForm
          mode={mode}
          package={pkg}
          onSuccess={onSuccess}
          onCancel={onClose}
          modalLayout
        />
      </DialogContent>
    </Dialog>
  );
}
