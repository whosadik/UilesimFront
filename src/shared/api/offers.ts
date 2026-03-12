import { apiFetch } from './httpClient';

export function nextOffer(): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>('/api/me/next-offer', {
    method: 'GET',
    skipCsrf: true,
  });
}

export type HomePromotionsResponse = {
  ok: boolean;
  count: number;
  limit: number;
  banners: Record<string, unknown>[];
};

export function listHomePromotions(limit = 6): Promise<HomePromotionsResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  return apiFetch<HomePromotionsResponse>(`/api/me/home-promotions?${params.toString()}`, {
    method: 'GET',
    skipCsrf: true,
  });
}

export type RedeemOfferPayload = {
  assignment_id: number;
  transaction_id: number;
};

export function redeemOffer(payload: RedeemOfferPayload): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>('/api/offers/redeem', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function listMyOffers(): Promise<Record<string, unknown>[]> {
  return apiFetch<Record<string, unknown>[]>('/api/me/offers', {
    method: 'GET',
    skipCsrf: true,
  });
}

// GET /api/me/next-offer :contentReference[oaicite:28]{index=28}
export function getNextOffer() {
  return apiFetch<any>('/api/me/next-offer');
}

// POST /api/offers/click :contentReference[oaicite:29]{index=29}
export function clickOffer(assignmentId: number, context: Record<string, unknown> = {}) {
  return apiFetch<any>('/api/offers/click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' /* + X-CSRFToken если ваш клиент не добавляет сам */ },
    body: JSON.stringify({ assignment_id: assignmentId, context }),
  });
}
