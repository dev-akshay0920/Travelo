"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tabs-list"
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="tabs-trigger"
      data-state="inactive"
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tabs-content"
      className={cn("mt-2", className)}
      {...props}
    />
  )
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
}
