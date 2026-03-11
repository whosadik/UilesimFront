import { apiFetch } from './httpClient';

export interface BrandSummary {
  slug: string;
  name: string;
  logo_letter?: string;
  product_count: number;
}

export interface BrandDetail extends BrandSummary {
  description: string;
  categories: string[];
  top_product_types: string[];
  new_products_count: number;
  sale_products_count: number;
}

export function listBrands(): Promise<BrandSummary[]> {
  return apiFetch('/api/brands/', {
    method: 'GET',
    skipCsrf: true,
  });
}

export function getBrand(slug: string): Promise<BrandDetail> {
  return apiFetch(`/api/brands/${encodeURIComponent(slug)}/`, {
    method: 'GET',
    skipCsrf: true,
  });
}
