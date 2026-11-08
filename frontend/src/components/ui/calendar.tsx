"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-2",
        month_caption: "flex justify-between items-center px-1",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        button_previous: cn(buttonVariants({ variant: "outline" }), "size-7 p-0 opacity-50 hover:opacity-100"),
        button_next: cn(buttonVariants({ variant: "outline" }), "size-7 p-0 opacity-50 hover:opacity-100"),
        weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        day_button: cn(buttonVariants({ variant: "ghost" }), "size-9 p-0 font-normal aria-selected:opacity-100"),
        day: cn("size-9 text-sm p-0 relative [&>button]:size-9 [&>button]:rounded-[5px]"),
        selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent/50 text-accent-foreground",
        outside: "day-outside text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}

export { Calendar }
