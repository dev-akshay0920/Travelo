"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";

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
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto sm:rounded-2xl">
        <PackageForm
          mode={mode}
          package={pkg}
          onSuccess={onSuccess}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
