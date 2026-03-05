import { apiFetch } from './httpClient';

export type AdminQueryParams = Record<string, string | number | boolean | undefined>;

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
