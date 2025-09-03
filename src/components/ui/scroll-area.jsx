import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

function ScrollArea({
  className,
  children,
  orientation = "vertical",
  ...props
}) {
  return (
    <ScrollAreaPrimitive.Root data-slot="scroll-area" className={cn("relative", className)} {...props}>
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className={cn(
          "focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1",
          orientation === "horizontal" && "overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
        )}>
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar orientation={orientation} />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}) {
  return (
          <ScrollAreaPrimitive.ScrollAreaScrollbar
        data-slot="scroll-area-scrollbar"
        orientation={orientation}
        className={cn(
          "flex touch-none p-px transition-colors select-none",
          orientation === "vertical" &&
            "h-full w-1.5 border-l border-l-transparent",
          orientation === "horizontal" &&
            "h-1.5 flex-col border-t border-t-transparent",
          className
        )}
        {...props}>
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className={cn(
          "relative flex-1 rounded-full transition-colors",
          orientation === "vertical" && "bg-gray-500 hover:bg-gray-400",
          orientation === "horizontal" && "bg-gray-500 hover:bg-gray-400"
        )} />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar }
