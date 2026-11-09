"use client";

import Link from "next/link";
import { Plane, type LucideIcon } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type SidebarItem =
  | {
      label: string;
      icon: LucideIcon;
      href: string;
      isActive?: boolean;
      onSelect?: never;
    }
  | {
      label: string;
      icon: LucideIcon;
      onSelect: () => void;
      isActive?: boolean;
      href?: never;
    };

interface IconSidebarProps {
  items: SidebarItem[];
  footerItems?: SidebarItem[];
  brandHref?: string;
  brandLabel?: string;
}

function NavigationItem({ item }: { item: SidebarItem }) {
  const Icon = item.icon;
  const content = (
    <>
      <Icon aria-hidden="true" className="size-5 shrink-0" />
      <span className="text-caption font-medium md:sr-only">{item.label}</span>
    </>
  );
  const className = cn(
    "inline-flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:size-10 md:flex-row",
    item.isActive && "bg-accent text-accent-foreground hover:bg-accent",
  );

  const trigger = typeof item.href === "string" ? (
    <Link
      href={item.href}
      aria-label={item.label}
      aria-current={item.isActive ? "page" : undefined}
      data-active={item.isActive ? "true" : undefined}
      className={className}
    >
      {content}
    </Link>
  ) : (
    <button
      type="button"
      aria-label={item.label}
      aria-pressed={item.isActive ?? false}
      onClick={item.onSelect}
      className={className}
    >
      {content}
    </button>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {item.label}
      </TooltipContent>
    </Tooltip>
  );
}

export function IconSidebar({
  items,
  footerItems = [],
  brandHref = "/",
  brandLabel = "Home",
}: IconSidebarProps) {
  return (
    <aside className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card md:inset-y-0 md:left-0 md:right-auto md:flex md:w-16 md:flex-col md:border-r md:border-t-0">
      <div className="hidden h-16 items-center justify-center border-b border-border md:flex">
        <Link
          href={brandHref}
          aria-label={brandLabel}
          className="inline-flex size-10 items-center justify-center rounded-md text-primary transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plane aria-hidden="true" className="size-5" />
        </Link>
      </div>
      <div className="flex items-center justify-around gap-1 px-2 py-2 md:flex-1 md:flex-col md:justify-between md:gap-1 md:overflow-y-auto md:px-0 md:py-4">
        <nav
          aria-label="Main navigation"
          className="flex flex-1 items-center justify-around gap-1 md:flex-col md:justify-start"
        >
          {items.map((item) => (
            <NavigationItem key={item.label} item={item} />
          ))}
        </nav>
        {footerItems.length > 0 && (
          <nav
            aria-label="Account navigation"
            className="flex items-center gap-1 border-l border-border pl-1 md:flex-col md:border-l-0 md:border-t md:pl-0 md:pt-3"
          >
            {footerItems.map((item) => (
              <NavigationItem key={item.label} item={item} />
            ))}
          </nav>
        )}
      </div>
    </aside>
  );
}
