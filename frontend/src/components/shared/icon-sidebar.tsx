"use client";

import Link from "next/link";
import { Plane, type LucideIcon } from "lucide-react";

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
  sectionLabel?: string;
}

function NavigationItem({ item }: { item: SidebarItem }) {
  const Icon = item.icon;
  const content = (
    <>
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      <span className="truncate text-caption font-medium lg:text-sm">{item.label}</span>
    </>
  );
  const className = cn(
    "relative inline-flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-md px-1 text-center text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none lg:min-h-10 lg:w-full lg:flex-none lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:text-left",
    item.isActive &&
      "bg-accent text-accent-foreground before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-primary hover:bg-accent",
  );

  return typeof item.href === "string" ? (
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
}

export function IconSidebar({
  items,
  footerItems = [],
  brandHref = "/",
  brandLabel = "Home",
  sectionLabel = "Workspace",
}: IconSidebarProps) {
  return (
    <aside className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card lg:inset-y-0 lg:left-0 lg:right-auto lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-t-0">
      <div className="hidden h-14 shrink-0 items-center border-b border-border px-5 lg:flex">
        <Link
          href={brandHref}
          className="inline-flex min-w-0 items-center gap-2.5 rounded-md text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Plane aria-hidden="true" className="size-4" />
          </span>
          <span className="truncate text-sm font-semibold tracking-tight">{brandLabel}</span>
        </Link>
      </div>
      <div className="flex items-center justify-around gap-1 px-2 py-2 lg:flex-1 lg:flex-col lg:justify-between lg:gap-4 lg:overflow-y-auto lg:px-3 lg:py-4">
        <nav
          aria-label="Main navigation"
          className="flex flex-1 items-center justify-around gap-1 lg:flex-col lg:items-stretch lg:justify-start"
        >
          <span className="hidden px-3 pb-1 text-caption font-semibold uppercase tracking-wide text-muted-foreground lg:block">
            {sectionLabel}
          </span>
          {items.map((item) => (
            <NavigationItem key={item.label} item={item} />
          ))}
        </nav>
        {footerItems.length > 0 && (
          <nav
            aria-label="Account navigation"
            className="hidden items-center gap-1 border-border lg:flex lg:w-full lg:flex-col lg:items-stretch lg:border-t lg:pt-3"
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
