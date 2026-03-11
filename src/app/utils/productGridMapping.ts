import type { Product } from "../components/ProductGrid";

export type ApiProductRecord = Record<string, unknown>;

type MapApiProductOptions = {
  fallbackIdPrefix: string;
  fallbackImageUrl: string;
  defaultCategory?: string;
  newProductWindowDays?: number;
};

const DEFAULT_CATEGORY = "skincare";
const DEFAULT_NEW_PRODUCT_WINDOW_DAYS = 60;

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

function firstNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    const parsed = toNumber(value);
    if (parsed !== undefined) {
      return parsed;
    }
  }

  return undefined;
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

export function extractProducts(payload: unknown): ApiProductRecord[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is ApiProductRecord => Boolean(toRecord(item)));
  }

  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { results?: unknown[] }).results)
  ) {
    return (payload as { results: unknown[] }).results.filter(
      (item): item is ApiProductRecord => Boolean(toRecord(item)),
    );
  }

  return [];
}

export function isNewByCreatedAt(
  value: unknown,
  newProductWindowDays = DEFAULT_NEW_PRODUCT_WINDOW_DAYS,
): boolean {
  if (typeof value !== "string" || !value.trim()) {
    return false;
  }

  const createdAt = new Date(value);
  if (Number.isNaN(createdAt.getTime())) {
    return false;
  }

  const diffMs = Date.now() - createdAt.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= newProductWindowDays;
}

export function mapApiProductToGrid(
  item: ApiProductRecord,
  index: number,
  options: MapApiProductOptions,
): Product {
  const rawMeta = toRecord(item.raw_meta);
  const attrs = toRecord(item.attrs);
  const fallbackId = `${options.fallbackIdPrefix}-${index}`;
  const id = item.id !== undefined && item.id !== null ? String(item.id) : fallbackId;
  const price = toNumber(item.price) ?? 0;
  const originalPriceRaw = firstNumber(
    item.original_price,
    rawMeta?.original_price,
    rawMeta?.old_price,
    attrs?.original_price,
  );
  const originalPrice =
    originalPriceRaw !== undefined ? Math.max(0, Math.round(originalPriceRaw)) : undefined;

  const imageUrls = [
    ...toStringArray(item.image_urls),
    ...toStringArray(rawMeta?.image_urls),
  ];
  const image =
    firstString(item.image_url, item.image, rawMeta?.image_url, rawMeta?.image) ||
    imageUrls[0] ||
    options.fallbackImageUrl;

  let discount = firstNumber(
    item.discount,
    item.discount_percent,
    rawMeta?.discount,
    rawMeta?.discount_percent,
    attrs?.discount,
    attrs?.discount_percent,
  );
  if (discount === undefined && originalPrice && originalPrice > price) {
    discount = Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  const isNew =
    typeof item.is_new === "boolean"
      ? item.is_new
      : isNewByCreatedAt(item.created_at, options.newProductWindowDays);

  return {
    id,
    name: firstString(item.name) || `Товар #${id}`,
    brand: firstString(item.brand) || "Uilesim",
    price: Math.max(0, Math.round(price)),
    originalPrice,
    image,
    category:
      firstString(item.category, item.product_type) ||
      options.defaultCategory ||
      DEFAULT_CATEGORY,
    isNew,
    discount: discount !== undefined ? Math.max(0, Math.round(discount)) : undefined,
    inStock: item.in_stock === undefined ? true : Boolean(item.in_stock),
    pointsEarned: firstNumber(item.points_earned, rawMeta?.points_earned, attrs?.points_earned),
  };
}
