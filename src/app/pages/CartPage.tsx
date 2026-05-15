import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Trash2, Sparkles, ShoppingBag, ArrowRight, ChevronRight, TrendingUp, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '../../shared/api/ApiError';
import {
  getCart,
  type CartItem as ApiCartItem,
} from '../../shared/api/cart';
import { commit, preview, type AvailableOffer } from '../../shared/api/checkout';
import { getLoyalty } from '../../shared/api/me';
import { nextOffer } from '../../shared/api/offers';
import {
  getRoadmap,
  type RoadmapPlanApi,
  type RoadmapStepApi,
  type RoadmapStepSnapshotApi,
} from '../../shared/api/roadmap';
import { useCommerce } from '../../shared/commerce/CommerceContext';
import {
  formatCatalogCategoryLabel,
  formatCatalogFreeTextLabel,
  formatCatalogProductTypeLabel,
} from '../../shared/catalog/presentation';
import { useI18n } from '../../shared/i18n/LanguageContext';

/**
 * DEV NOTES:
 * Endpoints:
 * - GET /api/me/loyalty
 * - GET /api/me/next-offer
 * - POST /api/checkout/preview
 * - POST /api/checkout
 * Cart items загружаются из /api/me/cart.
 */

interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  quantity: number;
  image: string;
  pointsEarned: number;
  category?: string;
  productType?: string;
}

interface CheckoutTotals {
  subtotal: number;
  discount: number;
  giftCardApplied: number;
  giftCard?: {
    maskedCode: string;
    balanceBefore: number;
    balanceAfter: number;
  } | null;
  pointsRedeemed: number;
  total: number;
  pointsEarned: number;
  appliedOffer?: ActiveOffer | null;
}

type OfferSourceType = 'personal_system' | 'public_campaign';

interface ActiveOffer {
  assignmentId?: number;
  name: string;
  sourceType: OfferSourceType;
  campaignName?: string;
  type?: string;
  value?: number;
  scope?: string;
  targetValue?: string;
  targetCategory?: string;
  targetProductType?: string;
  targetProductId?: string;
  minBasketAmount?: number;
}

interface UpsellSuggestion {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}

type GiftCardMessageTone = 'success' | 'error' | 'info';

