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
      <span className="truncate text-caption font-medium md:text-sm">{item.label}</span>
    </>
  );
  const className = cn(
    "relative inline-flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-md px-1 text-center text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none md:min-h-10 md:w-full md:flex-none md:flex-row md:justify-start md:gap-3 md:px-3 md:text-left",
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
    <aside className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card md:inset-y-0 md:left-0 md:right-auto md:flex md:w-60 md:flex-col md:border-r md:border-t-0">
      <div className="hidden h-14 shrink-0 items-center border-b border-border px-5 md:flex">
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
      <div className="flex items-center justify-around gap-1 px-2 py-2 md:flex-1 md:flex-col md:justify-between md:gap-4 md:overflow-y-auto md:px-3 md:py-4">
        <nav
          aria-label="Main navigation"
          className="flex flex-1 items-center justify-around gap-1 md:flex-col md:items-stretch md:justify-start"
        >
          <span className="hidden px-3 pb-1 text-caption font-semibold uppercase tracking-wide text-muted-foreground md:block">
            {sectionLabel}
          </span>
          {items.map((item) => (
            <NavigationItem key={item.label} item={item} />
          ))}
        </nav>
        {footerItems.length > 0 && (
          <nav
            aria-label="Account navigation"
            className="hidden items-center gap-1 border-border md:flex md:w-full md:flex-col md:items-stretch md:border-t md:pt-3"
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
