import { apiFetch } from './httpClient';

export type OfferType = 'discount' | 'points_multiplier' | 'gift';
export type TargetScope = 'cart' | 'category' | 'brand' | 'product_type' | 'product_id';

export type Offer = {
  id: number;
  campaign: number | null;
  name: string;
  offer_type: OfferType;
  value: string | number;
  target_scope: TargetScope;
  estimated_cost: string | number;
  cooldown_days: number;
  expires_in_days: number;
  allowed_categories: string[];
  allowed_brands: string[];
  allowed_product_ids: number[];
  allowed_product_types: string[];
  allowed_steps: string[];
  min_total_spend_90d: string | number;
  is_active: boolean;
  created_at?: string;
};

type OfferListResponse =
  | { ok?: boolean; results: Offer[] }
  | { results: Offer[] }
  | Offer[];

type OfferDetailResponse =
  | { ok?: boolean; offer: Offer }
  | Offer;

function unwrapList(payload: OfferListResponse): Offer[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object' && Array.isArray((payload as { results?: Offer[] }).results)) {
    return (payload as { results: Offer[] }).results;
  }
  return [];
}

function unwrapDetail(payload: OfferDetailResponse): Offer {
  if (payload && typeof payload === 'object' && 'offer' in payload && (payload as { offer?: Offer }).offer) {
    return (payload as { offer: Offer }).offer;
  }
  return payload as Offer;
}

export async function listOffers(params?: {
  campaign_id?: number | string;
  is_active?: boolean;
  offer_type?: OfferType;
}): Promise<Offer[]> {
  const query = new URLSearchParams();
  if (params?.campaign_id !== undefined && params.campaign_id !== null && params.campaign_id !== '') {
    query.set('campaign_id', String(params.campaign_id));
  }
  if (params?.is_active !== undefined) {
    query.set('is_active', String(params.is_active));
  }
  if (params?.offer_type) {
    query.set('offer_type', params.offer_type);
  }

  const qs = query.toString();
  const path = qs ? `/api/admin/offers?${qs}` : '/api/admin/offers';
  const res = await apiFetch<OfferListResponse>(path, { method: 'GET', skipCsrf: true });
  return unwrapList(res);
}

export async function createOffer(payload: Partial<Offer> & { campaign: number }): Promise<Offer> {
  const res = await apiFetch<OfferDetailResponse>('/api/admin/offers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return unwrapDetail(res);
}

export async function patchOffer(id: number | string, payload: Partial<Offer>): Promise<Offer> {
  const res = await apiFetch<OfferDetailResponse>(`/api/admin/offers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return unwrapDetail(res);
}

export async function deleteOffer(id: number | string): Promise<void> {
  await apiFetch<{ ok?: boolean }>(`/api/admin/offers/${id}`, {
    method: 'DELETE',
    skipCsrf: false,
  });
}
