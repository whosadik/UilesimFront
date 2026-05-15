import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ProfileSummaryCard } from '../components/ProfileSummaryCard';
import { OfferCard } from '../components/OfferCard';
import { ProductCarousel } from '../components/ProductCarousel';
import { Button } from '../components/Button';
import { ProfileWizard } from '../components/ProfileWizard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorState } from '../components/ErrorState';
import { Sparkles, Heart, ChevronRight, Package, Receipt, Map, Clock, User, Phone, MapPin, Mail, Gift, Star } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { useAuth } from '../../shared/auth/AuthContext';
import { ApiError } from '../../shared/api/ApiError';
import { useI18n } from '../../shared/i18n/LanguageContext';
import type { AppLanguage } from '../../shared/i18n/messages';
import {
  formatCatalogCategoryLabel,
  formatCatalogProductTypeLabel,
} from '../../shared/catalog/presentation';
import {
  getFavoriteCategory,
  getLoyalty,
  getProfile,
  getProfileTaxonomy,
  type ProfileTaxonomy,
  updateProfile,
} from '../../shared/api/me';
import { home } from '../../shared/api/recommendations';
import { recommendationScoreToPercent } from '../../shared/recommendations/score';
import { formatMoney } from '../utils/formatters';
import {
  getProfileOptionLabels,
  mapBudgetMaxToApiValue,
  mapProfileMultiApiToLabels,
  mapProfileLabelsToApiValues,
  mapProfileSingleApiToLabel,
  mapProfileSingleLabelToApiValue,
  resolveProfileTaxonomy,
} from '../../shared/profile/taxonomy';

import { clickOffer, getNextOffer } from '../../shared/api/offers';
import { listReceivedGiftCards, type ReceivedGiftCardItem } from '../../shared/api/giftCards';

