import { apiFetch } from "./httpClient";

export type CartProduct = {
  id: number;
  name?: string;
  brand?: string;
  price?: number | string | null;
  image_url?: string | null;
  image_urls?: string[];
  category?: string;
  product_type?: string;
  in_stock?: boolean;
  points_earned?: number;
  [key: string]: unknown;
};

export type CartItem = {
  product: CartProduct;
  quantity: number;
  created_at?: string;
  updated_at?: string;
};

export type CartResponse = {
  ok?: boolean;
  count?: number;
  total_quantity?: number;
  items?: CartItem[];
};

export function getCart(): Promise<CartResponse> {
  return apiFetch<CartResponse>("/api/me/cart", {
    method: "GET",
    skipCsrf: true,
  });
}

export function addCartItem(
  productId: string | number,
  quantity = 1,
): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>("/api/me/cart", {
    method: "POST",
    body: JSON.stringify({
      product_id: Number(productId),
      quantity: Math.max(1, Math.round(quantity)),
    }),
  });
}

export function updateCartItem(
  productId: string | number,
  quantity: number,
): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>(`/api/me/cart/${Number(productId)}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity: Math.max(0, Math.round(quantity)) }),
  });
}

export function removeCartItem(productId: string | number): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>(`/api/me/cart/${Number(productId)}`, {
    method: "DELETE",
  });
}
