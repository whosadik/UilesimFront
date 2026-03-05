import { apiFetch } from './httpClient';

export type Campaign = {
  id: number;
  name?: string;
  is_active?: boolean;
  priority?: number;
  weekly_limit?: string | number | null;
  weekly_spent?: string | number | null;
  week_start_date?: string | null;
  allowed_categories?: string[];
  allowed_steps?: string[];
  [k: string]: unknown;
};

export type CampaignListResponse =
  | { ok?: boolean; results: Campaign[]; [k: string]: unknown }
  | { results: Campaign[]; [k: string]: unknown }
  | Campaign[];

export async function listCampaigns(params?: {
  is_active?: boolean;
  name?: string;
  ordering?: string;
}): Promise<Campaign[]> {
  const query = new URLSearchParams();
  if (params) {
    if (params.is_active !== undefined) {
      query.set('is_active', String(params.is_active));
    }
    if (params.name) {
      query.set('name', params.name);
    }
    if (params.ordering) {
      query.set('ordering', params.ordering);
    }
  }

  const queryString = query.toString();
  const path = queryString ? `/api/admin/campaigns?${queryString}` : '/api/admin/campaigns';
  const response = await apiFetch<CampaignListResponse>(path, {
    method: 'GET',
    skipCsrf: true,
  });

  if (Array.isArray(response)) {
    return response;
  }

  if (response && typeof response === 'object' && Array.isArray(response.results)) {
    return response.results;
  }

  return [];
}

export function createCampaign(payload: Record<string, unknown> | Partial<Campaign>) {
  return apiFetch<Campaign | { ok?: boolean; campaign?: Campaign; [k: string]: unknown }>(
    '/api/admin/campaigns',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export function getCampaign(id: number | string) {
  return apiFetch<Campaign | { ok?: boolean; campaign?: Campaign; [k: string]: unknown }>(
    `/api/admin/campaigns/${id}`,
    {
      method: 'GET',
      skipCsrf: true,
    },
  );
}

export function patchCampaign(id: number | string, payload: Record<string, unknown>) {
  return apiFetch<Campaign | { ok?: boolean; campaign?: Campaign; [k: string]: unknown }>(
    `/api/admin/campaigns/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}
