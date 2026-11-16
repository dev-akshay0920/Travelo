"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { STATUS_TONES, titleCase } from "@/features/agency/types/crm.types";

const TONE_VARIANT = {
  default: "default",
  success: "default",
  warning: "secondary",
  danger: "destructive",
  info: "outline",
  muted: "secondary",
} as const;

const TONE_CLASS: Record<keyof typeof TONE_VARIANT, string> = {
  default: "",
  success: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  warning: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  danger: "",
  info: "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  muted: "border-transparent bg-muted text-muted-foreground",
};

export function StatusPill({ status }: { status?: string | null }) {
  if (!status) return <Badge variant="secondary">-</Badge>;
  const tone = STATUS_TONES[status] ?? "default";
  return (
    <Badge variant={TONE_VARIANT[tone]} className={cn("capitalize", TONE_CLASS[tone])}>
      {titleCase(status)}
    </Badge>
  );
}

export interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger";
}

export function StatCard({ label, value, hint, icon: Icon, tone = "default" }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0 space-y-1">
          <p className="text-caption font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="font-heading text-2xl font-semibold tabular-nums text-foreground">
            {value}
          </p>
          {hint && <p className="text-caption text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <span
            className={cn(
              "inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
              tone === "success" && "bg-emerald-500/10 text-emerald-600",
              tone === "warning" && "bg-amber-500/10 text-amber-600",
              tone === "danger" && "bg-destructive/10 text-destructive",
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
          </span>
        )}
      </CardContent>
    </Card>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          {description && (
            <p className="text-body-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function DetailRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-2 last:border-0">
      <span className="text-body-sm text-muted-foreground">{label}</span>
      <span className="text-right text-body-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export function EmptyBlock({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
      <p className="font-medium text-foreground">{title}</p>
      {description && (
        <p className="mx-auto mt-1 max-w-md text-body-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
