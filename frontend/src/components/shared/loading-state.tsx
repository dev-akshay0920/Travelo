import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface LoadingStateProps {
  className?: string;
  variant?: "page" | "inline";
}

export function LoadingState({
  className,
  variant = "page",
}: LoadingStateProps) {
  if (variant === "inline") {
    return (
      <div
        role="status"
        aria-label="Loading"
        className={cn("flex items-center gap-3", className)}
      >
        <Skeleton className="size-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-3 w-3/5" />
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label="Loading page"
      aria-busy="true"
      className={cn("space-y-6", className)}
    >
      <div className="space-y-2">
        <Skeleton className="h-8 w-2/5 max-w-72" />
        <Skeleton className="h-4 w-3/5 max-w-xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <Skeleton key={index} className="h-56 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
