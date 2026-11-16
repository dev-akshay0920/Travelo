import {
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";
import type { NavigationItem } from "@/config/navigation";
import { routeSegments } from "@/config/navigation";

export const travellerNavigation: NavigationItem[] = [
  { label: "Explore", href: "/traveller/explore", segment: routeSegments.customer },
  { label: "Watchlist", href: "/traveller/watchlist", segment: routeSegments.customer },
  { label: "Profile", href: "/traveller/profile", segment: routeSegments.customer },
];

export const agencyNavigation: NavigationItem[] = [
  { label: "Dashboard", href: "/agency", segment: routeSegments.agency, key: "dashboard" },
  { label: "Packages", href: "/agency", segment: routeSegments.agency, key: "packages" },
];

type AdminNavigationItem = NavigationItem & { icon: LucideIcon };

export const adminNavigation: AdminNavigationItem[] = [
  { label: "Dashboard", href: "/admin", segment: routeSegments.admin, icon: LayoutDashboard },
];
