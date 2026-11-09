import type { ReactNode } from "react";

import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/20 bg-destructive-muted px-6 py-10 text-center",
        className,
      )}
    >
      <AlertCircle aria-hidden="true" className="size-8 text-destructive" />
      <h3 className="font-heading text-card-title font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="max-w-sm text-body-sm text-muted-foreground">{description}</p>
      )}
      {action}
    </div>
  );
}
