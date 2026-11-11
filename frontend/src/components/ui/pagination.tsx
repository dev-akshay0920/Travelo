import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-between gap-3 border-t border-border pt-4", className)}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        <ChevronLeft aria-hidden="true" />
        Previous
      </Button>
      <span className="text-body-sm tabular-nums text-muted-foreground" aria-live="polite">
        Page {page} of {totalPages}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
        <ChevronRight aria-hidden="true" />
      </Button>
    </nav>
  )
}
