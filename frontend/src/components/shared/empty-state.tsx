import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title = "Nothing here yet",
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center",
        className,
      )}
    >
      {icon && <div className="text-muted-foreground [&_svg]:size-8">{icon}</div>}
      <h3 className="font-heading text-card-title font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="max-w-sm text-body-sm text-muted-foreground">{description}</p>
      )}
      {action}
    </div>
  );
}
