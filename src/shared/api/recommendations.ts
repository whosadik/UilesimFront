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
  | {
      ok?: boolean;
      sections?: Array<{
        key?: string;
        title?: string;
        results?: RecItem[];
        [k: string]: unknown;
      }>;
      results?: RecItem[];
      next_offer?: unknown;
      [k: string]: unknown;
    }
  | RecItem[];

export type BundleRecsResponse =
  | {
      query?: Record<string, unknown>;
      results?: RecItem[];
      [k: string]: unknown;
    }
  | RecItem[];

export type RecommendationEventPayload = {
  action: 'click' | 'add_to_cart';
  product_id: number;
  page?: string;
  section_key?: string;
  context?: Record<string, unknown>;
};

type RecommendationRequestOptions = {
  requestId?: string;
};

function withRequestHeaders(options?: RecommendationRequestOptions): HeadersInit | undefined {
  if (!options?.requestId) {
    return undefined;
  }

  return {
    'X-Request-ID': options.requestId,
  };
}

export function home(options?: RecommendationRequestOptions): Promise<HomeRecsResponse> {
  return apiFetch<HomeRecsResponse>('/api/me/recommendations/home', {
    method: 'GET',
    headers: withRequestHeaders(options),
    skipCsrf: true,
  });
}

export function bundle(params: {
  product_id: number | string;
  limit?: number;
  algo?: 'cooc' | 'reranker' | 'auto';
}, options?: RecommendationRequestOptions): Promise<BundleRecsResponse> {
  const query = new URLSearchParams();
  query.set('product_id', String(params.product_id));

  if (params.limit !== undefined) {
    query.set('limit', String(params.limit));
  }

  if (params.algo) {
    query.set('algo', params.algo);
  }

  return apiFetch<BundleRecsResponse>(`/api/me/recommendations/bundle?${query.toString()}`, {
    method: 'GET',
    headers: withRequestHeaders(options),
    skipCsrf: true,
  });
}

export function sendEvent(
  payload: RecommendationEventPayload,
  options?: RecommendationRequestOptions,
): Promise<{ ok: boolean } | void> {
  return apiFetch<{ ok: boolean } | void>('/api/me/recommendations/event', {
    method: 'POST',
    headers: withRequestHeaders(options),
    body: JSON.stringify(payload),
  });
}
