import {
  formatCatalogCategoryLabel,
  formatCatalogProductTypeLabel,
} from '../../../../shared/catalog/presentation';
import type { Campaign } from '../../../../shared/api/adminCampaigns';
import type { Offer, OfferType, TargetScope } from '../../../../shared/api/adminOffers';

export const CATEGORY_OPTIONS = [
  { value: 'skincare', label: formatCatalogCategoryLabel('skincare', 'ru') ?? 'skincare' },
  { value: 'makeup', label: formatCatalogCategoryLabel('makeup', 'ru') ?? 'makeup' },
  { value: 'haircare', label: formatCatalogCategoryLabel('haircare', 'ru') ?? 'haircare' },
  { value: 'fragrance', label: formatCatalogCategoryLabel('fragrance', 'ru') ?? 'fragrance' },
];

export const STEP_OPTIONS = [
  { value: 'cleanser', label: formatCatalogProductTypeLabel('cleanser', 'ru') ?? 'cleanser' },
  { value: 'serum', label: formatCatalogProductTypeLabel('serum', 'ru') ?? 'serum' },
  { value: 'moisturizer', label: formatCatalogProductTypeLabel('moisturizer', 'ru') ?? 'moisturizer' },
  { value: 'spf', label: formatCatalogProductTypeLabel('spf', 'ru') ?? 'spf' },
  { value: 'conditioner', label: formatCatalogProductTypeLabel('conditioner', 'ru') ?? 'conditioner' },
  { value: 'hair_mask', label: formatCatalogProductTypeLabel('hair_mask', 'ru') ?? 'hair_mask' },
  { value: 'lipstick', label: formatCatalogProductTypeLabel('lipstick', 'ru') ?? 'lipstick' },
  { value: 'mascara', label: formatCatalogProductTypeLabel('mascara', 'ru') ?? 'mascara' },
  { value: 'edt', label: formatCatalogProductTypeLabel('edt', 'ru') ?? 'edt' },
  { value: 'body_mist', label: formatCatalogProductTypeLabel('body_mist', 'ru') ?? 'body_mist' },
];

export const OFFER_TYPE_LABEL: Record<OfferType, string> = {
  discount: 'Скидка (%)',
  points_multiplier: 'Множитель баллов (×N)',
  gift: 'Подарок',
};

export const TARGET_SCOPE_LABEL: Record<TargetScope, string> = {
  cart: 'На всю корзину',
  category: 'На категорию',
  brand: 'На бренд',
  product_type: 'На тип товара',
  product_id: 'На конкретный товар',
};

export type PickerKind = 'brands' | 'products';

export function asArrayOfStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

export function asArrayOfNumbers(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  const out: number[] = [];
  value.forEach((item) => {
    const n = Number(item);
    if (Number.isFinite(n) && n > 0 && !out.includes(n)) {
      out.push(Math.trunc(n));
    }
  });
  return out;
}

export function toggleArrayValue(items: string[], value: string): string[] {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
}

export function toggleNumber(items: number[], value: number): number[] {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
}

