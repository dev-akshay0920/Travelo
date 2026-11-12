import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function PageContainer({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-7",
        className,
      )}
      {...props}
    />
  );
}

export function PageStack({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-5", className)} {...props} />;
}
