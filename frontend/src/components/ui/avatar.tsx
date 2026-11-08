import * as React from "react"

import { cn } from "@/lib/utils"

interface AvatarProps extends React.ComponentProps<"div"> {
  src?: string | null
  alt?: string
  fallback?: string
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, ...props }, ref) => {
    const [failedSrc, setFailedSrc] = React.useState<string | null>(null)

    const showFallback = !src || failedSrc === src

    return (
      <div
        ref={ref}
        data-slot="avatar"
        className={cn(
          "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
          className
        )}
        {...props}
      >
        {showFallback ? (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
            {fallback ?? alt?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt ?? "Avatar"}
            className="aspect-square h-full w-full object-cover"
            onError={() => {
              if (src) {
                setFailedSrc(src)
              }
            }}
          />
        )}
      </div>
    )
  }
)

Avatar.displayName = "Avatar"

export { Avatar }
