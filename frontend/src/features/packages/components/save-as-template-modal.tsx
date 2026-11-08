import { useState } from "react";
import { toast } from "sonner";

import { createPolicyTemplateApi } from "@/features/packages/api/policy-templates.api";

export interface SaveAsTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  type: "terms" | "cancellation";
  content: string;
}

export function SaveAsTemplateModal({ isOpen, onClose, onSaved, type, content }: SaveAsTemplateModalProps) {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Template name is required.");
      return;
    }

    setIsSaving(true);
    try {
      await createPolicyTemplateApi({
        name: name.trim(),
        type,
        content: content.trim(),
      });
      toast.success("Template saved successfully.");
      setName("");
      onSaved();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save template.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg">
        <h2 className="text-lg font-semibold">Save as Template</h2>
        <p className="mt-1 text-sm text-muted-foreground">Save this policy as a reusable template.</p>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="template-name" className="text-sm font-medium">
              Template Name <span className="text-destructive">*</span>
            </label>
            <input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Standard T&C"
              maxLength={100}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <input
              value={type === "terms" ? "Terms & Conditions" : "Cancellation Policy"}
              disabled
              className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="inline-flex h-10 items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="inline-flex h-10 items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </div>
    </div>
  );
}
