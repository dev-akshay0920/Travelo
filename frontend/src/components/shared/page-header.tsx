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
    <header className={cn("mb-8 flex flex-col gap-2", className)}>
      <h1 className="font-heading text-3xl font-semibold text-foreground">
        {title}
      </h1>
      {description && (
        <p className="max-w-2xl text-muted-foreground">{description}</p>
      )}
      {actions}
    </header>
  );
}
