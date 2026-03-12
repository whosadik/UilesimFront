import { apiFetch } from './httpClient';

export type RoadmapRecommendedProduct = {
  id?: number;
  name?: string;
  brand?: string;
  price?: string | number | null;
  currency?: string | null;
  category?: string;
  product_type?: string;
  in_stock?: boolean;
  image_url?: string | null;
  image_urls?: string[];
  points_earned?: number;
  [k: string]: unknown;
};

export type RoadmapStepPresentationApi = {
  title?: string;
  description?: string;
  points?: number;
  why?: string;
  improves?: string;
  benefit?: string;
  [k: string]: unknown;
};

export type RoadmapStepSnapshotApi = {
  id?: number;
  step_id?: number;
  plan_id?: number | null;
  category?: string | null;
  step_index?: number;
  product_type?: string;
  status?: string;
  title?: string;
  description?: string;
  presentation?: RoadmapStepPresentationApi;
  why?: unknown;
  cadence?: string;
  recommended_product_id?: number | null;
  recommended_product?: RoadmapRecommendedProduct | null;
  [k: string]: unknown;
};

export type RoadmapStepApi = RoadmapStepSnapshotApi & {
  suggestions?: unknown[];
  score?: number | null;
  confidence?: number | null;
};

export type RoadmapStepStatusApi =
  | 'missing'
  | 'recommended'
  | 'owned'
  | 'skipped'
  | 'completed';

export type RoadmapSummaryApi = {
  next_step?: RoadmapStepSnapshotApi | null;
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
  category?: string;
};

export function getRoadmap(category?: string): Promise<RoadmapPlanApi> {
  const query = new URLSearchParams();
  if (category) {
    query.set('category', category);
  }
  const search = query.toString();

  return apiFetch<RoadmapPlanApi>(search ? `/api/me/roadmap?${search}` : '/api/me/roadmap', {
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

export function updateRoadmapStep(
  stepId: string | number,
  status: RoadmapStepStatusApi,
): Promise<{ ok?: boolean; step?: RoadmapStepApi }> {
  return apiFetch<{ ok?: boolean; step?: RoadmapStepApi }>(`/api/me/roadmap/steps/${stepId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