export function sameBrand(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function removeBrand(items: string[], value: string): string[] {
  return items.filter((item) => !sameBrand(item, value));
}

export function toggleBrand(items: string[], value: string): string[] {
  return items.some((item) => sameBrand(item, value)) ? removeBrand(items, value) : [...items, value];
}

export function formatMoney(v: number) {
  return v.toLocaleString('ru') + ' ₸';
}

/**
 * Personal campaign form: no targeting at campaign level — that lives on individual offers.
 */
export type PersonalCampaignForm = {
  id: string;
  name: string;
  status: 'draft' | 'active';
  priority: string;
  start: string;
  end: string;
  budget: string;
  promoText: string;
  bannerUrl: string;
};

export const DEFAULT_PERSONAL_FORM: PersonalCampaignForm = {
  id: 'new',
  name: '',
  status: 'draft',
  priority: '100',
  start: '',
  end: '',
  budget: '0',
  promoText: '',
  bannerUrl: '',
};

/**
 * Catalog promotion form: one campaign + one inline offer. No KPI, no offers list.
 */
export type CatalogPromotionForm = {
  id: string;
  name: string;
  status: 'draft' | 'active';
  start: string;
  end: string;
  budget: string;
  categories: string[];
  productTypes: string[];
  brands: string[];
  productIds: number[];
  offerType: OfferType;
  offerValue: string;
  targetScope: TargetScope;
  minTotalSpend90d: string;
  promoText: string;
  bannerUrl: string;
};

export const DEFAULT_CATALOG_FORM: CatalogPromotionForm = {
  id: 'new',
  name: '',
  status: 'draft',
  start: '',
  end: '',
  budget: '',
  categories: [],
  productTypes: [],
  brands: [],
  productIds: [],
  offerType: 'discount',
  offerValue: '10',
  targetScope: 'cart',
  minTotalSpend90d: '0',
  promoText: '',
  bannerUrl: '',
};

function pickSource(
  response: Record<string, unknown> | { ok?: boolean; campaign?: Campaign } | Campaign,
): Record<string, unknown> {
  return response && typeof response === 'object' && 'campaign' in response
    ? (((response as { campaign?: Campaign }).campaign ?? {}) as Record<string, unknown>)
    : (response as Record<string, unknown>);
}

export function parsePersonalCampaign(
  response: Record<string, unknown> | { ok?: boolean; campaign?: Campaign } | Campaign,
  fallbackId?: string,
): PersonalCampaignForm {
  const source = pickSource(response);
  const budgetRaw = source.weekly_limit;
  return {
    id: String(source.id ?? fallbackId ?? DEFAULT_PERSONAL_FORM.id),
    name: String(source.name ?? DEFAULT_PERSONAL_FORM.name),
    status: source.is_active ? 'active' : 'draft',
    priority: String(source.priority ?? DEFAULT_PERSONAL_FORM.priority),
    start: typeof source.start_date === 'string' ? source.start_date : '',
    end: typeof source.end_date === 'string' ? source.end_date : '',
    budget: typeof budgetRaw === 'number' || typeof budgetRaw === 'string' ? String(budgetRaw) : '0',
    promoText: typeof source.promo_text === 'string' ? source.promo_text : '',
    bannerUrl: typeof source.banner_url === 'string' ? source.banner_url : '',
  };
}

export function buildPersonalPayload(form: PersonalCampaignForm): Record<string, unknown> {
  return {
    name: form.name.trim(),
    campaign_type: 'personal',
    is_active: form.status === 'active',
    priority: Number(form.priority) || 100,
    weekly_limit: String(Number(form.budget) || 0),
    start_date: form.start || null,
    end_date: form.end || null,
    promo_text: form.promoText.trim(),
    banner_url: form.bannerUrl.trim(),
  };
}

export function parseCatalogPromotion(
  response: Record<string, unknown> | { ok?: boolean; campaign?: Campaign } | Campaign,
  fallbackId?: string,
  primaryOffer?: Offer | null,
): CatalogPromotionForm {
  const source = pickSource(response);
  const budgetRaw = source.weekly_limit;
  return {
    id: String(source.id ?? fallbackId ?? DEFAULT_CATALOG_FORM.id),
    name: String(source.name ?? DEFAULT_CATALOG_FORM.name),
    status: source.is_active ? 'active' : 'draft',
    start: typeof source.start_date === 'string' ? source.start_date : '',
    end: typeof source.end_date === 'string' ? source.end_date : '',
    budget: typeof budgetRaw === 'number' || typeof budgetRaw === 'string' ? String(budgetRaw) : '',
    categories: asArrayOfStrings(source.allowed_categories),
    productTypes: asArrayOfStrings(source.allowed_steps),
    brands: asArrayOfStrings(source.allowed_brands),
    productIds: asArrayOfNumbers(source.allowed_product_ids),
    offerType: primaryOffer?.offer_type ?? DEFAULT_CATALOG_FORM.offerType,
    offerValue: primaryOffer ? String(primaryOffer.value ?? '0') : DEFAULT_CATALOG_FORM.offerValue,
    targetScope: primaryOffer?.target_scope ?? DEFAULT_CATALOG_FORM.targetScope,
    minTotalSpend90d: primaryOffer ? String(primaryOffer.min_total_spend_90d ?? '0') : '0',
    promoText: typeof source.promo_text === 'string' ? source.promo_text : '',
    bannerUrl: typeof source.banner_url === 'string' ? source.banner_url : '',
  };
}

export function buildCatalogCampaignPayload(form: CatalogPromotionForm): Record<string, unknown> {
  const budgetNumber = form.budget.trim() ? Number(form.budget) || 0 : 0;
  return {
    name: form.name.trim(),
    campaign_type: 'public',
    is_active: form.status === 'active',
    priority: 100,
    weekly_limit: String(budgetNumber),
    start_date: form.start || null,
    end_date: form.end || null,
    allowed_categories: form.categories,
    allowed_steps: form.productTypes,
    allowed_brands: form.brands,
    allowed_product_ids: form.productIds,
    promo_text: form.promoText.trim(),
    banner_url: form.bannerUrl.trim(),
  };
}

export function buildCatalogOfferPayload(
  form: CatalogPromotionForm,
  campaignId: number,
): Record<string, unknown> {
  return {
    campaign: campaignId,
    name: form.name.trim() || 'Каталожная акция',
    offer_type: form.offerType,
    value: Number(form.offerValue) || 0,
    target_scope: form.targetScope,
    allowed_categories: form.categories,
    allowed_brands: form.brands,
    allowed_product_ids: form.productIds,
    allowed_product_types: form.productTypes,
    min_total_spend_90d: Number(form.minTotalSpend90d) || 0,
    estimated_cost: 0,
    cooldown_days: 0,
    expires_in_days: 7,
    is_active: form.status === 'active',
  };
}