type CartLocationState = {
  giftCardCodeToApply?: string;
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&q=80';

const localeByLanguage = {
  ru: 'ru-RU',
  kk: 'kk-KZ',
  en: 'en-US',
} as const;

const tierLabels = {
  ru: { bronze: 'Бронза', silver: 'Серебро', gold: 'Золото' },
  kk: { bronze: 'Қола', silver: 'Күміс', gold: 'Алтын' },
  en: { bronze: 'Bronze', silver: 'Silver', gold: 'Gold' },
} as const;

const cartPageCopy = {
  ru: {
    breadcrumb: 'Корзина',
    title: 'Корзина',
    loading: 'Загружаем корзину...',
    retry: 'Повторить',
    emptyTitle: 'Корзина пуста',
    emptyDescription: 'Добавьте товары из рекомендаций или каталога',
    myRecommendations: 'Мои рекомендации',
    catalog: 'Каталог',
    offerBadge: 'ОФФЕР',
    loadingOffer: 'Загружаем персональный оффер...',
    giftCardTitle: 'Подарочная карта',
    giftCardHint: 'За один заказ можно применить один код.',
    remove: 'Убрать',
    apply: 'Применить',
    code: 'Код',
    balanceBefore: 'Баланс до',
    balanceAfter: 'Баланс после',
    redeemPoints: 'Списать баллы',
    available: (count: number) => `Доступно: ${count.toLocaleString(localeByLanguage.ru)}`,
    max: 'Макс.',
    willRedeem: (points: number) =>
      `Спишем: ${points.toLocaleString(localeByLanguage.ru)} баллов = ${points.toLocaleString(localeByLanguage.ru)} ₸`,
    products: 'Товары',
    discount: 'Скидка',
    giftCard: 'Подарочная карта',
    pointsRedeemed: 'Списано баллов',
    total: 'Итого',
    checkingOut: 'Оформляем...',
    checkout: 'Оформить заказ',
    afterPurchase: (points: number) => `После покупки начислим +${points} баллов`,
    pointsForPurchase: (points: number) => `+${points} баллов`,
    pointsPurchaseTitle: 'Баллы за эту покупку',
    pointsPurchaseAfter: 'Начислим после покупки',
    pointsNewBalance: 'Новый баланс',
    pointsCurrentTier: 'Текущий уровень',
    pointsTierHint: 'Уровень считается по сумме покупок за последние 90 дней, а не по балансу баллов.',
    cartQuantityError: 'Не удалось обновить количество в корзине.',
    cartRemoveError: 'Не удалось удалить товар из корзины.',
    cartLoadError: 'Не удалось загрузить корзину. Попробуйте еще раз.',
    loyaltyLoadError: 'Не удалось загрузить данные лояльности. Попробуйте еще раз.',
    giftCardApplyErrorDefault: 'Не удалось применить подарочную карту.',
    giftCardApplyErrorInvalid: 'Неверный код подарочной карты.',
    giftCardApplyErrorExpired: 'Срок действия подарочной карты истек.',
    giftCardApplyErrorEmpty: 'У этой подарочной карты уже нет остатка.',
    giftCardApplyErrorInactive: 'Эта подарочная карта больше недоступна.',
    giftCardApplyErrorRequired: 'Введите код подарочной карты.',
    giftCardProfileChecking: 'Подарочная карта добавлена из профиля. Проверяем код для текущей корзины...',
    giftCardProfilePending: 'Код подарочной карты подставлен. Добавьте товары в корзину, и карта применится автоматически.',
    giftCardMaskedFallback: 'подарочная карта',
    giftCardAppliedToOrder: 'Подарочная карта применена к этому заказу.',
    giftCardChecking: 'Проверяем подарочную карту...',
    checkoutError: 'Не удалось оформить заказ.',
    personalOfferTitleFallback: 'Персональный оффер',
    noPersonalOfferTitle: 'Сейчас персонального оффера нет',
    activeOfferDiscount: (value: number) => `${value}% скидка`,
    activeOfferPoints: (value: number) => `x${value} баллов`,
    offerSourceBadgeSystem: 'СИСТЕМА',
    offerSourceBadgeCampaign: 'АКЦИЯ',
    offerSystemTitle: (title: string) => `Оффер системы: ${title}`,
    offerCampaignTitle: (title: string) => `Акция: ${title}`,
    offerSystemSource: (campaignName?: string) =>
      campaignName ? `Подобрано системой: ${campaignName}.` : 'Подобрано системой по профилю и истории покупок.',
    offerCampaignSource: (campaignName?: string) =>
      campaignName ? `Промо-кампания: «${campaignName}».` : 'Публичная акция магазина.',
    offerAppearsLater: 'Когда для вас появится новый оффер, он автоматически отобразится здесь.',
    offerEstimatedBenefit: (value: number) => `Выгода по расчёту: ${value.toLocaleString(localeByLanguage.ru)} ₸`,
    offerMinimumBasket: (value: number) => `Оффер применится к корзине от ${value.toLocaleString(localeByLanguage.ru)} ₸.`,
    offerWholeCart: 'Оффер будет применён ко всей корзине при оформлении.',
    offerRoadmapScope: (value: string) => `Оффер связан с вашим следующим шагом roadmap: ${value}.`,
    offerProductScope: (value: string) => `Оффер действует на товар #${value}.`,
    offerCategoryScope: (value: string) => `Оффер действует на категорию «${value}».`,
    offerTypeScope: (value: string) => `Оффер действует на товары типа «${value}».`,
    offerMatchingProducts: 'Оффер будет применён к подходящим товарам.',
    upsellOfferProductTitle: 'Товар из персонального оффера',
    upsellOfferProductDescription: 'Добавьте этот товар в корзину, чтобы использовать текущий оффер при оформлении.',
    upsellWatchTitle: 'Следите за roadmap и персональными офферами',
    upsellWatchDescription: 'Когда появится следующий рекомендованный товар, он отобразится здесь.',
    nextRoadmapTitle: 'Следующий шаг roadmap',
    nextRoadmapDescription: 'Откройте roadmap, чтобы посмотреть следующий шаг вашей рутины.',
    recommendedForNextStep: (name: string) => `${name} рекомендован для следующего шага.`,
    open: 'Открыть',
    roadmapAction: 'Roadmap',
    productFallback: (id: string) => `Товар #${id}`,
  },
  kk: {
    breadcrumb: 'Себет',
    title: 'Себет',
    loading: 'Себетті жүктеп жатырмыз...',
    retry: 'Қайта көру',
    emptyTitle: 'Себет бос',
    emptyDescription: 'Ұсыныстардан немесе каталогтан тауар қосыңыз',
    myRecommendations: 'Менің ұсыныстарым',
    catalog: 'Каталог',
    offerBadge: 'ОФФЕР',
    loadingOffer: 'Жеке офферді жүктеп жатырмыз...',
    giftCardTitle: 'Сыйлық картасы',
    giftCardHint: 'Бір тапсырысқа бір код қана қолдануға болады.',
    remove: 'Өшіру',
    apply: 'Қолдану',
    code: 'Код',
    balanceBefore: 'Алдыңғы баланс',
    balanceAfter: 'Кейінгі баланс',
    redeemPoints: 'Ұпайларды шегеру',
    available: (count: number) => `Қолжетімді: ${count.toLocaleString(localeByLanguage.kk)}`,
    max: 'Макс.',
    willRedeem: (points: number) =>
      `Шегереміз: ${points.toLocaleString(localeByLanguage.kk)} ұпай = ${points.toLocaleString(localeByLanguage.kk)} ₸`,
    products: 'Тауарлар',
    discount: 'Жеңілдік',
    giftCard: 'Сыйлық картасы',
    pointsRedeemed: 'Шегерілген ұпайлар',
    total: 'Жалпы',
    checkingOut: 'Рәсімдеп жатырмыз...',
    checkout: 'Тапсырысты рәсімдеу',
    afterPurchase: (points: number) => `Сатып алғаннан кейін +${points} ұпай береміз`,
    pointsForPurchase: (points: number) => `+${points} ұпай`,
    pointsPurchaseTitle: 'Осы сатып алуға ұпай',
    pointsPurchaseAfter: 'Сатып алғаннан кейін есептеледі',
    pointsNewBalance: 'Жаңа баланс',
    pointsCurrentTier: 'Ағымдағы деңгей',
    pointsTierHint: 'Деңгей ұпай балансына емес, соңғы 90 күндегі сатып алу сомасына қарай есептеледі.',
    cartQuantityError: 'Себеттегі санды жаңарту мүмкін болмады.',
    cartRemoveError: 'Тауарды себеттен өшіру мүмкін болмады.',
    cartLoadError: 'Себетті жүктеу мүмкін болмады. Қайталап көріңіз.',
    loyaltyLoadError: 'Адалдық деректерін жүктеу мүмкін болмады. Қайталап көріңіз.',
    giftCardApplyErrorDefault: 'Сыйлық картасын қолдану мүмкін болмады.',
    giftCardApplyErrorInvalid: 'Сыйлық картасының коды қате.',
    giftCardApplyErrorExpired: 'Сыйлық картасының мерзімі өтіп кеткен.',
    giftCardApplyErrorEmpty: 'Бұл сыйлық картасында қалдық жоқ.',
    giftCardApplyErrorInactive: 'Бұл сыйлық картасы енді қолжетімсіз.',
    giftCardApplyErrorRequired: 'Сыйлық картасының кодын енгізіңіз.',
    giftCardProfileChecking: 'Сыйлық картасы профильден қосылды. Ағымдағы себет үшін кодты тексеріп жатырмыз...',
    giftCardProfilePending: 'Сыйлық картасының коды қойылды. Тауар қосыңыз, карта автоматты түрде қолданылады.',
    giftCardMaskedFallback: 'сыйлық картасы',
    giftCardAppliedToOrder: 'Сыйлық картасы осы тапсырысқа қолданылды.',
    giftCardChecking: 'Сыйлық картасын тексеріп жатырмыз...',
    checkoutError: 'Тапсырысты рәсімдеу мүмкін болмады.',
    personalOfferTitleFallback: 'Жеке оффер',
    noPersonalOfferTitle: 'Қазір жеке оффер жоқ',
    activeOfferDiscount: (value: number) => `${value}% жеңілдік`,
    activeOfferPoints: (value: number) => `x${value} ұпай`,
    offerSourceBadgeSystem: 'ЖҮЙЕ',
    offerSourceBadgeCampaign: 'АКЦИЯ',
    offerSystemTitle: (title: string) => `Жүйелік оффер: ${title}`,
    offerCampaignTitle: (title: string) => `Акция: ${title}`,
    offerSystemSource: (campaignName?: string) =>
      campaignName ? `Жүйе таңдаған: ${campaignName}.` : 'Жүйе профиль мен сатып алу тарихына қарап таңдады.',
    offerCampaignSource: (campaignName?: string) =>
      campaignName ? `Промо-науқан: «${campaignName}».` : 'Дүкеннің ашық акциясы.',
    offerAppearsLater: 'Сізге жаңа оффер пайда болғанда, ол автоматты түрде осында шығады.',
    offerEstimatedBenefit: (value: number) => `Есептік пайда: ${value.toLocaleString(localeByLanguage.kk)} ₸`,
    offerMinimumBasket: (value: number) => `Оффер ${value.toLocaleString(localeByLanguage.kk)} ₸ бастап себетке қолданылады.`,
    offerWholeCart: 'Оффер рәсімдеу кезінде бүкіл себетке қолданылады.',
    offerRoadmapScope: (value: string) => `Оффер roadmap-тағы келесі қадамыңызбен байланысты: ${value}.`,
    offerProductScope: (value: string) => `Оффер #${value} тауарына жарамды.`,
    offerCategoryScope: (value: string) => `Оффер «${value}» санатына жарамды.`,
    offerTypeScope: (value: string) => `Оффер «${value}» түріндегі тауарларға жарамды.`,
    offerMatchingProducts: 'Оффер сәйкес тауарларға қолданылады.',
    upsellOfferProductTitle: 'Жеке офферден тауар',
    upsellOfferProductDescription: 'Қазіргі офферді рәсімдеуде пайдалану үшін осы тауарды себетке қосыңыз.',
    upsellWatchTitle: 'Roadmap пен жеке офферлерді бақылаңыз',
    upsellWatchDescription: 'Келесі ұсынылған тауар пайда болғанда, ол осында көрсетіледі.',
    nextRoadmapTitle: 'Roadmap келесі қадамы',
    nextRoadmapDescription: 'Рутинаңыздың келесі қадамын көру үшін roadmap-ты ашыңыз.',
    recommendedForNextStep: (name: string) => `${name} келесі қадамға ұсынылған.`,
    open: 'Ашу',
    roadmapAction: 'Roadmap',
    productFallback: (id: string) => `Тауар #${id}`,
  },
  en: {
    breadcrumb: 'Cart',
    title: 'Cart',
    loading: 'Loading cart...',
    retry: 'Retry',
    emptyTitle: 'Your cart is empty',
    emptyDescription: 'Add products from recommendations or the catalog',
    myRecommendations: 'My recommendations',
    catalog: 'Catalog',
    offerBadge: 'OFFER',
    loadingOffer: 'Loading personal offer...',
    giftCardTitle: 'Gift card',
    giftCardHint: 'Only one code can be applied per order.',
    remove: 'Remove',
    apply: 'Apply',
    code: 'Code',
    balanceBefore: 'Balance before',
    balanceAfter: 'Balance after',
    redeemPoints: 'Redeem points',
    available: (count: number) => `Available: ${count.toLocaleString(localeByLanguage.en)}`,
    max: 'Max',
    willRedeem: (points: number) =>
      `We will redeem: ${points.toLocaleString(localeByLanguage.en)} points = ${points.toLocaleString(localeByLanguage.en)} ₸`,
    products: 'Products',
    discount: 'Discount',
    giftCard: 'Gift card',
    pointsRedeemed: 'Points redeemed',
    total: 'Total',
    checkingOut: 'Checking out...',
    checkout: 'Checkout',
    afterPurchase: (points: number) => `After purchase you will earn +${points} points`,
    pointsForPurchase: (points: number) => `+${points} points`,
    pointsPurchaseTitle: 'Points for this purchase',
    pointsPurchaseAfter: 'Will be credited after purchase',
    pointsNewBalance: 'New balance',
    pointsCurrentTier: 'Current tier',
    pointsTierHint: 'Tier is based on your purchase total over the last 90 days, not on the current points balance.',
    cartQuantityError: 'Could not update the quantity in your cart.',
    cartRemoveError: 'Could not remove the product from your cart.',
    cartLoadError: 'Could not load the cart. Please try again.',
    loyaltyLoadError: 'Could not load loyalty data. Please try again.',
    giftCardApplyErrorDefault: 'Could not apply the gift card.',
    giftCardApplyErrorInvalid: 'Invalid gift card code.',
    giftCardApplyErrorExpired: 'This gift card has expired.',
    giftCardApplyErrorEmpty: 'This gift card has no balance left.',
    giftCardApplyErrorInactive: 'This gift card is no longer available.',
    giftCardApplyErrorRequired: 'Enter a gift card code.',
    giftCardProfileChecking: 'The gift card was added from your profile. Checking the code for the current cart...',
    giftCardProfilePending: 'The gift card code has been inserted. Add products and the card will be applied automatically.',
    giftCardMaskedFallback: 'gift card',
    giftCardAppliedToOrder: 'The gift card was applied to this order.',
    giftCardChecking: 'Checking gift card...',
    checkoutError: 'Could not complete checkout.',
    personalOfferTitleFallback: 'Personal offer',
    noPersonalOfferTitle: 'There is no personal offer right now',
    activeOfferDiscount: (value: number) => `${value}% discount`,
    activeOfferPoints: (value: number) => `x${value} points`,
    offerSourceBadgeSystem: 'SYSTEM',
    offerSourceBadgeCampaign: 'PROMO',
    offerSystemTitle: (title: string) => `System offer: ${title}`,
    offerCampaignTitle: (title: string) => `Promotion: ${title}`,
    offerSystemSource: (campaignName?: string) =>
      campaignName ? `Selected by the system: ${campaignName}.` : 'Selected by the system from your profile and purchase history.',
    offerCampaignSource: (campaignName?: string) =>
      campaignName ? `Promo campaign: "${campaignName}".` : 'Public store promotion.',
    offerAppearsLater: 'When a new offer becomes available for you, it will appear here automatically.',
    offerEstimatedBenefit: (value: number) => `Estimated benefit: ${value.toLocaleString(localeByLanguage.en)} ₸`,
    offerMinimumBasket: (value: number) => `The offer will apply to carts from ${value.toLocaleString(localeByLanguage.en)} ₸.`,
    offerWholeCart: 'The offer will be applied to the whole cart during checkout.',
    offerRoadmapScope: (value: string) => `The offer is linked to your next roadmap step: ${value}.`,
    offerProductScope: (value: string) => `The offer applies to product #${value}.`,
    offerCategoryScope: (value: string) => `The offer applies to the "${value}" category.`,
    offerTypeScope: (value: string) => `The offer applies to "${value}" products.`,
    offerMatchingProducts: 'The offer will apply to matching products.',
    upsellOfferProductTitle: 'Product from your personal offer',
    upsellOfferProductDescription: 'Add this product to your cart to use the current offer at checkout.',
    upsellWatchTitle: 'Track roadmap and personal offers',
    upsellWatchDescription: 'When the next recommended product appears, it will show up here.',
    nextRoadmapTitle: 'Next roadmap step',
    nextRoadmapDescription: 'Open the roadmap to see the next step in your routine.',
    recommendedForNextStep: (name: string) => `${name} is recommended for the next step.`,
    open: 'Open',
    roadmapAction: 'Roadmap',
    productFallback: (id: string) => `Product #${id}`,
  },
} as const;

type CartPageLanguage = keyof typeof cartPageCopy;
type CartCopy = (typeof cartPageCopy)[CartPageLanguage];

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const firstString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
};

