import { apiFetch } from './httpClient';

export interface AdminBrand {
  id: number;
  name: string;
  slug: string;
  description_ru: string;
  description_kk: string;
  description_en: string;
  logo_image: string | null;
  logo_image_url: string;
  logo_url: string;
  is_active: boolean;
  product_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdminProduct {
  id: number;
  source_product_id: string;
  name: string;
  brand: string;
  brand_ref: number | null;
  brand_slug: string;
  price: string | null;
  currency: string;
  category: string;
  product_type: string;
  concerns: string[];
  attrs: Record<string, unknown>;
  actives: string[];
  flags: string[];
  supported_skin_types: string[];
  step: string;
  strength: string;
  in_stock: boolean;
  image: string | null;
  image_url: string;
  image_url_display: string;
  image_urls: string[];
  description: string;
  application_text: string;
  ingredients_inci: string;
  volume_raw: string;
  raw_meta: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

function buildQuery(params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) return '';
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    query.set(key, String(value));
  }
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

function toFormData(payload: Record<string, unknown>): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    if (value === null) {
      form.append(key, '');
      continue;
    }
    if (value instanceof File || value instanceof Blob) {
      form.append(key, value);
      continue;
    }
    if (typeof value === 'object') {
      form.append(key, JSON.stringify(value));
      continue;
    }
    form.append(key, String(value));
  }
  return form;
}

function hasFileField(payload: Record<string, unknown>): boolean {
  return Object.values(payload).some((v) => v instanceof File || v instanceof Blob);
}

// ───── Brands ─────

export function listAdminBrands(params?: {
  search?: string;
  is_active?: boolean;
}): Promise<AdminBrand[]> {
  return apiFetch<AdminBrand[]>(`/api/admin/brands/${buildQuery(params)}`, {
    method: 'GET',
    skipCsrf: true,
  });
}

export function getAdminBrand(id: number | string): Promise<AdminBrand> {
  return apiFetch<AdminBrand>(`/api/admin/brands/${id}/`, {
    method: 'GET',
    skipCsrf: true,
  });
}

export function createAdminBrand(payload: Record<string, unknown>): Promise<AdminBrand> {
  if (hasFileField(payload)) {
    return apiFetch<AdminBrand>('/api/admin/brands/', {
      method: 'POST',
      body: toFormData(payload),
    });
  }
  return apiFetch<AdminBrand>('/api/admin/brands/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAdminBrand(
  id: number | string,
  payload: Record<string, unknown>,
): Promise<AdminBrand> {
  if (hasFileField(payload)) {
    return apiFetch<AdminBrand>(`/api/admin/brands/${id}/`, {
      method: 'PATCH',
      body: toFormData(payload),
    });
  }
  return apiFetch<AdminBrand>(`/api/admin/brands/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteAdminBrand(id: number | string): Promise<void> {
  return apiFetch<void>(`/api/admin/brands/${id}/`, {
    method: 'DELETE',
  });
}

// ───── Products ─────

export function listAdminProducts(params?: {
  search?: string;
  category?: string;
  product_type?: string;
  brand_ref?: number;
  in_stock?: boolean;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<AdminProduct>> {
  return apiFetch<PaginatedResponse<AdminProduct>>(
    `/api/admin/products/${buildQuery(params)}`,
    {
      method: 'GET',
      skipCsrf: true,
    },
  );
}

export function getAdminProduct(id: number | string): Promise<AdminProduct> {
  return apiFetch<AdminProduct>(`/api/admin/products/${id}/`, {
    method: 'GET',
    skipCsrf: true,
  });
}

export function createAdminProduct(payload: Record<string, unknown>): Promise<AdminProduct> {
  if (hasFileField(payload)) {
    return apiFetch<AdminProduct>('/api/admin/products/', {
      method: 'POST',
      body: toFormData(payload),
    });
  }
  return apiFetch<AdminProduct>('/api/admin/products/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAdminProduct(
  id: number | string,
  payload: Record<string, unknown>,
): Promise<AdminProduct> {
  if (hasFileField(payload)) {
    return apiFetch<AdminProduct>(`/api/admin/products/${id}/`, {
      method: 'PATCH',
      body: toFormData(payload),
    });
  }
  return apiFetch<AdminProduct>(`/api/admin/products/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteAdminProduct(id: number | string): Promise<void> {
  return apiFetch<void>(`/api/admin/products/${id}/`, {
    method: 'DELETE',
  });
}
