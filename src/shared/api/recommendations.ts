import { apiFetch } from './httpClient';

export type RecItem = {
  product: {
    id: number;
    name?: string;
    image_url?: string | null;
    price?: string | number | null;
    [k: string]: unknown;
  };
  score?: number;
  why?: unknown;
  components?: unknown;
  [k: string]: unknown;
};

export type HomeRecsResponse =
  | { ok?: boolean; results: RecItem[]; next_offer?: unknown; [k: string]: unknown }
  | { results: RecItem[]; [k: string]: unknown }
  | RecItem[];

export type RecommendationEventPayload = {
  event_type: string;
  placement: string;
  product_id?: number;
  assignment_id?: number;
  meta?: Record<string, unknown>;
};

export function home(): Promise<HomeRecsResponse> {
  return apiFetch<HomeRecsResponse>('/api/me/recommendations/home', {
    method: 'GET',
    skipCsrf: true,
  });
}

export function sendEvent(payload: RecommendationEventPayload): Promise<{ ok: boolean } | void> {
  return apiFetch<{ ok: boolean } | void>('/api/me/recommendations/event', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
