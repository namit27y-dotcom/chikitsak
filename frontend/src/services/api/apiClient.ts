/**
 * Centralized API client for CHIKITSAK FastAPI backend.
 * JWT bearer tokens are kept strictly in JavaScript memory (never localStorage/sessionStorage).
 */

let inMemoryAccessToken: string | null = null;

export class ApiError extends Error {
  status: number;
  code: string;
  isNetworkError: boolean;

  constructor(
    message: string,
    status = 0,
    code = 'api_error',
    isNetworkError = false
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.isNetworkError = isNetworkError;
  }
}

export function getApiBaseUrl(): string {
  const configured = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (configured) {
    return configured.replace(/\/$/, '');
  }
  return '/api/v1';
}

export function getAuthToken(): string | null {
  return inMemoryAccessToken;
}

export function setAuthToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${normalizedPath}`;

  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (inMemoryAccessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${inMemoryAccessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      'Unable to reach the CHIKITSAK FastAPI backend server.',
      0,
      'network_error',
      true
    );
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const detail =
      (payload && typeof payload.detail === 'string' && payload.detail) ||
      `Request failed with status ${response.status}.`;
    const code =
      (payload && typeof payload.code === 'string' && payload.code) ||
      'http_error';
    throw new ApiError(detail, response.status, code, false);
  }

  return payload as T;
}

export async function checkBackendHealth(): Promise<{
  reachable: boolean;
  status: string;
  database: string;
}> {
  const baseUrl = getApiBaseUrl();
  const healthUrl = baseUrl.endsWith('/api/v1')
    ? `${baseUrl.slice(0, -7)}/health`
    : '/health';

  try {
    const resp = await fetch(healthUrl);
    const data = (await resp.json().catch(() => null)) as {
      status?: string;
      database?: string;
    } | null;
    return {
      reachable: true,
      status: data?.status ?? (resp.ok ? 'ok' : 'degraded'),
      database: data?.database ?? 'unknown',
    };
  } catch {
    return {
      reachable: false,
      status: 'offline',
      database: 'unavailable',
    };
  }
}
