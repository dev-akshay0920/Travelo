import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type SpinnerProps = {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "size-4",
  md: "size-5",
  lg: "size-8",
} as const;

export function Spinner({
  label = "Loading",
  size = "md",
  className,
}: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className="inline-flex shrink-0">
      <Loader2
        aria-hidden="true"
        className={cn("animate-spin motion-reduce:animate-none", sizeClasses[size], className)}
      />
    </span>
  );
}
