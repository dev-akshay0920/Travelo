"use client";

import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as React from "react";

import { cn } from "@/lib/utils";

const ScrollAreaProvider = React.forwardRef<
  React.ElementRef<typeof ScrollArea.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollArea.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollArea.Root
    ref={ref}
    className={cn("rounded-md border border-border", className)}
    {...props}
  />
));
ScrollAreaProvider.displayName = ScrollArea.Root.displayName;

const ScrollAreaScrollbar = React.forwardRef<
  React.ElementRef<typeof ScrollArea.Scrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollArea.Scrollbar>
>(({ className, children, ...props }, ref) => (
  <ScrollArea.Scrollbar
    ref={ref}
    className={cn("flex-1", className)}
    {...props}
  />
));
ScrollAreaScrollbar.displayName = ScrollArea.Scrollbar.displayName;

const ScrollAreaThumb = React.forwardRef<
  React.ElementRef<typeof ScrollArea.Thumb>,
  React.ComponentPropsWithoutRef<typeof ScrollArea.Thumb>
>(({ className, children, ...props }, ref) => (
  <ScrollArea.Thumb
    ref={ref}
    className={cn(
      "rounded-full bg-border shrink-0 w-2",
      className
    )}
    {...props}
  />
));
ScrollAreaThumb.displayName = ScrollArea.Thumb.displayName;

export { ScrollAreaProvider as ScrollArea, ScrollAreaScrollbar, ScrollAreaThumb };
