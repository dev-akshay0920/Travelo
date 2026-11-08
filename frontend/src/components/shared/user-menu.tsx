"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getHomeRouteForRole, type RoleKey } from "@/config/routes";
import { LogOut, User } from "lucide-react";

type UserMenuProps = {
  role: RoleKey;
  userName?: string;
};

function getStoredUserName(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  try {
    const stored = window.localStorage.getItem("travora_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.name ?? parsed?.email ?? undefined;
    }
  } catch {
    // ignore localStorage read errors
  }
  return undefined;
}

function subscribe() {
  // no-op
  return () => {};
}

function getSnapshot() {
  return getStoredUserName();
}

function getServerSnapshot() {
  return undefined;
}

export function UserMenu({ role, userName }: UserMenuProps) {
  const storedUserName = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const resolvedUserName = userName ?? storedUserName;

  const homeRoute = getHomeRouteForRole(role);
  const roleLabel = role === "agency" ? "Agency" : role === "admin" ? "Admin" : "Traveller";
  const fallback = resolvedUserName ?? "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {fallback
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <span className="hidden sm:inline text-sm font-medium">{fallback}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium">{fallback}</p>
          <p className="text-xs text-muted-foreground capitalize">{roleLabel}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`${homeRoute}/profile`} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
