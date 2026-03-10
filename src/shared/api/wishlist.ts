import { apiFetch } from "./httpClient";

export type WishlistProduct = {
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

export type WishlistItem = {
  product: WishlistProduct;
  created_at?: string;
};

export type WishlistResponse = {
  ok?: boolean;
  count?: number;
  items?: WishlistItem[];
};

export function getWishlist(): Promise<WishlistResponse> {
  return apiFetch<WishlistResponse>("/api/me/wishlist", {
    method: "GET",
    skipCsrf: true,
  });
}

export function addToWishlist(productId: string | number): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>("/api/me/wishlist", {
    method: "POST",
    body: JSON.stringify({ product_id: Number(productId) }),
  });
}

export function removeFromWishlist(productId: string | number): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>(`/api/me/wishlist/${Number(productId)}`, {
    method: "DELETE",
  });
}
