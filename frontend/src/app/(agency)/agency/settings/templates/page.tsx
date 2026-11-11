"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Edit, Copy, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead scope="col">Name</TableHead>
                <TableHead scope="col">Type</TableHead>
                <TableHead scope="col" className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                    No templates yet. Create your first template to reuse policies across packages.
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{template.name}</span>
                        {template.isDefault && (
                          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-caption text-primary">System</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">{template.type}</TableCell>
                    <TableCell className="text-right">
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
