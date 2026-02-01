const DEFAULT_API_BASE_URL = "http://localhost:4000";

export const API_VERSION = "v1";
export const API_PREFIX = `/api/${API_VERSION}`;

export function getApiBaseUrl() {
  return (
    process.env.AQUORA_API_BASE_URL ||
    process.env.NEXT_PUBLIC_AQUORA_API_BASE_URL ||
    DEFAULT_API_BASE_URL
  );
}

export function getApiUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(`${API_PREFIX}${normalized}`, getApiBaseUrl()).toString();
}

export async function apiRequest<T>(path: string, init: RequestInit) {
  const response = await fetch(getApiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers
    }
  });

  return { response, json: (await response.json()) as T };
}