const profilePageCopy = {
  ru: {
    breadcrumb: 'Мой профиль',
    title: 'Мой профиль',
    subtitle: 'Ваши данные, предпочтения и персональные предложения',
    favoriteCategory: 'Любимая категория',
    noData: 'нет данных',
    bought: 'Куплено',
    spent: 'Потрачено',
    historyItems: (count: number | null) => (count !== null ? `${count} позиций в истории` : 'Позиции в истории: нет данных'),
    analysisWindow: (days: number | null) => (days !== null ? `Окно анализа: ${days} дней` : 'Окно анализа: нет данных'),
    howCalculated: 'Как мы считаем?',
    personalDetails: 'Личные данные',
    personalDetailsHint: 'Необязательные поля. Их можно заполнить сейчас, позже или оставить пустыми.',
    firstName: 'Имя',
    lastName: 'Фамилия',
    phone: 'Телефон',
    city: 'Город',
    enterFirstName: 'Введите имя',
    enterLastName: 'Введите фамилию',
    enterCity: 'Введите город',
    email: 'Email',
    notSpecified: 'не указан',
    saving: 'Сохраняем...',
    saveDetails: 'Сохранить данные',
    privileges: 'Ваши привилегии',
    privilegesSubtitle: 'Персональные офферы и подарочные карты',
    giftCardsForYou: 'Подарочные карты',
    giftCardsHint: 'Показываем этот блок только если на ваш email действительно отправили подарочную карту.',
    giftCardsEmpty: 'Подарочных карт пока нет',
    giftCardsEmptyHint: 'Попросите кого-нибудь подарить вам карту или',
    giftCardsEmptyLink: 'купите сами',
    buyGiftCard: 'Купить подарочную карту',
    fromWhom: 'От кого',
    remaining: 'Остаток',
    nominal: 'Номинал',
    code: 'Код',
    message: 'Сообщение',
    validUntil: 'Действует до',
    copied: 'Скопировано',
    copyCode: 'Скопировать код',
    applyInCart: 'Применить в корзине',
    personalOffer: 'Персональный оффер',
    offerAppliedToast: 'Оффер отмечен. Применение будет на этапе корзины.',
    specialForYou: 'Специально для вас',
    recommendationsByProfile: 'Рекомендации на основе вашего профиля',
    viewAll: 'Смотреть всё',
    management: 'Управление',
    myRoutine: 'Моя рутина',
    myRoutineDescription: 'Персональный план ухода на основе вашего профиля',
    roadmapDescription: 'Пошаговый план построения идеальной бьюти-рутины',
    myProducts: 'Мои товары',
    myProductsDescription: 'Управление купленными товарами и заметки',
    transactions: 'История транзакций',
    transactionsDescription: 'Ваши покупки и начисления баллов',
    profileQuiz: 'Анкета профиля',
    personalDataSaved: 'Личные данные сохранены',
    personalDataSaveError: 'Не удалось сохранить личные данные',
    profileLoadError: 'Не удалось загрузить данные профиля',
    fullGiftCardCodeUnavailable: 'Полный код подарочной карты недоступен.',
    copyCodeAutoError: 'Не удалось скопировать код автоматически.',
    giftCardCodeCopied: 'Код подарочной карты скопирован.',
    profileSaveWithPoints: (points: number) => `Профиль сохранён. +${points} баллов`,
    profileSaved: 'Профиль сохранён',
    guest: 'Гость',
    giftCardFallbackSender: 'Подарок',
    offerFallbackTitle: 'Персональный оффер',
    offerAllCart: 'На всю корзину',
    offerCategory: (value: string) => `На категорию ${value}`,
    offerProductType: (value: string) => `На тип ${value}`,
    offerProduct: (value: string) => `На товар #${value}`,
    offerCondition: (value: string) => `Условие: ${value}`,
    spendFallback: 'нет данных',
    explainWindow: (start: string, end: string) => `Окно: ${start} → ${end}`,
    explainPurchases: (count: string) => `Учтено покупок: ${count}`,
    explainMethod: (value: string) => `Метод: ${value}`,
    giftCardStatusActive: 'Активна',
    giftCardStatusExhausted: 'Использована',
    giftCardStatusExpired: 'Истекла',
    giftCardStatusRefunded: 'Отменена',
    giftCardStatusUnknown: 'Неизвестно',
  },
  kk: {
    breadcrumb: 'Менің профилім',
    title: 'Менің профилім',
    subtitle: 'Деректеріңіз, қалауларыңыз және жеке ұсыныстарыңыз',
    favoriteCategory: 'Сүйікті санат',
    noData: 'дерек жоқ',
    bought: 'Сатып алынған',
    spent: 'Жұмсалған',
    historyItems: (count: number | null) => (count !== null ? `Тарихта ${count} позиция` : 'Тарих позициялары: дерек жоқ'),
    analysisWindow: (days: number | null) => (days !== null ? `Талдау терезесі: ${days} күн` : 'Талдау терезесі: дерек жоқ'),
    howCalculated: 'Қалай есептейміз?',
    personalDetails: 'Жеке деректер',
    personalDetailsHint: 'Міндетті емес өрістер. Оларды қазір, кейін толтыра аласыз немесе бос қалдыра аласыз.',
    firstName: 'Аты',
    lastName: 'Тегі',
    phone: 'Телефон',
    city: 'Қала',
    enterFirstName: 'Атыңызды енгізіңіз',
    enterLastName: 'Тегіңізді енгізіңіз',
    enterCity: 'Қаланы енгізіңіз',
    email: 'Email',
    notSpecified: 'көрсетілмеген',
    saving: 'Сақтап жатырмыз...',
    saveDetails: 'Деректерді сақтау',
    privileges: 'Артықшылықтарыңыз',
    privilegesSubtitle: 'Жеке офферлер мен сыйлық карталары',
    giftCardsForYou: 'Сыйлық карталары',
    giftCardsHint: 'Бұл блок тек сіздің email-іңізге шын мәнінде сыйлық картасы жіберілген болса ғана көрсетіледі.',
    giftCardsEmpty: 'Әзірге сыйлық карталары жоқ',
    giftCardsEmptyHint: 'Біреуден сыйлық картасын сұраңыз немесе',
    giftCardsEmptyLink: 'өзіңіз сатып алыңыз',
    buyGiftCard: 'Сыйлық картасын сатып алу',
    fromWhom: 'Кімнен',
    remaining: 'Қалдық',
    nominal: 'Номинал',
    code: 'Код',
    message: 'Хабарлама',
    validUntil: 'Жарамды күні',
    copied: 'Көшірілді',
    copyCode: 'Кодты көшіру',
    applyInCart: 'Себетте қолдану',
    personalOffer: 'Жеке оффер',
    offerAppliedToast: 'Оффер белгіленді. Қолдану себет кезеңінде болады.',
    specialForYou: 'Арнайы сіз үшін',
    recommendationsByProfile: 'Профиліңізге негізделген ұсыныстар',
    viewAll: 'Барлығын көру',
    management: 'Басқару',
    myRoutine: 'Менің рутинам',
    myRoutineDescription: 'Профильге негізделген жеке күтім жоспары',
    roadmapDescription: 'Мінсіз бьюти-рутинаға арналған қадамдық жоспар',
    myProducts: 'Менің тауарларым',
    myProductsDescription: 'Сатып алынған тауарлар мен жазбаларды басқару',
    transactions: 'Транзакциялар тарихы',
    transactionsDescription: 'Сатып алуларыңыз және ұпай есептелуі',
    profileQuiz: 'Профиль сауалнамасы',
    personalDataSaved: 'Жеке деректер сақталды',
    personalDataSaveError: 'Жеке деректерді сақтау мүмкін болмады',
    profileLoadError: 'Профиль деректерін жүктеу мүмкін болмады',
    fullGiftCardCodeUnavailable: 'Сыйлық картасының толық коды қолжетімсіз.',
    copyCodeAutoError: 'Кодты автоматты көшіру мүмкін болмады.',
    giftCardCodeCopied: 'Сыйлық картасының коды көшірілді.',
    profileSaveWithPoints: (points: number) => `Профиль сақталды. +${points} ұпай`,
    profileSaved: 'Профиль сақталды',
    guest: 'Қонақ',
    giftCardFallbackSender: 'Сыйлық',
    offerFallbackTitle: 'Жеке оффер',
    offerAllCart: 'Бүкіл себетке',
    offerCategory: (value: string) => `${value} санатына`,
    offerProductType: (value: string) => `${value} түріне`,
    offerProduct: (value: string) => `#${value} тауарына`,
    offerCondition: (value: string) => `Шарт: ${value}`,
    spendFallback: 'дерек жоқ',
    explainWindow: (start: string, end: string) => `Аралық: ${start} → ${end}`,
    explainPurchases: (count: string) => `Ескерілген сатып алулар: ${count}`,
    explainMethod: (value: string) => `Әдіс: ${value}`,
    giftCardStatusActive: 'Белсенді',
    giftCardStatusExhausted: 'Пайдаланылған',
    giftCardStatusExpired: 'Мерзімі өтті',
    giftCardStatusRefunded: 'Бас тартылды',
    giftCardStatusUnknown: 'Белгісіз',
  },
  en: {
    breadcrumb: 'My profile',
    title: 'My profile',
    subtitle: 'Your data, preferences, and personal offers',
    favoriteCategory: 'Favorite category',
    noData: 'no data',
    bought: 'Bought',
    spent: 'Spent',
    historyItems: (count: number | null) => (count !== null ? `${count} items in history` : 'History items: no data'),
    analysisWindow: (days: number | null) => (days !== null ? `Analysis window: ${days} days` : 'Analysis window: no data'),
    howCalculated: 'How do we calculate it?',
    personalDetails: 'Personal details',
    personalDetailsHint: 'Optional fields. You can fill them now, later, or leave them empty.',
    firstName: 'First name',
    lastName: 'Last name',
    phone: 'Phone',
    city: 'City',
    enterFirstName: 'Enter first name',
    enterLastName: 'Enter last name',
    enterCity: 'Enter city',
    email: 'Email',
    notSpecified: 'not specified',
    saving: 'Saving...',
    saveDetails: 'Save details',
    privileges: 'Your privileges',
    privilegesSubtitle: 'Personal offers and gift cards',
    giftCardsForYou: 'Gift cards',
    giftCardsHint: 'We show this block only if a gift card was actually sent to your email.',
    giftCardsEmpty: 'No gift cards yet',
    giftCardsEmptyHint: 'Ask someone to gift you a card, or',
    giftCardsEmptyLink: 'buy one yourself',
    buyGiftCard: 'Buy a gift card',
    fromWhom: 'From',
    remaining: 'Remaining',
    nominal: 'Amount',
    code: 'Code',
    message: 'Message',
    validUntil: 'Valid until',
    copied: 'Copied',
    copyCode: 'Copy code',
    applyInCart: 'Apply in cart',
    personalOffer: 'Personal offer',
    offerAppliedToast: 'Offer marked. It will be applied at the cart stage.',
    specialForYou: 'Special for you',
    recommendationsByProfile: 'Recommendations based on your profile',
    viewAll: 'View all',
    management: 'Management',
    myRoutine: 'My routine',
    myRoutineDescription: 'Personal care plan based on your profile',
    roadmapDescription: 'A step-by-step plan to build the ideal beauty routine',
    myProducts: 'My products',
    myProductsDescription: 'Manage purchased products and notes',
    transactions: 'Transaction history',
    transactionsDescription: 'Your purchases and points earnings',
    profileQuiz: 'Profile questionnaire',
    personalDataSaved: 'Personal details saved',
    personalDataSaveError: 'Could not save personal details',
    profileLoadError: 'Could not load profile data',
    fullGiftCardCodeUnavailable: 'The full gift card code is unavailable.',
    copyCodeAutoError: 'Could not copy the code automatically.',
    giftCardCodeCopied: 'Gift card code copied.',
    profileSaveWithPoints: (points: number) => `Profile saved. +${points} points`,
    profileSaved: 'Profile saved',
    guest: 'Guest',
    giftCardFallbackSender: 'Gift',
    offerFallbackTitle: 'Personal offer',
    offerAllCart: 'For the whole cart',
    offerCategory: (value: string) => `For category ${value}`,
    offerProductType: (value: string) => `For type ${value}`,
    offerProduct: (value: string) => `For product #${value}`,
    offerCondition: (value: string) => `Condition: ${value}`,
    spendFallback: 'no data',
    explainWindow: (start: string, end: string) => `Window: ${start} → ${end}`,
    explainPurchases: (count: string) => `Purchases counted: ${count}`,
    explainMethod: (value: string) => `Method: ${value}`,
    giftCardStatusActive: 'Active',
    giftCardStatusExhausted: 'Used',
    giftCardStatusExpired: 'Expired',
    giftCardStatusRefunded: 'Cancelled',
    giftCardStatusUnknown: 'Unknown',
  },
} as const;

