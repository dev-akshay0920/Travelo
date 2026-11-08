"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

function Slider({
  className,
  value,
  onValueChange,
  orientation = "horizontal",
  ...props
}: React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
  value: number[];
  onValueChange: (value: number[]) => void;
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <SliderPrimitive.Root
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        orientation === "vertical" && "h-[200px] w-[20px]",
        orientation === "horizontal" && "h-[24px] w-full",
        className
      )}
      value={value}
      onValueChange={onValueChange}
      orientation={orientation}
      {...props}
    >
      <SliderPrimitive.Track className={cn(
        "relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200",
        orientation === "vertical" && "h-full w-2.5",
      )}>
        <SliderPrimitive.Range className={cn(
          "absolute h-full bg-gradient-to-r from-blue-500 to-blue-600",
          orientation === "vertical" && "w-full",
        )} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className={cn(
        "block h-5 w-5 rounded-full bg-white border-2 border-blue-600 shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110",
        orientation === "vertical" && "bottom-0 left-1/2 -translate-x-1/2",
        orientation === "horizontal" && "top-1/2 -translate-y-1/2",
      )} />
    </SliderPrimitive.Root>
  );
}

export { Slider };