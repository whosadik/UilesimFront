import { ApiError } from './ApiError';
import { apiFetch } from './httpClient';

export type AdminQueryParams = Record<string, string | number | boolean | undefined>;

function createRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function parseErrorPayload(response: Response): Promise<unknown> {
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

function extractErrorMessage(payload: unknown, response: Response): { message: string; code?: string; details?: unknown } {
  if (payload && typeof payload === 'object') {
    const envelope = payload as { message?: string; code?: string; details?: unknown };
    return {
      message: envelope.message || response.statusText || `Request failed: ${response.status}`,
      code: envelope.code,
      details: envelope.details ?? payload,
    };
  }

  if (typeof payload === 'string' && payload.trim()) {
    return { message: payload, details: payload };
  }

  return {
    message: response.statusText || `Request failed: ${response.status}`,
    details: payload,
  };
}

function parseAttachmentFileName(header: string | null): string | null {
  if (!header) {
    return null;
  }

  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  const basicMatch = header.match(/filename="([^"]+)"/i) || header.match(/filename=([^;]+)/i);
  if (!basicMatch?.[1]) {
    return null;
  }

  return basicMatch[1].trim();
}

function buildQuery(params?: AdminQueryParams): string {
  if (!params) {
    return '';
  }

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  }

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

export function getAdminHealth(): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>('/api/admin/health', {
    method: 'GET',
    skipCsrf: true,
  });
}

export function getAdminOverview(params?: { from?: string; to?: string }): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>(`/api/admin/overview${buildQuery(params)}`, {
    method: 'GET',
    skipCsrf: true,
  });
}

export function getAdminMetrics(params?: {
  date_from?: string;
  date_to?: string;
  category?: string;
  offer_type?: string;
  channel?: string;
}): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>(`/api/admin/metrics${buildQuery(params)}`, {
    method: 'GET',
    skipCsrf: true,
  });
}

export async function downloadAdminMetricsCsv(params?: {
  date_from?: string;
  date_to?: string;
  category?: string;
  offer_type?: string;
  channel?: string;
}): Promise<{ blob: Blob; fileName: string | null }> {
  const requestId = createRequestId();
  const response = await fetch(`/api/admin/metrics/export${buildQuery(params)}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'X-Request-ID': requestId,
    },
  });

  if (!response.ok) {
    const payload = await parseErrorPayload(response);
    const error = extractErrorMessage(payload, response);
    throw new ApiError({
      status: response.status,
      code: error.code,
      message: error.message,
      details: error.details,
      requestId,
      url: '/api/admin/metrics/export',
      method: 'GET',
    });
  }

  return {
    blob: await response.blob(),
    fileName: parseAttachmentFileName(response.headers.get('Content-Disposition')),
  };
}

export function getAdminRecsMetrics(params?: {
  days?: number;
  experiment_id?: string;
  variant?: string;
}): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>(`/api/admin/recs/experiments${buildQuery(params)}`, {
    method: 'GET',
    skipCsrf: true,
  });
}
