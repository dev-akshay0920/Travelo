"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const START_YEAR = 1900
const END_YEAR = new Date().getFullYear()
const PAGE_SIZE = 12

function YearPicker({
  value,
  onSelect,
  fromYear = START_YEAR,
  toYear = END_YEAR,
}: {
  value?: number
  onSelect?: (year: number) => void
  fromYear?: number
  toYear?: number
}) {
  const totalYears = Math.max(0, toYear - fromYear + 1)
  const totalPages = Math.max(1, Math.ceil(totalYears / PAGE_SIZE))
  const [page, setPage] = React.useState(() => Math.max(0, Math.floor((totalYears - 1) / PAGE_SIZE)))

  const clampedPage = Math.min(page, totalPages - 1)
  const startYear = Math.min(fromYear + clampedPage * PAGE_SIZE, toYear)
  const years = Array.from({ length: Math.min(PAGE_SIZE, toYear - startYear + 1) }, (_, index) => startYear + index)

  return (
    <div className="w-64 select-none p-3">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setPage((prev) => Math.max(0, prev - 1))}
          disabled={clampedPage === 0}
          className={cn(buttonVariants({ variant: "outline" }), "size-8 p-0", clampedPage === 0 && "opacity-50")}
        >
          <span className="sr-only">Previous years</span>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">
          {startYear} - {Math.min(startYear + PAGE_SIZE - 1, toYear)}
        </span>
        <button
          type="button"
          onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
          disabled={clampedPage >= totalPages - 1}
          className={cn(buttonVariants({ variant: "outline" }), "size-8 p-0", clampedPage >= totalPages - 1 && "opacity-50")}
        >
          <span className="sr-only">Next years</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {years.map((year) => (
          <button
            key={year}
            type="button"
            onClick={() => onSelect?.(year)}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "rounded-[5px] text-sm",
              value === year && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
            )}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  )
}

function YearPickerField({
  value,
  onSelect,
  label,
}: {
  value?: number
  onSelect?: (value: number | undefined) => void
  label?: string
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium leading-none">{label}</p>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between rounded-[5px] font-normal"
          >
            <span className={value ? "text-foreground" : "text-muted-foreground"}>
              {value ? `${value}` : "Select year"}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <YearPicker
            value={value}
            onSelect={(year) => {
              onSelect?.(year)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { YearPicker, YearPickerField }
