"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Edit, Copy, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getPolicyTemplatesApi,
  createPolicyTemplateApi,
  updatePolicyTemplateApi,
  deletePolicyTemplateApi,
  duplicatePolicyTemplateApi,
} from "@/features/packages/api/policy-templates.api";
import type { PolicyTemplate } from "@/features/packages/api/policy-templates.api";
import { TemplateCreateEditModal } from "@/features/packages/components/template-manager-modal";

export default function SettingsTemplatesTab() {
  const [templates, setTemplates] = useState<PolicyTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PolicyTemplate | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPolicyTemplatesApi()
      .then((templates) => {
        if (!cancelled) {
          setTemplates(templates);
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Failed to load templates.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreate = async (input: { name: string; type: "terms" | "cancellation"; content: string }) => {
    const template = await createPolicyTemplateApi(input);
    setTemplates((prev) => [...prev, template]);
    toast.success("Template created successfully.");
  };

  const handleUpdate = async (id: string, input: { name: string; type: "terms" | "cancellation"; content: string }) => {
    const template = await updatePolicyTemplateApi(id, input);
    setTemplates((prev) =>
      prev.map((item) => (item.id === id ? template : item)),
    );
    toast.success("Template updated successfully.");
  };

  const handleDuplicate = async (id: string) => {
    const template = await duplicatePolicyTemplateApi(id);
    setTemplates((prev) => [...prev, template]);
    toast.success("Template duplicated successfully.");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("This will not affect existing packages. Are you sure?")) {
      return;
    }
    await deletePolicyTemplateApi(id);
    setTemplates((prev) => prev.filter((template) => template.id !== id));
    toast.success("Template deleted successfully.");
  };

  const openCreate = () => {
    setEditingTemplate(null);
    setIsCreateModalOpen(true);
  };

  const openEdit = (template: PolicyTemplate) => {
    setEditingTemplate(template);
    setIsCreateModalOpen(true);
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingTemplate(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Policy Templates</h1>
          <p className="text-xs text-muted-foreground">Manage reusable policy templates for your packages.</p>
        </div>
        <Button onClick={openCreate} size="sm">New Template</Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-md border border-border bg-muted" />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-background shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
                <th className="px-3 py-2 font-medium" scope="col">Name</th>
                <th className="px-3 py-2 font-medium" scope="col">Type</th>
                <th className="px-3 py-2 font-medium text-right" scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-8 text-center text-xs text-muted-foreground">
                    No templates yet. Create your first template to reuse policies across packages.
                  </td>
                </tr>
              ) : (
                templates.map((template) => (
                  <tr key={template.id} className="border-b border-border/60 last:border-b-0 hover:bg-muted/50">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs">{template.name}</span>
                        {template.isDefault && (
                          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">System</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs capitalize text-muted-foreground">{template.type}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(template)}
                          title="Edit"
                        >
                          <Edit />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDuplicate(template.id)}
                          title="Duplicate"
                        >
                          <Copy />
                        </Button>
                        {!template.isDefault && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(template.id)}
                            className="text-destructive hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <TemplateCreateEditModal
        key={editingTemplate?.id ?? "new"}
        isOpen={isCreateModalOpen}
        onClose={closeModal}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        initialTemplate={editingTemplate}
      />
    </div>
  );
}
