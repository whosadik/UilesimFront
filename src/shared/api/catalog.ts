import { apiFetch } from './httpClient';

export interface Product {
  id: number;
  name: string;
  brand?: string;
  product_type?: string;
  category?: string;
  price?: string | number | null;
  image_url?: string | null;
  image_urls?: string[];
  in_stock?: boolean;
  currency?: string | null;
  [key: string]: any;
}

export interface ProductListResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results: Product[];
}

export function listProducts(
  params?: Record<string, string | number | boolean | undefined>,
): Promise<Product[] | ProductListResponse> {
  const query = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, String(value));
      }
    }
  }

  const search = query.toString();
  const path = search ? `/api/products/?${search}` : '/api/products/';

  return apiFetch(path, {
    method: 'GET',
    skipCsrf: true,
  });
}

export function getProduct(id: string | number): Promise<Product> {
  return apiFetch(`/api/products/${id}/`, {
    method: 'GET',
    skipCsrf: true,
  });
}