const formatLabel = (value: unknown): string | undefined => {
  return formatCatalogFreeTextLabel(value);
};

const formatTierName = (value: string, language: CartPageLanguage): string => {
  const normalizedValue = value.trim().toLowerCase();
  if (!normalizedValue) {
    return tierLabels[language].bronze;
  }
  if (
    normalizedValue === 'bronze' ||
    normalizedValue === 'silver' ||
    normalizedValue === 'gold'
  ) {
    return tierLabels[language][normalizedValue];
  }
  return tierLabels[language].gold;
};

const formatMoney = (value: number, language: CartPageLanguage): string =>
  `${Math.round(value).toLocaleString(localeByLanguage[language])} ₸`;

const normalizeGiftCardErrorMessage = (message: string, copy: CartCopy): string => {
  const normalized = message.trim();
  const lower = normalized.toLowerCase();

  if (!normalized) {
    return copy.giftCardApplyErrorDefault;
  }
  if (lower.includes('not found') || lower.includes('invalid')) {
    return copy.giftCardApplyErrorInvalid;
  }
  if (lower.includes('expired')) {
    return copy.giftCardApplyErrorExpired;
  }
  if (lower.includes('balance is empty') || lower.includes('empty')) {
    return copy.giftCardApplyErrorEmpty;
  }
  if (lower.includes('no longer active')) {
    return copy.giftCardApplyErrorInactive;
  }
  if (lower.includes('required')) {
    return copy.giftCardApplyErrorRequired;
  }

  return normalized;
};

const parseActiveOffer = (value: unknown, fallbackName: string): ActiveOffer | null => {
  if (!isRecord(value) || !isRecord(value.offer)) {
    return null;
  }

  const offerData = value.offer;
  const targetData = isRecord(value.target) ? value.target : null;
  const campaignData = isRecord(value.campaign) ? value.campaign : null;
  const assignmentId = toNumber(value.assignment_id);
  const source = firstString(value.source);
  const campaignType = firstString(campaignData?.type, value.campaign_type);
  const isPublicCampaign =
    value.public_campaign === true || source === 'public_campaign' || campaignType === 'public';
  const targetValue =
    targetData && (typeof targetData.value === 'number' || typeof targetData.value === 'string')
      ? String(targetData.value)
      : undefined;
  const scope = targetData && typeof targetData.scope === 'string' ? targetData.scope : undefined;

  return {
    assignmentId: assignmentId !== undefined ? Math.round(assignmentId) : undefined,
    name: (typeof offerData.name === 'string' && offerData.name.trim()) || fallbackName,
    sourceType: isPublicCampaign ? 'public_campaign' : 'personal_system',
    campaignName: firstString(campaignData?.name, value.campaign_name),
    type: typeof offerData.type === 'string' ? offerData.type : undefined,
    value: toNumber(offerData.value),
    scope,
    targetValue,
    targetCategory: targetData && typeof targetData.category === 'string' ? targetData.category : undefined,
    targetProductType:
      targetData && typeof targetData.product_type === 'string' ? targetData.product_type : undefined,
    targetProductId: scope === 'product_id' ? targetValue : undefined,
    minBasketAmount: targetData ? toNumber(targetData.min_basket_amount) : undefined,
  };
};

