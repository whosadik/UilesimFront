import { apiFetch } from './httpClient';

export type Campaign = {
  id: number;
  name?: string;
  campaign_type?: 'personal' | 'public';
  is_active?: boolean;
  priority?: number;
  weekly_limit?: string | number | null;
  weekly_spent?: string | number | null;
  start_date?: string | null;
  end_date?: string | null;
  allowed_categories?: string[];
  allowed_steps?: string[];
  allowed_brands?: string[];
  allowed_product_ids?: number[];
  tiers?: string[];
  recommendation_rules?: Record<string, unknown>;
  promo_text?: string;
  banner_url?: string;
  offers_count?: number;
  [k: string]: unknown;
};

export type CampaignListResponse =
  | { ok?: boolean; results: Campaign[]; [k: string]: unknown }
  | { results: Campaign[]; [k: string]: unknown }
  | Campaign[];

export async function listCampaigns(params?: {
  is_active?: boolean;
  campaign_type?: 'personal' | 'public';
  name?: string;
  ordering?: string;
}): Promise<Campaign[]> {
  const query = new URLSearchParams();
  if (params) {
    if (params.is_active !== undefined) {
      query.set('is_active', String(params.is_active));
    }
    if (params.campaign_type) {
      query.set('campaign_type', params.campaign_type);
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

export function publishCampaign(id: number | string) {
  return apiFetch<Campaign | { ok?: boolean; campaign?: Campaign; [k: string]: unknown }>(
    `/api/admin/campaigns/${id}/publish`,
    {
      method: 'POST',
    },
  );
}

export function uploadCampaignBanner(id: number | string, file: File) {
  const body = new FormData();
  body.append('file', file);
  return apiFetch<{ ok?: boolean; campaign?: Campaign; [k: string]: unknown }>(
    `/api/admin/campaigns/${id}/banner`,
    {
      method: 'POST',
      body,
    },
  );
}

export type CampaignRecommendationProduct = {
  product_id: number;
  name: string;
  brand?: string;
  category?: string;
  product_type?: string;
  price?: string | number | null;
  units_sold: number;
  revenue: string | number;
  recommended_action: 'discount' | string;
  recommended_discount_percent: number;
  reason: string;
};

export type CampaignRecommendationBrand = {
  brand: string;
  products_count: number;
  product_ids: number[];
  units_sold: number;
  revenue: string | number;
  recommended_discount_percent: number;
  reason: string;
};

export type CampaignRecommendationsResponse = {
  ok?: boolean;
  campaign_id: number;
  rules: {
    period_days: number;
    min_units_sold: number;
    min_revenue: string | number;
  };
  count: number;
  products: CampaignRecommendationProduct[];
  brands: CampaignRecommendationBrand[];
};

export function listCampaignRecommendations(
  id: number | string,
  params?: {
    period_days?: number;
    min_units_sold?: number;
    min_revenue?: number | string;
    category?: string;
    brand?: string;
    limit?: number;
  },
) {
  const query = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, String(value));
      }
    }
  }
  const qs = query.toString();
  return apiFetch<CampaignRecommendationsResponse>(
    `/api/admin/campaigns/${id}/recommendations${qs ? `?${qs}` : ''}`,
    {
      method: 'GET',
      skipCsrf: true,
    },
  );
}
