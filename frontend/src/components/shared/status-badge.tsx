import type { ComponentProps } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusValue =
  | "default"
  | "published"
  | "draft"
  | "inactive"
  | "archived"
  | "error";

type BadgeVariant = NonNullable<ComponentProps<typeof Badge>["variant"]>;

const STATUS_VARIANT: Record<StatusValue, BadgeVariant> = {
  default: "default",
  published: "default",
  draft: "outline",
  inactive: "secondary",
  archived: "secondary",
  error: "destructive",
};

export interface StatusBadgeProps extends ComponentProps<typeof Badge> {
  status?: StatusValue;
}

export function StatusBadge({
  status = "default",
  className,
  variant,
  ...props
}: StatusBadgeProps) {
  return (
    <Badge
      data-slot="status-badge"
      variant={variant ?? STATUS_VARIANT[status]}
      className={cn("text-xs font-medium", className)}
      {...props}
    />
  );
}
