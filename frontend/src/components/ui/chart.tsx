import * as React from "react"

import { cn } from "@/lib/utils"

interface ChartData {
  label: string
  value: number
}

interface BarChartProps extends React.ComponentProps<"div"> {
  data: ChartData[]
  maxValue?: number
}

function BarChart({ data, maxValue, className, ...props }: BarChartProps) {
  const max = maxValue ?? Math.max(...data.map((item) => item.value))

  return (
    <div
      data-slot="chart"
      className={cn("flex items-end gap-2", className)}
      {...props}
    >
      {data.map((item, index) => {
        const height = max > 0 ? (item.value / max) * 100 : 0

        return (
          <div key={index} className="flex flex-1 flex-col items-center gap-2">
            <div className="relative flex h-36 w-full items-end justify-center">
              <div
                className="w-full rounded-t-md bg-primary transition-all"
                style={{ height: `${height}%` }}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export { BarChart }
