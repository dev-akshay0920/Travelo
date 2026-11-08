import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { getPolicyTemplatesApi } from "@/features/packages/api/policy-templates.api";
import type { PolicyTemplate } from "@/features/packages/api/policy-templates.api";

export interface TemplateSelectorProps {
  type: "terms" | "cancellation";
  value: string;
  onChange: (value: string) => void;
}

export function TemplateSelector({ type, value, onChange }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<PolicyTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(() => templates.filter((template) => template.type === type), [templates, type]);

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

  const handleSelect = (template: PolicyTemplate) => {
    if (value && !confirm("This will replace the current content. Are you sure?")) {
      return;
    }
    onChange(template.content);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-8 items-center rounded-[5px] border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
      >
        {isLoading ? "Loading..." : `Template: ${isOpen ? "Close" : "Select template..."}`}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-72 rounded-md border border-border bg-background shadow-lg">
          <div className="max-h-64 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="p-2 text-xs text-muted-foreground">No templates available.</p>
            ) : (
              filtered.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleSelect(template)}
                  className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{template.name}</span>
                    {template.isDefault && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">System</span>
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{template.content}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
