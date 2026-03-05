import { apiFetch } from './httpClient';

export type OwnedProductRecord = {
  id: number;
  product?: Record<string, unknown> | null;
  quantity_total?: number;
  is_active?: boolean;
  acquired_at?: string;
  last_acquired_at?: string;
  source?: string;
  [k: string]: unknown;
};

type OwnedProductsListResponse =
  | OwnedProductRecord[]
  | {
      ok?: boolean;
      results?: OwnedProductRecord[];
      owned_products?: OwnedProductRecord[];
      [k: string]: unknown;
    };

function normalizeOwnedProductsList(response: OwnedProductsListResponse): OwnedProductRecord[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.results)) {
    return response.results;
  }

  if (Array.isArray(response.owned_products)) {
    return response.owned_products;
  }

  return [];
}

export async function listOwnedProducts(): Promise<OwnedProductRecord[]> {
  const response = await apiFetch<OwnedProductsListResponse>('/api/me/owned-products/', {
    method: 'GET',
    skipCsrf: true,
  });

  return normalizeOwnedProductsList(response);
}

export function activateOwnedProduct(id: string | number): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>(`/api/me/owned-products/${id}/activate/`, {
    method: 'POST',
  });
}

export function deactivateOwnedProduct(id: string | number): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>(`/api/me/owned-products/${id}/deactivate/`, {
    method: 'POST',
  });
}
