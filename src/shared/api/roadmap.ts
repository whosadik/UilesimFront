import { apiFetch } from './httpClient';

export type RoadmapRecommendedProduct = {
  id?: number;
  name?: string;
  brand?: string;
  price?: string | number | null;
  category?: string;
  product_type?: string;
  in_stock?: boolean;
  [k: string]: unknown;
};

export type RoadmapStepApi = {
  id?: number;
  step_index?: number;
  product_type?: string;
  status?: string;
  recommended_product?: RoadmapRecommendedProduct | null;
  suggestions?: unknown[];
  score?: number | null;
  confidence?: number | null;
  why?: unknown;
  cadence?: string;
  [k: string]: unknown;
};

export type RoadmapSummaryApi = {
  next_step?: {
    id?: number;
    step_index?: number;
    product_type?: string;
    status?: string;
    [k: string]: unknown;
  } | null;
  missing_steps_count?: number;
  total_steps?: number;
  [k: string]: unknown;
};

export type RoadmapPlanApi = {
  id?: number;
  category?: string;
  is_active?: boolean;
  version?: number;
  meta?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  steps?: RoadmapStepApi[];
  summary?: RoadmapSummaryApi;
  [k: string]: unknown;
};

type RoadmapRefreshPayload = {
  category: string;
};

export function getRoadmap(category: string): Promise<RoadmapPlanApi> {
  const query = new URLSearchParams({ category });
  return apiFetch<RoadmapPlanApi>(`/api/me/roadmap?${query.toString()}`, {
    method: 'GET',
    skipCsrf: true,
  });
}

export function refreshRoadmap(payload: RoadmapRefreshPayload): Promise<RoadmapPlanApi> {
  return apiFetch<RoadmapPlanApi>('/api/me/roadmap/refresh', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function clickRoadmapStep(stepId: string | number): Promise<{ ok?: boolean; step_id?: number }> {
  return apiFetch<{ ok?: boolean; step_id?: number }>(`/api/me/roadmap/steps/${stepId}/click`, {
    method: 'POST',
  });
}
