import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface LoadingStateProps {
  className?: string;
}

export function LoadingState({ className }: LoadingStateProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}
