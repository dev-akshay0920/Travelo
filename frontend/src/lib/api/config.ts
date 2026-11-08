const isDev = process.env.NODE_ENV === "development";

export const API_BASE_URL = isDev ? "" : process.env.NEXT_PUBLIC_API_URL ?? "";

export const API_PATH_PREFIX = "api/v1";

export const API_TIMEOUT_MS = 30000;

export const isApiConfigured = (): boolean => {
  if (isDev) return true;
  return Boolean(API_BASE_URL);
};

export function getApiPath(path: string): string {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const fullPath = `${API_PATH_PREFIX}/${normalizedPath}`;

  if (isDev || !API_BASE_URL) {
    return `/${fullPath}`;
  }

  const base = API_BASE_URL.replace(/\/+$/, "");
  const alreadyPrefixed =
    base.endsWith(`/${API_PATH_PREFIX}`) || base.endsWith(API_PATH_PREFIX);

  if (alreadyPrefixed) {
    return `${base}/${normalizedPath}`;
  }

  return `${base}/${fullPath}`;
}
