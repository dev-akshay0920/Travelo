export const routeSegments = {
  public: "(public)",
  auth: "(auth)",
  customer: "(traveller)",
  agency: "(agent)",
  admin: "(admin)",
} as const;

export type RouteSegment = (typeof routeSegments)[keyof typeof routeSegments];

export type NavigationItem = {
  label: string;
  href: string;
  segment: RouteSegment;
  external?: boolean;
  key?: string;
};

export const mainNavigation: NavigationItem[] = [
  {
    label: "Home",
    href: "/",
    segment: routeSegments.public,
  },
];

export const foundationRoutes = [
  { label: "Home", href: "/" },
] as const;
