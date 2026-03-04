import { ApiError } from './ApiError';
import { getCookie } from './cookies';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

interface ErrorEnvelope {
  ok?: boolean;
  code?: string;
  message?: string;
  details?: any;
  request_id?: string;
}

export interface ApiFetchOptions extends RequestInit {
  skipCsrf?: boolean;
  skipCsrfBootstrap?: boolean;
}

const MUTATION_METHODS = new Set<Method | string>(['POST', 'PUT', 'PATCH', 'DELETE']);
let csrfBootstrapPromise: Promise<void> | null = null;

function createRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function parsePayload(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const text = await response.text();
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractError(payload: unknown, response: Response): ErrorEnvelope {
  if (payload && typeof payload === 'object') {
    return payload as ErrorEnvelope;
  }

  if (typeof payload === 'string') {
    return { message: payload };
  }

  return {};
}

export async function ensureCsrf(): Promise<void> {
  if (getCookie('csrftoken')) {
    return;
  }

  if (!csrfBootstrapPromise) {
    csrfBootstrapPromise = apiFetch('/api/auth/csrf', {
      method: 'GET',
      skipCsrf: true,
      skipCsrfBootstrap: true,
    })
      .then(() => undefined)
      .finally(() => {
        csrfBootstrapPromise = null;
      });
  }

  await csrfBootstrapPromise;
}

export async function apiFetch<T = unknown>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase() as Method;
  const headers = new Headers(options.headers ?? {});
  const requestId = headers.get('X-Request-ID') ?? createRequestId();
  headers.set('X-Request-ID', requestId);

  if (MUTATION_METHODS.has(method) && !options.skipCsrf && !options.skipCsrfBootstrap) {
    await ensureCsrf();
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      headers.set('X-CSRFToken', csrfToken);
    }
  }

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(path, {
    ...options,
    method,
    headers,
    credentials: 'include',
  });

  const payload = await parsePayload(response);
  if (!response.ok) {
    const envelope = extractError(payload, response);
    throw new ApiError({
      status: response.status,
      code: envelope.code,
      message: envelope.message || response.statusText || `Request failed: ${response.status}`,
      details: envelope.details ?? payload,
      requestId: envelope.request_id || response.headers.get('X-Request-ID') || requestId,
      url: path,
      method,
    });
  }

  return payload as T;
}
