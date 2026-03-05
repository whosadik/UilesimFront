import { apiFetch } from './httpClient';

type AdminQueryParams = Record<string, string | number | boolean | undefined>;

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

export type AdminAuditItem = {
  id: number;
  created_at: string;
  action: string;
  user_id: number | null;
  entity_type: string | null;
  entity_id: string | null;
  request_id: string | null;
  path: string | null;
  method: string | null;
  status_code: number | null;
  ip: string | null;
  meta: Record<string, unknown> | null;
};

export type AdminAuditResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminAuditItem[];
};

export function getAdminAudit(params?: {
  action?: string;
  user_id?: number;
  request_id?: string;
  entity_type?: string;
  entity_id?: string;
  path?: string;
  status_code?: number;
  since?: string;
  until?: string;
  page?: number;
  page_size?: number;
}) {
  return apiFetch<AdminAuditResponse>(`/api/admin/audit${buildQuery(params)}`, {
    method: 'GET',
    skipCsrf: true,
  });
}

export function buildAdminAuditExportCsvUrl(params?: {
  action?: string;
  user_id?: number;
  request_id?: string;
  entity_type?: string;
  entity_id?: string;
  path?: string;
  status_code?: number;
  since?: string;
  until?: string;
  page?: number;
  page_size?: number;
}) {
  return `/api/admin/audit/export.csv${buildQuery(params)}`;
}

export function invalidateAdminCache(payload: { scope?: string; key?: string }) {
  return apiFetch<{ ok: boolean; deleted?: number; keys?: string[] }>(
    '/api/admin/cache/invalidate',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}