const localeByLanguage: Record<AppLanguage, string> = {
  ru: 'ru-RU',
  kk: 'kk-KZ',
  en: 'en-US',
};

const favoriteExplainMethodLabels = {
  ru: {
    total_qty: 'объем',
    line_count: 'число позиций',
    last_at: 'последняя покупка',
    category: 'категория',
  },
  kk: {
    total_qty: 'көлем',
    line_count: 'позициялар саны',
    last_at: 'соңғы сатып алу',
    category: 'санат',
  },
  en: {
    total_qty: 'volume',
    line_count: 'line count',
    last_at: 'last purchase',
    category: 'category',
  },
} as const;

type ProfileWizardData = {
  skinType?: string[];
  goals?: string[];
  avoidFlags?: string[];
  budgetMin?: number;
  budgetMax?: number;
  hairProfile?: {
    type?: string[];
    concerns?: string[];
  };
  makeupProfile?: {
    coverage?: string;
    skinTone?: string;
  };
  fragranceProfile?: {
    notes?: string[];
    intensity?: string;
  };
};

type RecommendationCard = {
  id: string;
  image: string;
  brand: string;
  name: string;
  price: number;
  category?: string;
  pointsEarned?: number;
  recommendationScore?: number;
};

type FavoriteCategoryState = {
  category: string;
  windowDays: number | null;
  historyItemsConsidered: number | null;
  productsBought: number | null;
  totalSpent: string | null;
  currency: string | null;
  explain: string;
};

type OfferState = {
  assignmentId: number;
  offerType: 'discount' | 'points_multiplier' | 'gift' | string;
  offerName: string;
  value: number;
  expiresAt?: string | null;
  target?: Record<string, unknown>;
};

type PersonalDetailsState = {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v);
}

function formatLocalizedDate(language: AppLanguage, iso?: string | null) {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString(localeByLanguage[language], { day: 'numeric', month: 'long' });
}

function mapTier(raw: unknown): 'bronze' | 'silver' | 'gold' {
  const t = String(raw ?? '').trim().toLowerCase();
  if (!t) return 'bronze';
  if (t === 'bronze' || t === 'silver' || t === 'gold') return t;
  return 'gold';
}

function calcCompletion(profile: Record<string, unknown>) {
  const fields = ['skin_type', 'goals', 'avoid_flags', 'budget', 'hair_profile', 'makeup_profile', 'fragrance_profile'];
  const filled = fields.filter((key) => {
    const value = profile[key];
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === 'object') return Object.keys(value as object).length > 0;
    return Boolean(value);
  }).length;

  return Math.max(0, Math.min(100, Math.round((filled / fields.length) * 100)));
}

function mapOfferDescription(
  target: Record<string, unknown> | undefined,
  copy: (typeof profilePageCopy)[AppLanguage],
  language: AppLanguage,
) {
  const scope = String(target?.scope ?? '');
  if (!scope) return undefined;

  if (scope === 'cart') return copy.offerAllCart;
  if (scope === 'category') {
    const label =
      formatCatalogCategoryLabel(target?.category ?? target?.value, language) ??
      String(target?.category ?? target?.value ?? '');
    return copy.offerCategory(label).trim();
  }
  if (scope === 'product_type') {
    const label =
      formatCatalogProductTypeLabel(target?.product_type ?? target?.value, language) ??
      String(target?.product_type ?? target?.value ?? '');
    return copy.offerProductType(label).trim();
  }
  if (scope === 'product_id') return copy.offerProduct(String(target?.value ?? '')).trim();

  return copy.offerCondition(scope);
}

function formatCategorySpend(
  totalSpent: string | null,
  currency: string | null,
  language: AppLanguage,
  copy: (typeof profilePageCopy)[AppLanguage],
): string {
  const normalizedCurrency = String(currency ?? '').trim().toUpperCase();

  if (!totalSpent) {
    return copy.spendFallback;
  }

  if (!normalizedCurrency || normalizedCurrency === 'KZT' || normalizedCurrency === '₸') {
    return formatMoney(totalSpent);
  }

  const parsed = Number(totalSpent);
  if (!Number.isFinite(parsed)) {
    return `0 ${normalizedCurrency}`;
  }

  return `${Math.round(parsed).toLocaleString(localeByLanguage[language])} ${normalizedCurrency}`;
}

function formatFavoriteExplainMethod(value: unknown, language: AppLanguage): string {
  const labels = favoriteExplainMethodLabels[language];
  const rawValues = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];

  const mapped = rawValues
    .map((item) => String(item).trim())
    .filter(Boolean)
    .map((item) => labels[item as keyof typeof labels] ?? item);

  return mapped.join(', ');
}

