import { useState } from "react";
import { toast } from "sonner";

import type { PolicyTemplate } from "@/features/packages/api/policy-templates.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface TemplateCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (input: { name: string; type: "terms" | "cancellation"; content: string }) => Promise<void>;
  onUpdate?: (id: string, input: { name: string; type: "terms" | "cancellation"; content: string }) => Promise<void>;
  initialTemplate?: PolicyTemplate | null;
}

export function TemplateCreateEditModal({ isOpen, onClose, onCreate, onUpdate, initialTemplate }: TemplateCreateEditModalProps) {
  const [name, setName] = useState(initialTemplate?.name ?? "");
  const [type, setType] = useState<"terms" | "cancellation">(initialTemplate?.type ?? "terms");
  const [content, setContent] = useState(initialTemplate?.content ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const isEdit = !!initialTemplate;

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim() || !content.trim()) {
      toast.error("Name and content are required.");
      return;
    }

    setIsSaving(true);
    try {
      if (isEdit && onUpdate && initialTemplate) {
        await onUpdate(initialTemplate.id, { name: name.trim(), type, content: content.trim() });
      } else if (!isEdit && onCreate) {
        await onCreate({ name: name.trim(), type, content: content.trim() });
      }
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
        <div className="mb-4">
          <h2 className="text-lg font-semibold">{isEdit ? "Edit Template" : "New Template"}</h2>
          <p className="text-sm text-muted-foreground">
            {isEdit ? "Update template details." : "Create a reusable policy template."}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">
              Template Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Standard T&C"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as "terms" | "cancellation")}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="terms" value="terms">Terms & Conditions</SelectItem>
                <SelectItem key="cancellation" value="cancellation">Cancellation Policy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-content">
              Content <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="template-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter template content..."
              rows={8}
              maxLength={5000}
            />
            <p className="text-xs text-muted-foreground">{content.length}/5000 characters</p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !name.trim() || !content.trim()}
            >
              {isSaving ? "Saving..." : isEdit ? "Update Template" : "Create Template"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
