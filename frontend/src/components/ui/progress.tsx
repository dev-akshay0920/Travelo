import * as React from "react"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentProps<"div"> {
  value?: number
  indicatorClassName?: string
}

function Progress({ value = 0, className, indicatorClassName, ...props }: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clampedValue}
      data-slot="progress"
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-secondary/20",
        className
      )}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className={cn(
          "h-full rounded-full bg-primary transition-all",
          indicatorClassName
        )}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  )
}

export { Progress }
