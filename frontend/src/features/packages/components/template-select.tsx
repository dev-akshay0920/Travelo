"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getPolicyTemplatesApi } from "@/features/packages/api/policy-templates.api";
import type { PolicyTemplate } from "@/features/packages/api/policy-templates.api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface TemplateSelectProps {
  type: "terms" | "cancellation";
  value: string;
  onChange: (value: string) => void;
}

export function TemplateSelect({ type, value: _value, onChange }: TemplateSelectProps) {
  const [templates, setTemplates] = useState<PolicyTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPolicyTemplatesApi(type)
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
  }, [type]);

  return (
    <Select
      disabled={isLoading}
      onValueChange={(templateId) => {
        const template = templates.find((item) => item.id === templateId);
        if (template) {
          onChange(template.content);
        }
      }}
    >
      <SelectTrigger className="h-8 w-[220px] text-xs">
        <SelectValue placeholder={isLoading ? "Loading..." : "Select template..."} />
      </SelectTrigger>
      <SelectContent>
        {templates.map((template) => (
          <SelectItem key={template.id} value={template.id}>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{template.name}</span>
              {template.isDefault && (
                <span className="text-caption text-muted-foreground">System</span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