const isCompletedRoadmapStatus = (value: unknown): boolean =>
  value === 'completed' || value === 'owned' || value === 'skipped';

const pickRoadmapNextStep = (
  plan: RoadmapPlanApi | null,
): RoadmapStepApi | RoadmapStepSnapshotApi | null => {
  if (!plan) {
    return null;
  }

  const steps = Array.isArray(plan.steps)
    ? plan.steps.filter((step): step is RoadmapStepApi => isRecord(step))
    : [];
  const summary = isRecord(plan.summary) ? plan.summary : null;
  const summaryNextStep = summary && isRecord(summary.next_step)
    ? (summary.next_step as RoadmapStepSnapshotApi)
    : null;

  const nextStepId =
    typeof summaryNextStep?.id === 'number'
      ? summaryNextStep.id
      : typeof summaryNextStep?.step_id === 'number'
        ? summaryNextStep.step_id
        : undefined;
  const nextStepIndex = toNumber(summaryNextStep?.step_index);

  if (steps.length > 0 && (nextStepId !== undefined || nextStepIndex !== undefined)) {
    const matchedStep = steps.find((step) =>
      (nextStepId !== undefined && (step.id === nextStepId || step.step_id === nextStepId)) ||
      (nextStepId === undefined && nextStepIndex !== undefined && step.step_index === nextStepIndex),
    );

    if (matchedStep) {
      return matchedStep;
    }
  }

  if (summaryNextStep) {
    return summaryNextStep;
  }

  return (
    steps.find((step) => !isCompletedRoadmapStatus(step.status)) ??
    null
  );
};

const buildRoadmapUpsell = (
  plan: RoadmapPlanApi | null,
  language: CartPageLanguage,
  copy: CartCopy,
): UpsellSuggestion | null => {
  const nextStep = pickRoadmapNextStep(plan);
  if (!nextStep) {
    return null;
  }

  const title =
    firstString(nextStep.title, formatCatalogProductTypeLabel(nextStep.product_type, language)) ??
    copy.nextRoadmapTitle;
  const description =
    firstString(nextStep.description) ??
    copy.nextRoadmapDescription;

  if (!isRecord(nextStep.recommended_product)) {
    return {
      title,
      description,
      actionHref: '/me/roadmap',
      actionLabel: copy.roadmapAction,
    };
  }

  const product = nextStep.recommended_product;
  const productId =
    typeof product.id === 'number' || typeof product.id === 'string'
      ? String(product.id)
      : undefined;
  const price = toNumber(product.price);
  const productName = firstString(product.name);
  const productDescription = productName && price !== undefined
    ? `${productName} • ${formatMoney(price, language)}`
    : productName
      ? copy.recommendedForNextStep(productName)
      : description;

  return {
    title,
    description: productDescription,
    actionHref: productId ? `/product/${productId}` : '/me/roadmap',
    actionLabel: productId ? copy.open : copy.roadmapAction,
  };
};

const mapApiCartItem = (
  item: ApiCartItem,
  index: number,
  fallbackProductLabel: (id: string) => string,
): CartItem => {
  const product =
    item && typeof item.product === 'object' && item.product !== null
      ? (item.product as Record<string, unknown>)
      : {};
  const productId = product.id;
  const id =
    (typeof productId === 'number' || typeof productId === 'string')
      ? String(productId)
      : `cart-${index}`;

  const imageUrls = Array.isArray(product.image_urls)
    ? product.image_urls.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    : [];

  const price = Math.max(0, Math.round(toNumber(product.price) ?? 0));
  const originalPriceRaw = toNumber(product.original_price ?? product.originalPrice);
  const originalPrice =
    originalPriceRaw !== undefined && originalPriceRaw > price
      ? Math.max(0, Math.round(originalPriceRaw))
      : undefined;
  const discountRaw = toNumber(product.discount);
  const discount =
    discountRaw !== undefined && discountRaw > 0
      ? Math.max(1, Math.round(discountRaw))
      : originalPrice
        ? Math.max(1, Math.round(((originalPrice - price) / originalPrice) * 100))
        : undefined;

  return {
    id,
    name:
      (typeof product.name === 'string' && product.name.trim()) ||
      fallbackProductLabel(id),
    brand:
      (typeof product.brand === 'string' && product.brand.trim()) ||
      'Uilesim',
    price,
    originalPrice,
    discount,
    quantity: Math.max(1, Math.round(toNumber(item.quantity) ?? 1)),
    image:
      (typeof product.image_url === 'string' && product.image_url) ||
      imageUrls[0] ||
      FALLBACK_IMAGE,
    pointsEarned: Math.max(0, Math.round(toNumber(product.points_earned) ?? 0)),
    category: typeof product.category === 'string' ? product.category : undefined,
    productType: typeof product.product_type === 'string' ? product.product_type : undefined,
  };
};

