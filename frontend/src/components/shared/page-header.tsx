import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("mb-6 flex flex-col gap-1.5", className)}>
      <h1 className="font-heading text-page-title font-semibold text-foreground">
        {title}
      </h1>
      {description && (
        <p className="max-w-2xl text-body-sm text-muted-foreground">{description}</p>
      )}
      {actions}
    </header>
  );
}