function readTextField(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function extractPersonalDetails(profile: Record<string, unknown>): PersonalDetailsState {
  return {
    firstName: readTextField(profile.first_name),
    lastName: readTextField(profile.last_name),
    phone: readTextField(profile.phone),
    city: readTextField(profile.city),
  };
}

function buildProfileName(
  profile: Record<string, unknown>,
  user: { username?: string | null; email?: string | null } | null | undefined,
  copy: (typeof profilePageCopy)[AppLanguage],
): string {
  const firstName = readTextField(profile.first_name);
  const lastName = readTextField(profile.last_name);
  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  if (fullName) return fullName;

  const username = typeof user?.username === 'string' ? user.username.trim() : '';
  if (username) return username;

  const email = typeof user?.email === 'string' ? user.email.trim() : '';
  if (email) return email.split('@')[0] || email;

  return copy.guest;
}

function buildProfileInitials(
  profile: Record<string, unknown>,
  user: { username?: string | null; email?: string | null } | null | undefined,
  copy: (typeof profilePageCopy)[AppLanguage],
): string {
  const firstName = readTextField(profile.first_name);
  const lastName = readTextField(profile.last_name);

  if (firstName || lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.trim().toUpperCase() || 'U';
  }

  const name = buildProfileName(profile, user, copy);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }

  return name.charAt(0).toUpperCase() || 'U';
}

function buildProfileSummaryState(
  profile: Record<string, unknown>,
  user: { username?: string | null; email?: string | null } | null | undefined,
  copy: (typeof profilePageCopy)[AppLanguage],
) {
  return {
    name: buildProfileName(profile, user, copy),
    initials: buildProfileInitials(profile, user, copy),
    completionPercentage: calcCompletion(profile),
  };
}

