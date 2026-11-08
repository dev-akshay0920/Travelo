export type RoleKey = "traveller" | "agency" | "admin";

export const ROLE_HOME_ROUTES: Record<RoleKey, string> = {
  traveller: "/traveller",
  agency: "/agency",
  admin: "/admin",
};

export const PROTECTED_PREFIXES = [
  "/traveller",
  "/agency",
  "/admin",
] as const;

export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signin",
  "/signup",
] as const;

export function getHomeRouteForRole(roleKey: RoleKey | string | undefined): string {
  if (!roleKey) {
    return "/";
  }
  return ROLE_HOME_ROUTES[roleKey as RoleKey] ?? "/";
}

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => route === pathname);
}
