"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon } from "lucide-react"

import { Spinner } from "@/components/ui/spinner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      position="top-center"
      richColors
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: <Spinner label="Loading" size="sm" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "var(--success-muted)",
          "--success-text": "var(--success-foreground)",
          "--success-border": "var(--success)",
          "--info-bg": "var(--info-muted)",
          "--info-text": "var(--info-foreground)",
          "--info-border": "var(--info)",
          "--warning-bg": "var(--warning-muted)",
          "--warning-text": "var(--warning-foreground)",
          "--warning-border": "var(--warning)",
          "--error-bg": "color-mix(in srgb, var(--destructive) 10%, var(--background))",
          "--error-text": "var(--destructive)",
          "--error-border": "var(--destructive)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
