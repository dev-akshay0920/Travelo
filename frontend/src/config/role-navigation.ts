import type { NavigationItem } from "@/config/navigation";
import { routeSegments } from "@/config/navigation";

export const travellerNavigation: NavigationItem[] = [
  { label: "Home", href: "/traveller", segment: routeSegments.customer },
  { label: "Explore", href: "/traveller/explore", segment: routeSegments.customer },
  { label: "My Leads", href: "/traveller/leads", segment: routeSegments.customer },
  { label: "Profile", href: "/traveller/profile", segment: routeSegments.customer },
];

export const agencyNavigation: NavigationItem[] = [
  { label: "Dashboard", href: "/agency", segment: routeSegments.agency, key: "dashboard" },
  { label: "Packages", href: "/agency", segment: routeSegments.agency, key: "packages" },
];

export const adminNavigation: NavigationItem[] = [
  { label: "Dashboard", href: "/admin", segment: routeSegments.admin },
  { label: "Users", href: "/admin/users", segment: routeSegments.admin },
  { label: "Agencies", href: "/admin/agencies", segment: routeSegments.admin },
  { label: "Leads", href: "/admin/leads", segment: routeSegments.admin },
  { label: "Settings", href: "/admin/settings", segment: routeSegments.admin },
];