const createIdempotencyKey = (): string => {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `cart-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

type OfferChoice =
  | { kind: 'auto' }
  | { kind: 'personal'; assignmentId: number }
  | { kind: 'public'; publicOfferId: number };

type AvailableOfferSummary = {
  key: string;
  kind: 'personal' | 'public';
  assignmentId: number | null;
  publicOfferId: number | null;
  publicCampaignId: number | null;
  discountAmount: number;
  offer: ActiveOffer;
};

const parseAvailableOffers = (
  value: unknown,
  fallbackName: string,
): AvailableOfferSummary[] => {
  if (!Array.isArray(value)) return [];

  const out: AvailableOfferSummary[] = [];
  value.forEach((entry, index) => {
    if (!isRecord(entry)) return;
    const kindRaw = entry.kind;
    const kind: 'personal' | 'public' | null =
      kindRaw === 'personal' ? 'personal' : kindRaw === 'public' ? 'public' : null;
    if (!kind) return;

    const offerPayload = entry.offer_payload ?? entry;
    const parsed = parseActiveOffer(offerPayload, fallbackName);
    if (!parsed) return;

    const assignmentId = toNumber(entry.assignment_id);
    const publicOfferId = toNumber(entry.public_offer_id);
    const publicCampaignId = toNumber(entry.public_campaign_id);
    const discount = toNumber(entry.discount_amount) ?? 0;

    const idForKey =
      kind === 'personal'
        ? assignmentId !== undefined
          ? `p-${Math.round(assignmentId)}`
          : `p-idx-${index}`
        : publicOfferId !== undefined
          ? `c-${Math.round(publicOfferId)}`
          : `c-idx-${index}`;

    out.push({
      key: idForKey,
      kind,
      assignmentId: assignmentId !== undefined ? Math.round(assignmentId) : null,
      publicOfferId: publicOfferId !== undefined ? Math.round(publicOfferId) : null,
      publicCampaignId: publicCampaignId !== undefined ? Math.round(publicCampaignId) : null,
      discountAmount: Math.max(0, Math.round(discount)),
      offer: parsed,
    });
  });
  return out;
};

const offerChoiceKey = (
  choice: OfferChoice,
  options: AvailableOfferSummary[],
): string | null => {
  if (choice.kind === 'personal') {
    const found = options.find((o) => o.kind === 'personal' && o.assignmentId === choice.assignmentId);
    return found?.key ?? null;
  }
  if (choice.kind === 'public') {
    const found = options.find((o) => o.kind === 'public' && o.publicOfferId === choice.publicOfferId);
    return found?.key ?? null;
  }
  // auto: the first option is the best (backend orders by discount desc)
  return options[0]?.key ?? null;
};


export default function CartPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh, removeFromCart, setCartQuantity } = useCommerce();
  const { language, messages } = useI18n();
  const copy = cartPageCopy[language];
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [cartError, setCartError] = useState<string | null>(null);
  const [cartRetryKey, setCartRetryKey] = useState(0);
  const [pendingCartActionId, setPendingCartActionId] = useState<string | null>(null);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [previewTotals, setPreviewTotals] = useState<CheckoutTotals | null>(null);
  const [giftCardCodeInput, setGiftCardCodeInput] = useState('');
  const [appliedGiftCardCode, setAppliedGiftCardCode] = useState<string | null>(null);
  const [giftCardMessage, setGiftCardMessage] = useState<string | null>(null);
  const [giftCardMessageTone, setGiftCardMessageTone] = useState<GiftCardMessageTone | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [availablePoints, setAvailablePoints] = useState(1247);
  const [currentTier, setCurrentTier] = useState('gold');
  const [activeOffer, setActiveOffer] = useState<ActiveOffer | null>(null);
  const [availableOffers, setAvailableOffers] = useState<AvailableOfferSummary[]>([]);
  const [offerChoice, setOfferChoice] = useState<OfferChoice>({ kind: 'auto' });
  const [roadmapPlan, setRoadmapPlan] = useState<RoadmapPlanApi | null>(null);
  const [isMetaLoading, setIsMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [metaRetryKey, setMetaRetryKey] = useState(0);
  const pendingGiftCardCodeFromProfile =
    isRecord(location.state) && typeof (location.state as CartLocationState).giftCardCodeToApply === 'string'
      ? (location.state as CartLocationState).giftCardCodeToApply!.trim()
      : '';

  const updateQuantity = async (id: string, newQty: number) => {
    const productId = Number(id);
    if (!Number.isFinite(productId)) {
      return;
    }

    if (newQty <= 0) {
      await removeItem(id);
      return;
    }

    setPendingCartActionId(id);
    try {
      const quantity = await setCartQuantity(productId, newQty);

      setCartItems((items) =>
        items.map((item) => (item.id === id ? { ...item, quantity } : item)),
      );
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }
      toast.error(copy.cartQuantityError);
    } finally {
      setPendingCartActionId(null);
    }
  };

  const removeItem = async (id: string) => {
    const productId = Number(id);
    if (!Number.isFinite(productId)) {
      return;
    }

    setPendingCartActionId(id);
    try {
      await removeFromCart(productId);
      setCartItems((items) => items.filter((item) => item.id !== id));
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }
      toast.error(copy.cartRemoveError);
    } finally {
      setPendingCartActionId(null);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = 0;
  const pointsRedeemed = Math.min(pointsToUse, Math.max(0, Math.floor(subtotal - discount)));
  const total = Math.max(0, subtotal - discount - pointsRedeemed);
  const totalPointsEarned = cartItems.reduce((sum, item) => sum + item.pointsEarned * item.quantity, 0);

  const summarySubtotal = previewTotals?.subtotal ?? subtotal;
  const summaryDiscount = previewTotals?.discount ?? discount;
  const summaryGiftCardApplied = previewTotals?.giftCardApplied ?? 0;
  const summaryPointsRedeemed = previewTotals?.pointsRedeemed ?? pointsRedeemed;
  const summaryTotal = previewTotals?.total ?? total;
  const summaryPointsEarned = previewTotals?.pointsEarned ?? totalPointsEarned;
  const maxRedeemablePoints = Math.max(
    0,
    Math.floor(summarySubtotal - summaryDiscount - summaryGiftCardApplied),
  );

  useEffect(() => {
    let cancelled = false;

    const loadCart = async () => {
      setIsCartLoading(true);
      setCartError(null);

      try {
        const response = await getCart();
        const items = Array.isArray(response.items) ? response.items : [];
        const mapped = items.map((item, index) =>
          mapApiCartItem(item, index, copy.productFallback),
        );
        if (!cancelled) {
          setCartItems(mapped);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        setCartItems([]);
        setCartError(copy.cartLoadError);
      } finally {
        if (!cancelled) {
          setIsCartLoading(false);
        }
      }
    };

    loadCart();

    return () => {
      cancelled = true;
    };
  }, [cartRetryKey, copy.cartLoadError, copy.productFallback, location.pathname, navigate]);

  useEffect(() => {
    let cancelled = false;

    const loadSidebarMeta = async () => {
      setIsMetaLoading(true);
      setMetaError(null);

      const [loyaltyResult, offerResult, roadmapResult] = await Promise.allSettled([
        getLoyalty(),
        nextOffer(),
        getRoadmap(),
      ]);

      if (cancelled) {
        return;
      }

      if (loyaltyResult.status === 'rejected') {
        const loyaltyError = loyaltyResult.reason;
        if (loyaltyError instanceof ApiError && (loyaltyError.status === 401 || loyaltyError.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }
      } else {
        const points = toNumber(loyaltyResult.value.points_balance);
        if (points !== undefined) {
          setAvailablePoints(Math.max(0, Math.round(points)));
        }

        if (typeof loyaltyResult.value.tier === 'string' && loyaltyResult.value.tier) {
          setCurrentTier(loyaltyResult.value.tier.toLowerCase());
        }
      }

      if (offerResult.status === 'rejected') {
        const offerError = offerResult.reason;
        if (offerError instanceof ApiError && (offerError.status === 401 || offerError.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }
      } else {
        setActiveOffer(parseActiveOffer(offerResult.value, copy.personalOfferTitleFallback));
      }

      if (roadmapResult.status === 'rejected') {
        const roadmapError = roadmapResult.reason;
        if (roadmapError instanceof ApiError && (roadmapError.status === 401 || roadmapError.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }
        setRoadmapPlan(null);
      } else {
        setRoadmapPlan(roadmapResult.value);
      }

      if (loyaltyResult.status === 'rejected' && offerResult.status === 'rejected' && roadmapResult.status === 'rejected') {
        setMetaError(copy.loyaltyLoadError);
      }

      setIsMetaLoading(false);
    };

    loadSidebarMeta().catch(() => {
      if (!cancelled) {
        setMetaError(copy.loyaltyLoadError);
        setIsMetaLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [copy.loyaltyLoadError, copy.personalOfferTitleFallback, location.pathname, metaRetryKey, navigate]);

  useEffect(() => {
    setPointsToUse((value) => Math.min(value, availablePoints, maxRedeemablePoints));
  }, [availablePoints, maxRedeemablePoints]);

  useEffect(() => {
    if (isCartLoading || !pendingGiftCardCodeFromProfile) {
      return;
    }

    setGiftCardCodeInput(pendingGiftCardCodeFromProfile);
    setAppliedGiftCardCode(pendingGiftCardCodeFromProfile);
    setGiftCardMessage(
      cartItems.length > 0
        ? copy.giftCardProfileChecking
        : copy.giftCardProfilePending,
    );
    setGiftCardMessageTone('info');

    navigate(location.pathname, { replace: true, state: null });
  }, [cartItems.length, copy.giftCardProfileChecking, copy.giftCardProfilePending, isCartLoading, location.pathname, navigate, pendingGiftCardCodeFromProfile]);

  const buildCheckoutItems = () =>
    cartItems
      .map((item) => ({
        product: Number(item.id),
        quantity: item.quantity,
      }))
      .filter((item) => Number.isFinite(item.product) && item.quantity > 0);

  const buildCheckoutPayload = () => ({
    channel: 'online',
    items: buildCheckoutItems(),
    apply_assignment_id: offerChoice.kind === 'personal' ? offerChoice.assignmentId : undefined,
    apply_public_offer_id: offerChoice.kind === 'public' ? offerChoice.publicOfferId : undefined,
    gift_card_code: appliedGiftCardCode ?? undefined,
    redeem_points: pointsToUse > 0 ? pointsToUse : undefined,
  });

  useEffect(() => {
    if (cartItems.length === 0) {
      setPreviewTotals(null);
      return;
    }

    let cancelled = false;

    const loadPreview = async () => {
      const payload = buildCheckoutPayload();
      if (payload.items.length === 0) {
        setPreviewTotals(null);
        return;
      }

      try {
        const response: any = await preview(payload);

        if (cancelled) {
          return;
        }

        const gross = toNumber(response.gross_total) ?? toNumber(response.subtotal) ?? subtotal;
        const appliedDiscount = toNumber(response.discount_amount) ?? toNumber(response.discount) ?? discount;
        const giftCard = isRecord(response.gift_card) ? response.gift_card : null;
        const giftCardApplied = toNumber(giftCard?.applied_amount) ?? 0;
        const usedPoints = toNumber(response.points_redeemed) ?? pointsToUse;
        const net = toNumber(response.net_total) ?? total;
        const earned =
          toNumber(response.estimated_points_earned) ??
          toNumber(response.points_earned) ??
          totalPointsEarned;
        const appliedOffer = parseActiveOffer(response.applied_offer, copy.personalOfferTitleFallback);
        const parsedAvailable = parseAvailableOffers(response.available_offers, copy.personalOfferTitleFallback);
        setAvailableOffers(parsedAvailable);

        // If the current explicit choice is no longer in the available list (e.g. cart changed),
        // fall back to auto-pick so the UI doesn't get stuck on an inapplicable selection.
        if (offerChoice.kind === 'personal') {
          const stillAvailable = parsedAvailable.some(
            (o) => o.kind === 'personal' && o.assignmentId === offerChoice.assignmentId,
          );
          if (!stillAvailable) setOfferChoice({ kind: 'auto' });
        } else if (offerChoice.kind === 'public') {
          const stillAvailable = parsedAvailable.some(
            (o) => o.kind === 'public' && o.publicOfferId === offerChoice.publicOfferId,
          );
          if (!stillAvailable) setOfferChoice({ kind: 'auto' });
        }

        setPreviewTotals({
          subtotal: Math.max(0, Math.round(gross)),
          discount: Math.max(0, Math.round(appliedDiscount)),
          giftCardApplied: Math.max(0, Math.round(giftCardApplied)),
          giftCard: giftCard
            ? {
                maskedCode:
                  typeof giftCard.masked_code === 'string' ? giftCard.masked_code : copy.giftCardMaskedFallback,
                balanceBefore: Math.max(0, Math.round(toNumber(giftCard.balance_before) ?? 0)),
                balanceAfter: Math.max(0, Math.round(toNumber(giftCard.balance_after) ?? 0)),
              }
            : null,
          pointsRedeemed: Math.max(0, Math.round(usedPoints)),
          total: Math.max(0, Math.round(net)),
          pointsEarned: Math.max(0, Math.round(earned)),
          appliedOffer,
        });
        if (giftCard) {
          setGiftCardMessage(copy.giftCardAppliedToOrder);
          setGiftCardMessageTone('success');
        } else if (!appliedGiftCardCode && giftCardMessageTone !== 'error') {
          setGiftCardMessage(null);
          setGiftCardMessageTone(null);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        if (
          error instanceof ApiError &&
          error.status === 400 &&
          appliedGiftCardCode &&
          /gift card/i.test(error.message)
        ) {
          setGiftCardMessage(normalizeGiftCardErrorMessage(error.message, copy));
          setGiftCardMessageTone('error');
          setAppliedGiftCardCode(null);
          return;
        }

        setPreviewTotals(null);
      }
    };

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, [appliedGiftCardCode, cartItems, copy, discount, giftCardMessageTone, location.pathname, navigate, offerChoice, pointsToUse, subtotal, total, totalPointsEarned]);

  const handleApplyGiftCard = () => {
    const trimmedCode = giftCardCodeInput.trim().toUpperCase();
    if (!trimmedCode) {
      setGiftCardMessage(copy.giftCardApplyErrorRequired);
      setGiftCardMessageTone('error');
      return;
    }
    setGiftCardCodeInput(trimmedCode);
    setGiftCardMessage(copy.giftCardChecking);
    setGiftCardMessageTone('info');
    setAppliedGiftCardCode(trimmedCode);
  };

  const handleRemoveGiftCard = () => {
    setAppliedGiftCardCode(null);
    setGiftCardCodeInput('');
    setGiftCardMessage(null);
    setGiftCardMessageTone(null);
  };

  const handleCheckout = async () => {
    const payload = buildCheckoutPayload();
    if (payload.items.length === 0 || isCheckingOut) {
      return;
    }

    setIsCheckingOut(true);

    try {
      const checkoutResponse: any = await commit({
        ...payload,
        idempotency_key: createIdempotencyKey(),
      });

      try {
        await refresh();
      } catch {
        // Do not turn a successful commit into a failed purchase because of a badge/cart refresh miss.
      }
      setCartItems([]);
      setPreviewTotals(null);
      setPointsToUse(0);
      setAppliedGiftCardCode(null);
      setGiftCardCodeInput('');
      setGiftCardMessage(null);
      setGiftCardMessageTone(null);

      navigate('/checkout', {
        state: {
          checkoutCommit: checkoutResponse,
          items: payload.items,
        },
      });
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(copy.checkoutError);
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  const fallbackOfferTitle = copy.personalOfferTitleFallback;
  const roadmapUpsell = buildRoadmapUpsell(roadmapPlan, language, copy);
  // Only show offers that the backend actually applied to the current cart.
  // If a user has a personal next-offer but it doesn't fit the cart, we surface
  // a soft notice below instead of pretending it's active.
  const displayedOffer = previewTotals?.appliedOffer ?? null;
  const displayedOfferApplicable = Boolean(previewTotals?.appliedOffer);
  const hasAvailableAlternatives = availableOffers.length >= 2;
  const activeChoiceKey = offerChoiceKey(offerChoice, availableOffers);
  const inapplicableActiveOffer =
    !displayedOffer && activeOffer && availableOffers.length === 0 ? activeOffer : null;
  const offerSourceBadge = displayedOffer?.sourceType === 'public_campaign'
    ? copy.offerSourceBadgeCampaign
    : copy.offerSourceBadgeSystem;
  const offerSourceBadgeClass = displayedOffer?.sourceType === 'public_campaign'
    ? 'border-[#A7F3D0] bg-[#D1FAE5] text-[#047857]'
    : 'border-[#C7D2FE] bg-[#EEF2FF] text-[#4338CA]';
  const offerSourceText = displayedOffer
    ? displayedOffer.sourceType === 'public_campaign'
      ? copy.offerCampaignSource(displayedOffer.campaignName)
      : copy.offerSystemSource(displayedOffer.campaignName)
    : undefined;
  const offerScopedLabel =
    (displayedOffer?.targetCategory
      ? formatCatalogCategoryLabel(displayedOffer.targetCategory, language) ??
        messages.catalog.categories[
          displayedOffer.targetCategory as keyof typeof messages.catalog.categories
        ] ??
        formatLabel(displayedOffer.targetCategory)
      : undefined) ??
    formatCatalogProductTypeLabel(displayedOffer?.targetProductType, language) ??
    formatLabel(displayedOffer?.targetProductType);
  const offerBaseTitle =
    !displayedOffer
      ? copy.noPersonalOfferTitle
      : displayedOffer.type === 'discount' && displayedOffer.value !== undefined
        ? copy.activeOfferDiscount(displayedOffer.value)
        : displayedOffer.type === 'points_multiplier' && displayedOffer.value !== undefined
          ? copy.activeOfferPoints(displayedOffer.value)
          : displayedOffer.name || fallbackOfferTitle;
  const offerTitle =
    !displayedOffer
      ? copy.noPersonalOfferTitle
      : displayedOffer.sourceType === 'public_campaign'
        ? copy.offerCampaignTitle(offerBaseTitle)
        : copy.offerSystemTitle(offerBaseTitle);

  const offerDescription =
    !displayedOffer
      ? copy.offerAppearsLater
      : summaryDiscount > 0 && displayedOfferApplicable
      ? copy.offerEstimatedBenefit(summaryDiscount)
      : displayedOffer.scope === 'cart' && displayedOffer.minBasketAmount !== undefined
        ? copy.offerMinimumBasket(displayedOffer.minBasketAmount)
        : displayedOffer.scope === 'cart'
          ? copy.offerWholeCart
          : displayedOffer.scope === 'product_id' && roadmapUpsell
            ? copy.offerRoadmapScope(roadmapUpsell.title)
            : displayedOffer.scope === 'product_id' && displayedOffer.targetValue
              ? copy.offerProductScope(displayedOffer.targetValue)
              : displayedOffer.scope === 'category' && offerScopedLabel
                ? copy.offerCategoryScope(offerScopedLabel)
                : displayedOffer.scope === 'product_type' && offerScopedLabel
                  ? copy.offerTypeScope(offerScopedLabel)
                  : copy.offerMatchingProducts;

  const upsellSuggestion: UpsellSuggestion =
    roadmapUpsell ??
    (activeOffer?.targetProductId
      ? {
          title: activeOffer.name || copy.upsellOfferProductTitle,
          description: copy.upsellOfferProductDescription,
          actionHref: `/product/${activeOffer.targetProductId}`,
          actionLabel: copy.open,
        }
      : {
          title: copy.upsellWatchTitle,
          description: copy.upsellWatchDescription,
          actionHref: '/me/roadmap',
          actionLabel: copy.roadmapAction,
        });

  return (
    <div className="page-with-navbar-offset min-h-screen bg-gray-50">
      <div className="app-page-container py-6 lg:py-8">
        <div className="mb-4">
          <Breadcrumbs items={[{ label: messages.common.home, href: '/' }, { label: copy.breadcrumb }]} />
        </div>

        <h1 className="text-2xl font-semibold text-[#111827] mb-5">{copy.title}</h1>

        {isCartLoading ? (
          <div className="py-16">
            <LoadingSpinner size="lg" text={copy.loading} />
          </div>
        ) : cartError ? (
          <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-6">
            <p className="text-sm text-[#B42318]">{cartError}</p>
            <button
              onClick={() => setCartRetryKey((value) => value + 1)}
              className="mt-3 text-sm font-medium text-[#111827] underline underline-offset-2"
            >
              {copy.retry}
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-[#6B7280]" />
            </div>
            <p className="text-[#6B7280] mb-2 font-medium">{copy.emptyTitle}</p>
            <p className="text-sm text-[#6B7280] mb-6">{copy.emptyDescription}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="primary" onClick={() => navigate('/for-you')}>
                <Sparkles className="w-4 h-4 mr-2" />
                {copy.myRecommendations}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/catalog')}>
                {copy.catalog}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">

            {/* ── Left: Cart items ── */}
            <div className="space-y-2">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-3 p-3 rounded-2xl bg-white border border-[#EAE6EF] hover:border-[#ddd6e7] transition-colors">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-[#6B7280]">{item.brand}</p>
                    <h3 className="text-sm font-semibold text-[#111827] line-clamp-1 leading-snug mt-0.5">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {item.originalPrice ? (
                        <span className="text-xs text-[#9CA3AF] line-through">
                          {formatMoney(item.originalPrice, language)}
                        </span>
                      ) : null}
                      <span className="text-sm font-bold text-[#111827]">{formatMoney(item.price, language)}</span>
                      {item.discount ? (
                        <span className="rounded-full bg-[#FFE1F2] px-1.5 py-0.5 text-[10px] font-semibold text-[#B83280]">
                          -{item.discount}%
                        </span>
                      ) : null}
                      <span className="text-[10px] text-[#FF4DB8] flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        {copy.pointsForPurchase(item.pointsEarned * item.quantity)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center h-8 rounded-lg border-2 border-brand-pink-500 overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={pendingCartActionId === item.id}
                        className="w-8 h-full flex items-center justify-center text-brand-pink-500 hover:bg-[#FFE1F2] transition-colors disabled:opacity-50"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold text-brand-pink-500">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={pendingCartActionId === item.id}
                        className="w-8 h-full flex items-center justify-center text-brand-pink-500 hover:bg-[#FFE1F2] transition-colors disabled:opacity-50"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={pendingCartActionId === item.id}
                      className="w-7 h-7 flex items-center justify-center text-[#D1D5DB] hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Upsell nudge */}
              <button
                onClick={() => navigate(upsellSuggestion.actionHref)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white border border-dashed border-[#EAE6EF] hover:border-[#FF4DB8]/40 hover:bg-[#FFFAFC] transition-all group text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-[#FFE1F2] flex items-center justify-center flex-shrink-0 transition-colors">
                  <TrendingUp className="w-4 h-4 text-[#6B7280] group-hover:text-[#FF4DB8] transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#111827]">{upsellSuggestion.title}</p>
                  <p className="text-xs text-[#6B7280] truncate">{upsellSuggestion.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#FF4DB8] flex-shrink-0 transition-colors" />
              </button>
            </div>

            {/* ── Right: Unified summary card ── */}
            <div className="rounded-2xl bg-white border border-[#EAE6EF] overflow-hidden sticky top-4">

              {/* Offer banner */}
              {(isMetaLoading || displayedOffer || metaError || inapplicableActiveOffer) && (
                <div className="border-b border-[#FDDCEF] bg-[#FFF0F8]">
                  <div className="px-4 py-3 flex items-start gap-2">
                    <span className={`mt-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border tracking-wide flex-shrink-0 ${displayedOffer ? offerSourceBadgeClass : 'border-[#FDDCEF] bg-[#FF4DB8] text-white'}`}>
                      {displayedOffer ? offerSourceBadge : copy.offerBadge}
                    </span>
                    {isMetaLoading ? (
                      <p className="text-xs text-[#9CA3AF]">{copy.loadingOffer}</p>
                    ) : metaError ? (
                      <div>
                        <p className="text-xs text-[#B42318]">{metaError}</p>
                        <button
                          onClick={() => setMetaRetryKey((v) => v + 1)}
                          className="text-[11px] font-medium text-[#111827] underline underline-offset-2 mt-1"
                        >
                          {copy.retry}
                        </button>
                      </div>
                    ) : displayedOffer ? (
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#111827]">{offerTitle}</p>
                        {offerSourceText && (
                          <p className="text-[11px] text-[#374151] mt-0.5">{offerSourceText}</p>
                        )}
                        <p className="text-[11px] text-[#6B7280] mt-0.5">{offerDescription}</p>
                      </div>
                    ) : inapplicableActiveOffer ? (
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#374151]">
                          {inapplicableActiveOffer.name || fallbackOfferTitle}
                        </p>
                        <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                          Оффер не подходит к товарам в этой корзине.
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {/* Alternative-offer chooser (only if 2+ applicable options) */}
                  {hasAvailableAlternatives && (
                    <div className="px-4 pb-3 pt-1 space-y-1.5 border-t border-[#FDDCEF]">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">
                        Выберите выгоду
                      </p>
                      {availableOffers.map((option) => {
                        const isActive = option.key === activeChoiceKey;
                        const isBest = option.key === availableOffers[0].key;
                        const optionLabel =
                          option.offer.type === 'discount' && option.offer.value !== undefined
                            ? copy.activeOfferDiscount(option.offer.value)
                            : option.offer.type === 'points_multiplier' && option.offer.value !== undefined
                              ? copy.activeOfferPoints(option.offer.value)
                              : option.offer.name || fallbackOfferTitle;
                        const sourceLabel = option.offer.sourceType === 'public_campaign'
                          ? copy.offerSourceBadgeCampaign
                          : copy.offerSourceBadgeSystem;
                        return (
                          <label
                            key={option.key}
                            className={`flex items-start gap-2 p-2 rounded-xl cursor-pointer border text-left transition-colors ${
                              isActive
                                ? 'border-[#FF4DB8] bg-white'
                                : 'border-transparent hover:bg-white/60'
                            }`}
                          >
                            <input
                              type="radio"
                              name="offer-choice"
                              checked={isActive}
                              onChange={() => {
                                if (option.kind === 'personal' && option.assignmentId !== null) {
                                  setOfferChoice({ kind: 'personal', assignmentId: option.assignmentId });
                                } else if (option.kind === 'public' && option.publicOfferId !== null) {
                                  setOfferChoice({ kind: 'public', publicOfferId: option.publicOfferId });
                                }
                              }}
                              className="mt-1 accent-[#FF4DB8]"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-semibold text-[#111827]">{optionLabel}</span>
                                <span className="text-[9px] font-bold uppercase tracking-wide text-[#6B7280]">
                                  {sourceLabel}
                                </span>
                                {isBest && (
                                  <span className="text-[9px] font-semibold uppercase tracking-wide text-[#FF4DB8]">
                                    Лучшая
                                  </span>
                                )}
                              </div>
                              {option.offer.campaignName && (
                                <p className="text-[11px] text-[#6B7280] truncate">{option.offer.campaignName}</p>
                              )}
                              <p className="text-[11px] text-[#374151] mt-0.5">
                                −{formatMoney(option.discountAmount, language)}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                      {offerChoice.kind !== 'auto' && (
                        <button
                          type="button"
                          onClick={() => setOfferChoice({ kind: 'auto' })}
                          className="text-[11px] text-[#6B7280] underline underline-offset-2 hover:text-[#111827]"
                        >
                          Выбрать автоматически
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 space-y-4">

                {/* Order total */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">{copy.products}</span>
                    <span className="font-medium text-[#111827]">{formatMoney(summarySubtotal, language)}</span>
                  </div>
                  {summaryDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">{copy.discount}</span>
                      <span className="font-semibold text-[#FF4DB8]">−{formatMoney(summaryDiscount, language)}</span>
                    </div>
                  )}
                  {summaryGiftCardApplied > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">
                        {copy.giftCard}{previewTotals?.giftCard?.maskedCode ? ` (${previewTotals.giftCard.maskedCode})` : ''}
                      </span>
                      <span className="font-semibold text-[#FF4DB8]">−{formatMoney(summaryGiftCardApplied, language)}</span>
                    </div>
                  )}
                  {summaryPointsRedeemed > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">{copy.pointsRedeemed}</span>
                      <span className="font-semibold text-[#FF4DB8]">−{formatMoney(summaryPointsRedeemed, language)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline pt-2.5 border-t border-[#EAE6EF]">
                    <span className="text-base font-bold text-[#111827]">{copy.total}</span>
                    <span className="text-2xl font-bold text-[#111827]">{formatMoney(Math.max(0, summaryTotal), language)}</span>
                  </div>
                </div>

                {/* Checkout button */}
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full h-11 rounded-xl bg-brand-pink-500 text-white font-semibold text-sm hover:bg-brand-pink-600 transition-all flex items-center justify-center gap-2 hover:shadow-md active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isCheckingOut ? copy.checkingOut : copy.checkout}
                  {!isCheckingOut && <ArrowRight className="w-4 h-4" />}
                </button>

                {/* Gift card */}
                <div className="border-t border-[#EAE6EF] pt-4 space-y-2">
                  <p className="text-xs font-semibold text-[#111827]">{copy.giftCardTitle}</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={giftCardCodeInput}
                      onChange={(e) => {
                        setGiftCardCodeInput(e.target.value);
                        if (!appliedGiftCardCode || giftCardMessageTone !== 'success') {
                          setGiftCardMessage(null);
                          setGiftCardMessageTone(null);
                        }
                      }}
                      placeholder="ABCD-WXYZ-EFGH-JKLM"
                      className="flex-1 min-w-0 px-3 py-1.5 rounded-xl border border-[#EAE6EF] text-xs uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20 focus:border-[#FF4DB8]/50"
                    />
                    {appliedGiftCardCode ? (
                      <button type="button" onClick={handleRemoveGiftCard}
                        className="text-xs text-[#6B7280] font-medium px-3 py-1.5 rounded-xl border border-[#EAE6EF] hover:bg-gray-50 transition-colors whitespace-nowrap">
                        {copy.remove}
                      </button>
                    ) : (
                      <button type="button" onClick={handleApplyGiftCard}
                        className="text-xs text-[#111827] font-semibold px-3 py-1.5 rounded-xl border border-[#EAE6EF] hover:bg-gray-50 transition-colors whitespace-nowrap">
                        {copy.apply}
                      </button>
                    )}
                  </div>
                  {giftCardMessage && (
                    <p className={`text-[11px] px-2.5 py-1.5 rounded-lg ${
                      giftCardMessageTone === 'success' ? 'bg-emerald-50 text-emerald-700'
                      : giftCardMessageTone === 'info' ? 'bg-gray-50 text-[#4B5563]'
                      : 'bg-[#FEF2F2] text-[#B42318]'
                    }`}>{giftCardMessage}</p>
                  )}
                  {previewTotals?.giftCard && (
                    <div className="text-xs text-[#6B7280] space-y-1 pt-1">
                      <div className="flex justify-between">
                        <span>{copy.balanceBefore}</span>
                        <span className="font-medium text-[#111827]">{formatMoney(previewTotals.giftCard.balanceBefore, language)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{copy.balanceAfter}</span>
                        <span className="font-medium text-[#111827]">{formatMoney(previewTotals.giftCard.balanceAfter, language)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Points */}
                <div className="border-t border-[#EAE6EF] pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF4DB8]" />
                      <span className="text-xs font-semibold text-[#111827]">{copy.pointsPurchaseTitle}</span>
                    </div>
                    <span className="text-xs font-bold text-[#FF4DB8]">{copy.pointsForPurchase(summaryPointsEarned)}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#6B7280] bg-[#FAFAFA] rounded-xl px-3 py-2">
                    <span>
                      {copy.pointsCurrentTier}:{' '}
                      <span className="font-semibold text-[#111827]">{formatTierName(currentTier, language)}</span>
                    </span>
                    <span>
                      {availablePoints.toLocaleString(localeByLanguage[language])}{' '}
                      <span className="text-[#D1D5DB]">→</span>{' '}
                      <span className="font-semibold text-[#FF4DB8]">
                        {(availablePoints + summaryPointsEarned).toLocaleString(localeByLanguage[language])}
                      </span>
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-medium text-[#6B7280]">{copy.redeemPoints}</span>
                      <span className="text-[11px] text-[#6B7280]">{copy.available(availablePoints)}</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={pointsToUse || ''}
                        onChange={e => setPointsToUse(Math.min(availablePoints, maxRedeemablePoints, Math.max(0, Number(e.target.value))))}
                        placeholder="0"
                        className="flex-1 px-3 py-1.5 rounded-xl border border-[#EAE6EF] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20 focus:border-[#FF4DB8]/50"
                      />
                      <button
                        onClick={() => setPointsToUse(Math.min(availablePoints, maxRedeemablePoints))}
                        className="text-xs text-[#111827] font-semibold px-3 py-1.5 rounded-xl border border-[#EAE6EF] hover:bg-gray-50 transition-colors"
                      >
                        {copy.max}
                      </button>
                    </div>
                    {pointsToUse > 0 && (
                      <p className="text-[11px] text-[#FF4DB8] mt-1.5">{copy.willRedeem(summaryPointsRedeemed)}</p>
                    )}
                  </div>
                </div>

                <p className="text-center text-[11px] font-medium text-[#FF4DB8] pb-1">
                  {copy.afterPurchase(summaryPointsEarned)}
                </p>

              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}