function formatGiftCardStatus(
  status: string | undefined,
  copy: (typeof profilePageCopy)[AppLanguage],
): string {
  switch (String(status ?? '').toLowerCase()) {
    case 'active':
      return copy.giftCardStatusActive;
    case 'exhausted':
      return copy.giftCardStatusExhausted;
    case 'expired':
      return copy.giftCardStatusExpired;
    case 'refunded':
      return copy.giftCardStatusRefunded;
    default:
      return copy.giftCardStatusUnknown;
  }
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { language, messages } = useI18n();
  const copy = profilePageCopy[language];

  const [wizardOpen, setWizardOpen] = useState(false);

  const [profileSummary, setProfileSummary] = useState({
    name: user?.username ?? '',
    initials: (user?.username?.charAt(0) || '').toUpperCase(),
    completionPercentage: 0,
  });
  const [currentProfile, setCurrentProfile] = useState<Record<string, unknown>>({});
  const [personalDetails, setPersonalDetails] = useState<PersonalDetailsState>({
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
  });
  const [profileTaxonomy, setProfileTaxonomy] = useState<ProfileTaxonomy | null>(null);
  const [isPersonalDetailsSaving, setIsPersonalDetailsSaving] = useState(false);

  const [loyalty, setLoyaltyState] = useState({
    tier: 'bronze' as const,
    points: 0,
  });

  const [favoriteCategory, setFavoriteCategory] = useState<FavoriteCategoryState>({
    category: '',
    windowDays: null,
    historyItemsConsidered: null,
    productsBought: null,
    totalSpent: null,
    currency: null,
    explain: '',
  });

  const [recommendations, setRecommendations] = useState<RecommendationCard[]>([]);
  const [receivedGiftCards, setReceivedGiftCards] = useState<ReceivedGiftCardItem[]>([]);
  const [copiedGiftCardId, setCopiedGiftCardId] = useState<number | null>(null);
  const [offer, setOffer] = useState<OfferState | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('profile') === 'quiz' || params.get('open') === 'profile') {
      setWizardOpen(true);
    }
  }, [location.search]);

  const handleWizardOpenChange = (open: boolean) => {
    setWizardOpen(open);
    if (!open) {
      const params = new URLSearchParams(location.search);
      if (params.get('profile') === 'quiz' || params.get('open') === 'profile') {
        navigate(location.pathname, { replace: true });
      }
    }
  };

  const offerStatus = useMemo<'active' | 'none' | 'expired'>(() => {
    if (!offer) return 'none';
    if (offer.expiresAt) {
      const d = new Date(offer.expiresAt);
      if (!Number.isNaN(d.getTime()) && d.getTime() < Date.now()) return 'expired';
    }
    return 'active';
  }, [offer]);

  const resolvedProfileTaxonomy = useMemo(
    () => resolveProfileTaxonomy(profileTaxonomy, language),
    [language, profileTaxonomy],
  );

  const profileWizardOptions = useMemo(
    () => ({
      steps: resolvedProfileTaxonomy.steps.map((step) => ({
        id: step.id,
        title: step.title,
        description: step.description,
      })),
      skinTypes: getProfileOptionLabels(resolvedProfileTaxonomy.skin_types),
      skinGoals: getProfileOptionLabels(resolvedProfileTaxonomy.goals),
      avoidFlags: getProfileOptionLabels(resolvedProfileTaxonomy.avoid_flags),
      hairTypes: getProfileOptionLabels(resolvedProfileTaxonomy.hair_types),
      hairConcerns: getProfileOptionLabels(resolvedProfileTaxonomy.hair_concerns),
      coverageOptions: getProfileOptionLabels(resolvedProfileTaxonomy.coverage_options),
      fragranceNotes: getProfileOptionLabels(resolvedProfileTaxonomy.fragrance_notes),
      intensityOptions: getProfileOptionLabels(resolvedProfileTaxonomy.intensity_options),
    }),
    [resolvedProfileTaxonomy],
  );

  const profileWizardInitialData = useMemo<ProfileWizardData>(() => {
    const hairProfile = isRecord(currentProfile.hair_profile) ? currentProfile.hair_profile : {};
    const makeupProfile = isRecord(currentProfile.makeup_profile) ? currentProfile.makeup_profile : {};
    const fragranceProfile = isRecord(currentProfile.fragrance_profile) ? currentProfile.fragrance_profile : {};
    const budgetOption = resolvedProfileTaxonomy.budget_options.find(
      (option) => option.value === currentProfile.budget,
    );
    const budgetMin = typeof budgetOption?.min === 'number' ? budgetOption.min : 0;
    const budgetMax = typeof budgetOption?.max === 'number' ? budgetOption.max : 100000;

    return {
      skinType: (() => {
        const label = mapProfileSingleApiToLabel(resolvedProfileTaxonomy.skin_types, currentProfile.skin_type);
        return label ? [label] : [];
      })(),
      goals: mapProfileMultiApiToLabels(resolvedProfileTaxonomy.goals, currentProfile.goals),
      avoidFlags: mapProfileMultiApiToLabels(resolvedProfileTaxonomy.avoid_flags, currentProfile.avoid_flags),
      budgetMin,
      budgetMax,
      hairProfile: {
        type: (() => {
          const legacyHairType = Array.isArray(hairProfile.type) ? hairProfile.type[0] : hairProfile.type;
          const label = mapProfileSingleApiToLabel(
            resolvedProfileTaxonomy.hair_types,
            hairProfile.hair_type ?? legacyHairType,
          );
          return label ? [label] : [];
        })(),
        concerns: mapProfileMultiApiToLabels(resolvedProfileTaxonomy.hair_concerns, hairProfile.concerns),
      },
      makeupProfile: {
        coverage:
          mapProfileSingleApiToLabel(
            resolvedProfileTaxonomy.coverage_options,
            Array.isArray(makeupProfile.coverage_pref) ? makeupProfile.coverage_pref[0] : makeupProfile.coverage,
          ) ?? undefined,
      },
      fragranceProfile: {
        notes: mapProfileMultiApiToLabels(resolvedProfileTaxonomy.fragrance_notes, fragranceProfile.liked_notes ?? fragranceProfile.notes),
        intensity:
          mapProfileSingleApiToLabel(
            resolvedProfileTaxonomy.intensity_options,
            fragranceProfile.intensity_pref ?? fragranceProfile.intensity,
          ) ?? undefined,
      },
    };
  }, [currentProfile, resolvedProfileTaxonomy]);

  const applyProfileSnapshot = (profile: Record<string, unknown>) => {
    setCurrentProfile(profile);
    setProfileSummary(buildProfileSummaryState(profile, user, copy));
    setPersonalDetails(extractPersonalDetails(profile));
  };

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsPageLoading(true);
      setLoadError(null);
      setReceivedGiftCards([]);

      try {
        const [profileResp, profileTaxonomyResp, loyaltyResp, favResp, offerResp, homeResp, receivedGiftCardsResp] = await Promise.all([
          getProfile(),
          getProfileTaxonomy().catch(() => null),
          getLoyalty(),
          getFavoriteCategory(),
          getNextOffer(),
          home(),
          listReceivedGiftCards().catch(() => ({ ok: true, count: 0, items: [] })),
        ]);

        if (cancelled) return;

        const profileObj = isRecord(profileResp) ? profileResp : {};
        applyProfileSnapshot(profileObj);
        if (profileTaxonomyResp && typeof profileTaxonomyResp === 'object') {
          setProfileTaxonomy(profileTaxonomyResp as ProfileTaxonomy);
        }

        const loyaltyObj = isRecord(loyaltyResp) ? loyaltyResp : {};
        setLoyaltyState({
          tier: mapTier(loyaltyObj.tier),
          points: Number(loyaltyObj.points_balance) || 0,
        });

        const favObj = isRecord(favResp) ? favResp : {};
        const explainObj = isRecord(favObj.explain) ? favObj.explain : null;
        const windowDaysValue = Number(favObj.window_days);
        const historyItemsValue = Number(explainObj?.history_items_considered);
        const productsBoughtValue = Number(favObj.products_bought);
        const totalSpentValue =
          typeof favObj.total_spent === 'number' || typeof favObj.total_spent === 'string'
            ? String(favObj.total_spent)
            : null;
        const currencyValue =
          typeof favObj.currency === 'string' && favObj.currency.trim()
            ? favObj.currency.trim()
            : null;

        const explainText = explainObj
          ? [
              explainObj.window_start
                ? copy.explainWindow(String(explainObj.window_start), String(explainObj.window_end))
                : null,
              explainObj.history_items_considered
                ? copy.explainPurchases(String(explainObj.history_items_considered))
                : null,
              explainObj.picked_by
                ? copy.explainMethod(formatFavoriteExplainMethod(explainObj.picked_by, language))
                : null,
            ]
              .filter(Boolean)
              .join(' · ')
          : '';

        setFavoriteCategory({
          category:
            typeof favObj.favorite_category === 'string'
              ? formatCatalogCategoryLabel(favObj.favorite_category, language) ??
                messages.catalog.categories[
                  favObj.favorite_category as keyof typeof messages.catalog.categories
                ] ?? favObj.favorite_category
              : '',
          windowDays: Number.isFinite(windowDaysValue) ? Math.max(0, Math.round(windowDaysValue)) : null,
          historyItemsConsidered: Number.isFinite(historyItemsValue)
            ? Math.max(0, Math.round(historyItemsValue))
            : null,
          productsBought: Number.isFinite(productsBoughtValue)
            ? Math.max(0, Math.round(productsBoughtValue))
            : null,
          totalSpent: totalSpentValue,
          currency: currencyValue,
          explain: explainText,
        });

        setReceivedGiftCards(Array.isArray(receivedGiftCardsResp?.items) ? receivedGiftCardsResp.items : []);

        let results: unknown[] = [];
        const forYouKey = 'for_you';

        if (Array.isArray(homeResp)) {
          results = homeResp;
        } else if (isRecord(homeResp) && Array.isArray(homeResp.sections)) {
          const forYou = homeResp.sections.find((s) => isRecord(s) && s.key === forYouKey);
          if (isRecord(forYou) && Array.isArray(forYou.results)) results = forYou.results;
        } else if (isRecord(homeResp) && Array.isArray((homeResp as any).results)) {
          results = (homeResp as any).results;
        }

        const mapped = results
          .map((item) => {
            const it = isRecord(item) ? item : null;
            const prod = it && isRecord(it.product) ? it.product : null;
            if (!prod || (!['number', 'string'].includes(typeof prod.id))) return null;

            const rawPrice = prod.price;
            const price =
              typeof rawPrice === 'number'
                ? rawPrice
                : typeof rawPrice === 'string'
                  ? Number(rawPrice)
                  : 0;

            return {
              id: String(prod.id),
              image: typeof prod.image_url === 'string' ? prod.image_url : '',
              brand: typeof prod.brand === 'string' ? prod.brand : '',
              name: typeof prod.name === 'string' ? prod.name : '',
              price: Number.isFinite(price) ? price : 0,
              category:
                typeof prod.category === 'string'
                  ? formatCatalogCategoryLabel(prod.category, language) ?? prod.category
                  : undefined,
              recommendationScore: recommendationScoreToPercent(it?.score, it?.components),
            } satisfies RecommendationCard;
          })
          .filter((x): x is RecommendationCard => x !== null);

        setRecommendations(mapped);

        const offerObj = isRecord(offerResp) ? offerResp : null;
        const offerInner = offerObj && isRecord(offerObj.offer) ? offerObj.offer : null;

        if (offerObj && offerInner && typeof offerObj.assignment_id === 'number') {
          const vRaw = offerInner.value;
          const v = typeof vRaw === 'number' ? vRaw : Number(String(vRaw ?? '0'));
          setOffer({
            assignmentId: offerObj.assignment_id,
            offerType: String(offerInner.type ?? ''),
            offerName: String(offerInner.name ?? copy.offerFallbackTitle),
            value: Number.isFinite(v) ? v : 0,
            expiresAt: typeof offerObj.expires_at === 'string' ? offerObj.expires_at : null,
            target: isRecord(offerObj.target) ? offerObj.target : undefined,
          });
        } else {
          setOffer(null);
        }
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : copy.profileLoadError);
        }
      } finally {
        if (!cancelled) {
          setIsPageLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [copy, isAuthLoading, language, location.pathname, messages.catalog.categories, navigate, retryKey, user]);

  const handlePersonalDetailChange = (field: keyof PersonalDetailsState, value: string) => {
    setPersonalDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleCopyGiftCardCode = async (giftCardId: number, code?: string) => {
    if (!code) {
      toast.error(copy.fullGiftCardCodeUnavailable);
      return;
    }

    if (!('clipboard' in navigator) || typeof navigator.clipboard.writeText !== 'function') {
      toast.error(copy.copyCodeAutoError);
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setCopiedGiftCardId(giftCardId);
      toast.success(copy.giftCardCodeCopied);
      window.setTimeout(() => {
        setCopiedGiftCardId((current) => (current === giftCardId ? null : current));
      }, 2000);
    } catch {
      toast.error(copy.copyCodeAutoError);
    }
  };

  const handleSavePersonalDetails = async () => {
    setIsPersonalDetailsSaving(true);

    try {
      const updated = await updateProfile({
        first_name: personalDetails.firstName.trim(),
        last_name: personalDetails.lastName.trim(),
        phone: personalDetails.phone.trim(),
        city: personalDetails.city.trim(),
      });

      const updatedProfile =
        updated && typeof updated === 'object' && 'profile' in updated && updated.profile
          ? (updated.profile as Record<string, unknown>)
          : (updated as Record<string, unknown>);

      if (isRecord(updatedProfile) && Object.keys(updatedProfile).length > 0) {
        applyProfileSnapshot(updatedProfile);
      } else {
        const fallbackProfile = await getProfile();
        if (isRecord(fallbackProfile)) {
          applyProfileSnapshot(fallbackProfile);
        }
      }

      toast.success(copy.personalDataSaved);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }
      toast.error(error instanceof Error ? error.message : copy.personalDataSaveError);
    } finally {
      setIsPersonalDetailsSaving(false);
    }
  };

  if (isAuthLoading || isPageLoading) {
    return (
      <div className="page-with-navbar-offset min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="page-with-navbar-offset min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
          <ErrorState onRetry={() => setRetryKey((prev) => prev + 1)} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-with-navbar-offset min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">

        {/* Breadcrumbs + заголовок */}
        <div className="mb-6">
          <Breadcrumbs items={[{ label: messages.common.home, href: '/' }, { label: copy.breadcrumb }]} />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#111827] mb-3">{copy.title}</h1>
          <p className="text-base text-[#6B7280]">{copy.subtitle}</p>
        </div>

        {/* 1. Hero: ProfileSummaryCard + Favorite Category */}
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2">
            <ProfileSummaryCard
              profile={profileSummary}
              loyalty={loyalty}
              onUpdateProfile={() => setWizardOpen(true)}
            />
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#EAE6EF]">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-[#FF4DB8]" />
              <h3 className="text-base font-bold text-[#111827]">{copy.favoriteCategory}</h3>
            </div>

            <div className="space-y-3">
              <p className="text-2xl font-bold text-[#FF4DB8]">{favoriteCategory.category || copy.noData}</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#FFF8FC] border border-[#F8D7EA] px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-[#6B7280]">{copy.bought}</p>
                  <p className="mt-1 text-base font-bold text-[#111827]">
                    {favoriteCategory.productsBought !== null ? favoriteCategory.productsBought : copy.noData}
                  </p>
                </div>
                <div className="rounded-xl bg-[#FFF8FC] border border-[#F8D7EA] px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-[#6B7280]">{copy.spent}</p>
                  <p className="mt-1 text-base font-bold text-[#111827]">
                    {formatCategorySpend(favoriteCategory.totalSpent, favoriteCategory.currency, language, copy)}
                  </p>
                </div>
              </div>

              <div className="space-y-1 text-sm text-[#6B7280]">
                <p>{favoriteCategory.historyItemsConsidered !== null
                  ? copy.historyItems(favoriteCategory.historyItemsConsidered)
                  : copy.historyItems(null)}</p>
                <p>{favoriteCategory.windowDays !== null
                  ? copy.analysisWindow(favoriteCategory.windowDays)
                  : copy.analysisWindow(null)}</p>
              </div>

              <details className="text-xs text-[#6B7280] pt-2 border-t border-[#EAE6EF]">
                <summary className="cursor-pointer hover:text-[#FF4DB8] transition-colors">
                  {copy.howCalculated}
                </summary>
                <p className="mt-2">{favoriteCategory.explain || copy.noData}</p>
              </details>
            </div>
          </div>
        </div>

        {/* 2. Ваши привилегии: Оффер + Gift Cards */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFF4E8] to-amber-50 flex items-center justify-center">
              <Star className="w-5 h-5 text-[#F97316]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#111827]">{copy.privileges}</h2>
              <p className="text-sm text-[#6B7280]">{copy.privilegesSubtitle}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Персональный оффер */}
            <div>
              <p className="text-sm font-semibold text-[#6B7280] uppercase tracking-wide mb-3">{copy.personalOffer}</p>
              <OfferCard
                status={offerStatus}
                title={offer?.offerName}
                description={mapOfferDescription(offer?.target, copy, language)}
                expiresAt={formatLocalizedDate(language, offer?.expiresAt)}
                discountType={offer?.offerType === 'points_multiplier' ? 'points' : offer?.offerType === 'gift' ? 'gift' : 'percentage'}
                discountValue={offer?.value}
                onApply={async () => {
                  if (!offer) return;
                  try {
                    await clickOffer(offer.assignmentId, { source: 'profile_page' });
                    toast.success(copy.offerAppliedToast);
                  } catch {
                    // не блокируем UX
                  }
                }}
              />
            </div>

            {/* Gift Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-[#6B7280] uppercase tracking-wide">{copy.giftCardsForYou}</p>
                <Link
                  to="/gift-cards"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#FF4DB8] hover:text-[#e03da0] transition-colors"
                >
                  <Gift className="w-4 h-4" />
                  {copy.buyGiftCard}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {receivedGiftCards.length === 0 ? (
                /* Empty state — всегда показываем секцию */
                <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-6 flex flex-col items-center justify-center text-center gap-3 min-h-[160px]">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF4E8] flex items-center justify-center">
                    <Gift className="w-6 h-6 text-[#F97316]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111827] mb-1">{copy.giftCardsEmpty}</p>
                    <p className="text-sm text-[#6B7280]">
                      {copy.giftCardsEmptyHint}{' '}
                      <Link
                        to="/gift-cards"
                        className="text-[#FF4DB8] hover:underline font-medium"
                      >
                        {copy.giftCardsEmptyLink}
                      </Link>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                  {receivedGiftCards.map((giftCard) => {
                    const senderLabel = giftCard.sender_name || giftCard.sender_email || copy.giftCardFallbackSender;
                    const expiresAt = formatLocalizedDate(language, giftCard.snapshot?.expires_at as string | null | undefined);
                    const remainingAmount = giftCard.snapshot?.remaining_amount ?? 0;
                    const totalAmount = giftCard.snapshot?.amount ?? 0;
                    const status = String(giftCard.snapshot?.status ?? giftCard.status ?? '');
                    const isActive = status.toLowerCase() === 'active';

                    return (
                      <article
                        key={giftCard.id}
                        className="rounded-2xl border border-[#F3E7D6] bg-gradient-to-br from-[#FFF9F2] to-white p-5"
                      >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-[#6B7280]">{copy.fromWhom}</p>
                            <p className="break-words text-lg font-bold text-[#111827]">{senderLabel}</p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              isActive ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#F3F4F6] text-[#4B5563]'
                            }`}
                          >
                            {formatGiftCardStatus(status, copy)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-xl bg-white/80 px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.08em] text-[#6B7280]">{copy.remaining}</p>
                            <p className="mt-1 text-xl font-bold text-[#111827]">{formatMoney(remainingAmount)}</p>
                          </div>
                          <div className="rounded-xl bg-white/80 px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.08em] text-[#6B7280]">{copy.nominal}</p>
                            <p className="mt-1 text-xl font-bold text-[#111827]">{formatMoney(totalAmount)}</p>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2 text-sm text-[#6B7280]">
                          <p>
                            {copy.code}: <span className="font-medium text-[#111827]">{String(giftCard.snapshot?.masked_code ?? '-')}</span>
                          </p>
                          {giftCard.message ? (
                            <p>{copy.message}: <span className="text-[#111827]">{giftCard.message}</span></p>
                          ) : null}
                          {expiresAt ? (
                            <p>{copy.validUntil}: <span className="font-medium text-[#111827]">{expiresAt}</span></p>
                          ) : null}
                        </div>

                        {giftCard.code ? (
                          <div className="mt-4 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => void handleCopyGiftCardCode(giftCard.id, giftCard.code)}
                              className="inline-flex items-center justify-center rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#111827] transition-colors hover:bg-gray-50"
                            >
                              {copiedGiftCardId === giftCard.id ? copy.copied : copy.copyCode}
                            </button>
                            <Link
                              to="/cart"
                              state={{ giftCardCodeToApply: giftCard.code }}
                              className="inline-flex items-center justify-center rounded-full border border-brand-pink-500 px-4 py-2 text-sm font-semibold text-brand-pink-500 transition-colors hover:bg-brand-pink-500 hover:text-white"
                            >
                              {copy.applyInCart}
                            </Link>
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 3. Рекомендации */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFE1F2] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#FF4DB8]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#111827]">{copy.specialForYou}</h2>
                <p className="text-sm text-[#6B7280]">{copy.recommendationsByProfile}</p>
              </div>
            </div>
            <Button variant="ghost">{copy.viewAll}</Button>
          </div>

          <ProductCarousel products={recommendations} />
        </section>

        {/* 4. Личные данные */}
        <section className="mb-12">
          <div className="rounded-2xl bg-white border border-[#EAE6EF] p-6 lg:p-8 shadow-sm">
            <div className="flex flex-col gap-2 mb-6">
              <h2 className="text-2xl font-bold text-[#111827]">{copy.personalDetails}</h2>
              <p className="text-sm text-[#6B7280]">{copy.personalDetailsHint}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="profile-first-name" className="block text-sm font-medium text-gray-700 mb-2">
                  {copy.firstName}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    id="profile-first-name"
                    type="text"
                    value={personalDetails.firstName}
                    onChange={(event) => handlePersonalDetailChange('firstName', event.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder={copy.enterFirstName}
                    disabled={isPersonalDetailsSaving}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="profile-last-name" className="block text-sm font-medium text-gray-700 mb-2">
                  {copy.lastName}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    id="profile-last-name"
                    type="text"
                    value={personalDetails.lastName}
                    onChange={(event) => handlePersonalDetailChange('lastName', event.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder={copy.enterLastName}
                    disabled={isPersonalDetailsSaving}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700 mb-2">
                  {copy.phone}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    id="profile-phone"
                    type="tel"
                    value={personalDetails.phone}
                    onChange={(event) => handlePersonalDetailChange('phone', event.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="+7 777 123 45 67"
                    disabled={isPersonalDetailsSaving}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="profile-city" className="block text-sm font-medium text-gray-700 mb-2">
                  {copy.city}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <input
                    id="profile-city"
                    type="text"
                    value={personalDetails.city}
                    onChange={(event) => handlePersonalDetailChange('city', event.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder={copy.enterCity}
                    disabled={isPersonalDetailsSaving}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <Mail className="w-4 h-4" />
                <span className="break-all">
                  {copy.email}: <span className="font-medium text-[#111827]">{user?.email || copy.notSpecified}</span>
                </span>
              </div>

              <Button
                variant="primary"
                onClick={() => void handleSavePersonalDetails()}
                disabled={isPersonalDetailsSaving}
              >
                {isPersonalDetailsSaving ? copy.saving : copy.saveDetails}
              </Button>
            </div>
          </div>
        </section>

        {/* 5. Управление */}
        <section>
          <h2 className="text-2xl font-bold text-[#111827] mb-6">{copy.management}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              to="/me/routine"
              className="p-6 rounded-2xl bg-white border border-[#EAE6EF] hover:border-[#FF4DB8]/30 hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFE1F2] to-pink-50 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#FF4DB8]" />
                </div>
                <ChevronRight className="w-5 h-5 text-[#6B7280] group-hover:text-[#FF4DB8] transition-colors" />
              </div>
              <h3 className="text-base font-bold text-[#111827] mb-1">{copy.myRoutine}</h3>
              <p className="text-sm text-[#6B7280]">{copy.myRoutineDescription}</p>
            </Link>

            <Link
              to="/me/roadmap"
              className="p-6 rounded-2xl bg-white border border-[#EAE6EF] hover:border-[#FF4DB8]/30 hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Map className="w-6 h-6 text-purple-600" />
                </div>
                <ChevronRight className="w-5 h-5 text-[#6B7280] group-hover:text-[#FF4DB8] transition-colors" />
              </div>
              <h3 className="text-base font-bold text-[#111827] mb-1">Roadmap</h3>
              <p className="text-sm text-[#6B7280]">{copy.roadmapDescription}</p>
            </Link>

            <Link
              to="/me/owned"
              className="p-6 rounded-2xl bg-white border border-[#EAE6EF] hover:border-[#FF4DB8]/30 hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <ChevronRight className="w-5 h-5 text-[#6B7280] group-hover:text-[#FF4DB8] transition-colors" />
              </div>
              <h3 className="text-base font-bold text-[#111827] mb-1">{copy.myProducts}</h3>
              <p className="text-sm text-[#6B7280]">{copy.myProductsDescription}</p>
            </Link>

            <Link
              to="/me/transactions"
              className="p-6 rounded-2xl bg-white border border-[#EAE6EF] hover:border-[#FF4DB8]/30 hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-[#111827]" />
                </div>
                <ChevronRight className="w-5 h-5 text-[#6B7280] group-hover:text-[#FF4DB8] transition-colors" />
              </div>
              <h3 className="text-base font-bold text-[#111827] mb-1">{copy.transactions}</h3>
              <p className="text-sm text-[#6B7280]">{copy.transactionsDescription}</p>
            </Link>
          </div>
        </section>
      </div>

      <Dialog.Root open={wizardOpen} onOpenChange={handleWizardOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-in fade-in" />
          <Dialog.Content
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in"
            aria-describedby={undefined}
          >
            <Dialog.Title className="sr-only">{copy.profileQuiz}</Dialog.Title>

            <ProfileWizard
              options={profileWizardOptions}
              initialData={profileWizardInitialData}
              onComplete={async (data: ProfileWizardData) => {
                const hairType = mapProfileSingleLabelToApiValue(
                  resolvedProfileTaxonomy.hair_types,
                  data.hairProfile?.type?.[0],
                  '',
                );
                const hairConcerns = mapProfileLabelsToApiValues(
                  resolvedProfileTaxonomy.hair_concerns,
                  data.hairProfile?.concerns,
                );
                const makeupCoverage = mapProfileSingleLabelToApiValue(
                  resolvedProfileTaxonomy.coverage_options,
                  data.makeupProfile?.coverage,
                  '',
                );
                const fragranceNotes = mapProfileLabelsToApiValues(
                  resolvedProfileTaxonomy.fragrance_notes,
                  data.fragranceProfile?.notes,
                );
                const fragranceIntensity = mapProfileSingleLabelToApiValue(
                  resolvedProfileTaxonomy.intensity_options,
                  data.fragranceProfile?.intensity,
                  '',
                );
                const payload = {
                  skin_type: mapProfileSingleLabelToApiValue(
                    resolvedProfileTaxonomy.skin_types,
                    data.skinType?.[0],
                    'normal',
                  ),
                  goals: mapProfileLabelsToApiValues(resolvedProfileTaxonomy.goals, data.goals),
                  avoid_flags: mapProfileLabelsToApiValues(
                    resolvedProfileTaxonomy.avoid_flags,
                    data.avoidFlags,
                  ),
                  budget: mapBudgetMaxToApiValue(
                    resolvedProfileTaxonomy.budget_options,
                    data.budgetMax,
                  ),
                  hair_profile: {
                    ...(hairType ? { hair_type: hairType } : {}),
                    ...(hairConcerns.length > 0 ? { concerns: hairConcerns } : {}),
                  },
                  makeup_profile: {
                    ...(makeupCoverage ? { coverage_pref: [makeupCoverage] } : {}),
                  },
                  fragrance_profile: {
                    ...(fragranceNotes.length > 0 ? { liked_notes: fragranceNotes } : {}),
                    ...(fragranceIntensity ? { intensity_pref: fragranceIntensity } : {}),
                  },
                };

                try {
                  const updated = await updateProfile(payload);

                  const updatedProfile =
                    updated && typeof updated === 'object' && 'profile' in updated && updated.profile
                      ? (updated.profile as Record<string, unknown>)
                      : (updated as Record<string, unknown>);
                  const bonusObj =
                    updated && typeof updated === 'object' && 'profile_completion_bonus' in updated
                      ? (updated.profile_completion_bonus as Record<string, unknown>)
                      : null;

                  const profileObj = Object.keys(updatedProfile || {}).length > 0 ? updatedProfile : await getProfile();
                  const loyaltyObj = await getLoyalty();

                  if (isRecord(profileObj)) {
                    applyProfileSnapshot(profileObj);
                  }

                  const l = isRecord(loyaltyObj) ? loyaltyObj : {};
                  setLoyaltyState({
                    tier: mapTier(l.tier),
                    points: Number(l.points_balance) || 0,
                  });

                  const awarded = Boolean(bonusObj && bonusObj.awarded);
                  const pointsAddedRaw = bonusObj?.points_added;
                  const pointsAdded =
                    typeof pointsAddedRaw === 'number'
                      ? pointsAddedRaw
                      : typeof pointsAddedRaw === 'string'
                        ? Number(pointsAddedRaw)
                        : 0;

                  if (awarded && Number.isFinite(pointsAdded) && pointsAdded > 0) {
                    toast.success(copy.profileSaveWithPoints(pointsAdded));
                  } else {
                    toast.success(copy.profileSaved);
                  }

                  handleWizardOpenChange(false);
                } catch (error) {
                  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
                    navigate('/login', { replace: true, state: { from: location.pathname } });
                    return;
                  }
                  if (error instanceof Error) toast.error(error.message);
                }
              }}
              onClose={() => handleWizardOpenChange(false)}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}