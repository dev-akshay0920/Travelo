import { ApiError } from "./errors";
import { API_BASE_URL, API_TIMEOUT_MS, isApiConfigured, getApiPath } from "./config";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type QueryValue = string | number | boolean;

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, QueryValue | undefined>;
  signal?: AbortSignal;
  /** Indicates the endpoint returns no body (e.g. HTTP 204). */
  emptyResponse?: boolean;
}

export interface HttpClient {
  request<TResponse = unknown>(
    path: string,
    options?: RequestOptions,
  ): Promise<TResponse>;
  get<TResponse = unknown>(
    path: string,
    options?: Omit<RequestOptions, "method" | "body">,
  ): Promise<TResponse>;
  post<TResponse = unknown>(
    path: string,
    options?: Omit<RequestOptions, "method">,
  ): Promise<TResponse>;
  put<TResponse = unknown>(
    path: string,
    options?: Omit<RequestOptions, "method">,
  ): Promise<TResponse>;
  patch<TResponse = unknown>(
    path: string,
    options?: Omit<RequestOptions, "method">,
  ): Promise<TResponse>;
  delete<TResponse = unknown>(
    path: string,
    options?: Omit<RequestOptions, "method">,
  ): Promise<TResponse>;
}

export interface HttpClientOptions {
  baseURL: string;
  defaultHeaders?: Record<string, string>;
  timeoutMs?: number;
}

function buildQueryString(query: RequestOptions["query"] | undefined): string {
  if (!query) {
    return "";
  }
  const params = new URLSearchParams();
  const entries = Object.entries(query) as Array<[string, QueryValue | undefined]>;
  for (const [key, value] of entries) {
    if (value === undefined) {
      continue;
    }
    params.append(key, String(value));
  }
  const string = params.toString();
  return string ? `?${string}` : "";
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("travora_access_token");
}

function isJsonResponse(response: Response): boolean {
  return response.headers.get("content-type")?.includes("application/json") ?? false;
}

function mergeSignals(...signals: Array<AbortSignal | undefined>): AbortSignal | undefined {
  const active = signals.filter(
    (signal): signal is AbortSignal => signal !== undefined,
  );
  if (active.length === 0) {
    return undefined;
  }
  return AbortSignal.any(active);
}

function resolveTimeout(timeoutMs: number | undefined): number | undefined {
  return timeoutMs === 0 ? undefined : timeoutMs;
}

export function createApiClient(options: HttpClientOptions): HttpClient {
  const { baseURL, defaultHeaders = {}, timeoutMs = API_TIMEOUT_MS } = options;

  async function request<TResponse = unknown>(
    path: string,
    requestOptions: RequestOptions = {},
  ): Promise<TResponse> {
    if (!baseURL && !isApiConfigured()) {
      throw new ApiError(
        0,
        "Misconfigured",
        "The API base URL is not configured. Set NEXT_PUBLIC_API_URL in your environment.",
        null,
      );
    }

    const {
      method = "GET",
      body,
      headers,
      query,
      signal,
      emptyResponse = false,
    } = requestOptions;

    const normalizedBase = API_BASE_URL.replace(/\/+$/, "");
    const apiUrl = getApiPath(path.startsWith("/") ? path.slice(1) : path);
    const fullUrl = `${normalizedBase}${apiUrl}${buildQueryString(query)}`;

    const timeoutMsResolved = resolveTimeout(timeoutMs);
    const timeoutSignal =
      timeoutMsResolved !== undefined
        ? AbortSignal.timeout(timeoutMsResolved)
        : undefined;

    const formDataBody =
      typeof FormData !== "undefined" && body instanceof FormData ? body : undefined;
    const isFormDataBody = formDataBody !== undefined;
    const accessToken = getAccessToken();
    const requestHeaders: Record<string, string> = {
      ...defaultHeaders,
      ...(!isFormDataBody ? { "Content-Type": "application/json" } : {}),
      ...headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };

    if (isFormDataBody) {
      for (const headerName of Object.keys(requestHeaders)) {
        if (headerName.toLowerCase() === "content-type") {
          delete requestHeaders[headerName];
        }
      }
    }

    const response = await fetch(fullUrl, {
      method,
      headers: requestHeaders,
      body:
        body !== undefined
          ? isFormDataBody
            ? formDataBody
            : JSON.stringify(body)
          : undefined,
      signal: mergeSignals(signal, timeoutSignal),
      credentials: "include",
    }).catch((error: unknown) => {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        0,
        "Network Error",
        "Unable to reach the API. Please check your connection.",
        null,
      );
    });

    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }

    if (emptyResponse || response.status === 204 || !isJsonResponse(response)) {
      return null as TResponse;
    }

    const data: unknown = await response.json();
    return data as TResponse;
  }

  const get = <TResponse = unknown>(
    path: string,
    options?: Omit<RequestOptions, "method" | "body">,
  ): Promise<TResponse> => request<TResponse>(path, { ...options, method: "GET" });

  const post = <TResponse = unknown>(
    path: string,
    options?: Omit<RequestOptions, "method">,
  ): Promise<TResponse> =>
    request<TResponse>(path, options ? { ...options, method: "POST" } : { method: "POST" });

  const put = <TResponse = unknown>(
    path: string,
    options?: Omit<RequestOptions, "method">,
  ): Promise<TResponse> =>
    request<TResponse>(path, options ? { ...options, method: "PUT" } : { method: "PUT" });

  const patch = <TResponse = unknown>(
    path: string,
    options?: Omit<RequestOptions, "method">,
  ): Promise<TResponse> =>
    request<TResponse>(
      path,
      options ? { ...options, method: "PATCH" } : { method: "PATCH" },
    );

  const del = <TResponse = unknown>(
    path: string,
    options?: Omit<RequestOptions, "method">,
  ): Promise<TResponse> =>
    request<TResponse>(
      path,
      options ? { ...options, method: "DELETE" } : { method: "DELETE" },
    );

  return {
    request,
    get,
    post,
    put,
    patch,
    delete: del,
  };
}

export const apiClient = createApiClient({ baseURL: API_BASE_URL });
