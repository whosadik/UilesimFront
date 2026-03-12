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
import { Sparkles, Heart, ChevronRight, Package, Receipt, Map, Clock, User, Phone, MapPin, Mail } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { useAuth } from '../../shared/auth/AuthContext';
import { ApiError } from '../../shared/api/ApiError';
import { getFavoriteCategory, getLoyalty, getProfile, updateProfile } from '../../shared/api/me';
import { home } from '../../shared/api/recommendations';
import { formatMoney } from '../utils/formatters';

import { clickOffer, getNextOffer } from '../../shared/api/offers';

type ProfileWizardData = {
  skinType?: string[]; // API ждёт string, берём первый
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

function formatDateRu(iso?: string | null) {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

function mapTier(raw: unknown): 'bronze' | 'silver' | 'gold' | 'platinum' {
  const t = String(raw ?? '').toLowerCase();
  if (t === 'bronze' || t === 'silver' || t === 'gold' || t === 'platinum') return t;
  return 'bronze';
}

// API поддерживает budget как enum (low/medium/high) :contentReference[oaicite:17]{index=17}
// В UI у тебя budgetMin/budgetMax — поэтому маппим в enum (порог можно поменять под бизнес-логику).
function mapBudgetEnum(budgetMax?: number): 'low' | 'medium' | 'high' {
  const v = typeof budgetMax === 'number' ? budgetMax : 0;
  if (v > 0 && v <= 2500) return 'low';
  if (v > 2500 && v <= 7500) return 'medium';
  return 'high';
}

const SKIN_TYPE_MAP: Record<string, 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive'> = {
  dry: 'dry',
  oily: 'oily',
  combination: 'combination',
  normal: 'normal',
  sensitive: 'sensitive',
  'сухая': 'dry',
  'жирная': 'oily',
  'комбинированная': 'combination',
  'нормальная': 'normal',
  'чувствительная': 'sensitive',
};

const GOAL_MAP: Record<string, string> = {
  hydration: 'hydration',
  'anti-age': 'anti_age',
  anti_age: 'anti_age',
  acne: 'acne',
  brightening: 'brightening',
  spf: 'spf',
  pore_care: 'pore_care',
  'увлажнение': 'hydration',
  'анти-эйдж': 'anti_age',
  'против акне': 'acne',
  'осветление': 'brightening',
  'защита от солнца': 'spf',
  'сужение пор': 'pore_care',
};

const AVOID_FLAG_MAP: Record<string, string> = {
  parabens: 'parabens',
  silicones: 'silicones',
  fragrance: 'fragrance',
  alcohol: 'alcohol',
  essential_oils: 'essential_oils',
  gluten: 'gluten',
  'парабены': 'parabens',
  'силиконы': 'silicones',
  'отдушки': 'fragrance',
  'спирт': 'alcohol',
  'эфирные масла': 'essential_oils',
  'глютен': 'gluten',
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

function mapSkinType(value?: string): 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive' {
  if (!value) {
    return 'normal';
  }
  return SKIN_TYPE_MAP[normalizeKey(value)] ?? 'normal';
}

function mapListValues(values: string[] | undefined, dictionary: Record<string, string>): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => dictionary[normalizeKey(String(value))] ?? String(value))
    .filter((value) => value.length > 0);
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

function mapOfferDescription(target?: Record<string, unknown>) {
  const scope = String(target?.scope ?? '');
  if (!scope) return undefined;

  if (scope === 'cart') return 'На всю корзину';
  if (scope === 'category') return `На категорию ${target?.category ?? target?.value ?? ''}`.trim();
  if (scope === 'product_type') return `На тип ${target?.product_type ?? target?.value ?? ''}`.trim();
  if (scope === 'product_id') return `На товар #${target?.value ?? ''}`.trim();

  return `Условие: ${scope}`;
}

function formatCategorySpend(totalSpent: string | null, currency: string | null): string {
  const normalizedCurrency = String(currency ?? '').trim().toUpperCase();

  if (!totalSpent) {
    return 'нет данных';
  }

  if (!normalizedCurrency || normalizedCurrency === 'KZT' || normalizedCurrency === '₸') {
    return formatMoney(totalSpent);
  }

  const parsed = Number(totalSpent);
  if (!Number.isFinite(parsed)) {
    return `0 ${normalizedCurrency}`;
  }

  return `${Math.round(parsed).toLocaleString('ru-RU')} ${normalizedCurrency}`;
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
): string {
  const firstName = readTextField(profile.first_name);
  const lastName = readTextField(profile.last_name);
  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  if (fullName) {
    return fullName;
  }

  const username = typeof user?.username === 'string' ? user.username.trim() : '';
  if (username) {
    return username;
  }

  const email = typeof user?.email === 'string' ? user.email.trim() : '';
  if (email) {
    return email.split('@')[0] || email;
  }

  return 'Guest';
}

function buildProfileInitials(
  profile: Record<string, unknown>,
  user: { username?: string | null; email?: string | null } | null | undefined,
): string {
  const firstName = readTextField(profile.first_name);
  const lastName = readTextField(profile.last_name);

  if (firstName || lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.trim().toUpperCase() || 'U';
  }

  const name = buildProfileName(profile, user);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }

  return name.charAt(0).toUpperCase() || 'U';
}

function buildProfileSummaryState(
  profile: Record<string, unknown>,
  user: { username?: string | null; email?: string | null } | null | undefined,
) {
  return {
    name: buildProfileName(profile, user),
    initials: buildProfileInitials(profile, user),
    completionPercentage: calcCompletion(profile),
  };
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [wizardOpen, setWizardOpen] = useState(false);

  const [profileSummary, setProfileSummary] = useState({
    name: user?.username ?? '',
    initials: (user?.username?.charAt(0) || '').toUpperCase(),
    completionPercentage: 0,
  });
  const [personalDetails, setPersonalDetails] = useState<PersonalDetailsState>({
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
  });
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
  const [offer, setOffer] = useState<OfferState | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const offerStatus = useMemo<'active' | 'none' | 'expired'>(() => {
    if (!offer) return 'none';
    if (offer.expiresAt) {
      const d = new Date(offer.expiresAt);
      if (!Number.isNaN(d.getTime()) && d.getTime() < Date.now()) return 'expired';
    }
    return 'active';
  }, [offer]);

  const applyProfileSnapshot = (profile: Record<string, unknown>) => {
    setProfileSummary(buildProfileSummaryState(profile, user));
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

      try {
        const [profileResp, loyaltyResp, favResp, offerResp, homeResp] = await Promise.all([
          getProfile(),          // GET /api/me/profile :contentReference[oaicite:18]{index=18}
          getLoyalty(),          // GET /api/me/loyalty :contentReference[oaicite:19]{index=19}
          getFavoriteCategory(), // GET /api/me/favorite-category :contentReference[oaicite:20]{index=20}
          getNextOffer(),        // GET /api/me/next-offer :contentReference[oaicite:21]{index=21}
          home(),                // GET /api/me/recommendations/home :contentReference[oaicite:22]{index=22}
        ]);

        if (cancelled) return;

        const profileObj = isRecord(profileResp) ? profileResp : {};
        applyProfileSnapshot(profileObj);

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

        // В API explain — объект, в UI у тебя строка, поэтому делаем компактный текст.
        const explainText = explainObj
          ? [
              explainObj.window_start ? `Окно: ${String(explainObj.window_start)} → ${String(explainObj.window_end)}` : null,
              explainObj.history_items_considered ? `Учтено покупок: ${String(explainObj.history_items_considered)}` : null,
              explainObj.picked_by ? `Метод: ${String(explainObj.picked_by)}` : null,
            ]
              .filter(Boolean)
              .join(' · ')
          : '';

        setFavoriteCategory({
          category: typeof favObj.favorite_category === 'string' ? favObj.favorite_category : '',
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

        // home: { ok, sections:[{key,title,results:[{product,score,...}]}] } :contentReference[oaicite:23]{index=23}
        let results: unknown[] = [];
        let forYouKey = 'for_you';

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
              category: typeof prod.category === 'string' ? prod.category : undefined,
              recommendationScore: typeof it?.score === 'number' ? it.score : undefined,
            } satisfies RecommendationCard;
          })
          .filter((x): x is RecommendationCard => x !== null);

        setRecommendations(mapped);

        // next-offer
        const offerObj = isRecord(offerResp) ? offerResp : null;
        const offerInner = offerObj && isRecord(offerObj.offer) ? offerObj.offer : null;

        if (offerObj && offerInner && typeof offerObj.assignment_id === 'number') {
          const vRaw = offerInner.value;
          const v = typeof vRaw === 'number' ? vRaw : Number(String(vRaw ?? '0'));
          setOffer({
            assignmentId: offerObj.assignment_id,
            offerType: String(offerInner.type ?? ''),
            offerName: String(offerInner.name ?? 'Персональный оффер'),
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
          setLoadError(error instanceof Error ? error.message : 'Failed to load profile data');
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
  }, [isAuthLoading, location.pathname, navigate, retryKey, user]);

  const handlePersonalDetailChange = (field: keyof PersonalDetailsState, value: string) => {
    setPersonalDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
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

      toast.success('Personal details saved');
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }
      toast.error(error instanceof Error ? error.message : 'Failed to save personal details');
    } finally {
      setIsPersonalDetailsSaving(false);
    }
  };

  if (isAuthLoading || isPageLoading) {
    return (
      <div className="pt-20 lg:pt-28 min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="pt-20 lg:pt-28 min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
          <ErrorState onRetry={() => setRetryKey((prev) => prev + 1)} />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 lg:pt-28 min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Мой профиль' }]} />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#111827] mb-3">Мой профиль</h1>
          <p className="text-base text-[#6B7280]">Ваши данные, предпочтения и персональные предложения</p>
        </div>

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
              <h3 className="text-base font-bold text-[#111827]">Любимая категория</h3>
            </div>

            <div className="space-y-3">
              <p className="text-2xl font-bold text-[#FF4DB8]">{favoriteCategory.category || 'нет данных'}</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#FFF8FC] border border-[#F8D7EA] px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-[#6B7280]">Куплено</p>
                  <p className="mt-1 text-base font-bold text-[#111827]">
                    {favoriteCategory.productsBought !== null ? favoriteCategory.productsBought : 'нет данных'}
                  </p>
                </div>
                <div className="rounded-xl bg-[#FFF8FC] border border-[#F8D7EA] px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-[#6B7280]">Потрачено</p>
                  <p className="mt-1 text-base font-bold text-[#111827]">
                    {formatCategorySpend(favoriteCategory.totalSpent, favoriteCategory.currency)}
                  </p>
                </div>
              </div>

              <div className="space-y-1 text-sm text-[#6B7280]">
                <p>
                  {favoriteCategory.historyItemsConsidered !== null
                    ? `${favoriteCategory.historyItemsConsidered} позиций в истории`
                    : 'Позиции в истории: нет данных'}
                </p>
                <p>
                  {favoriteCategory.windowDays !== null
                    ? `Окно анализа: ${favoriteCategory.windowDays} дней`
                    : 'Окно анализа: нет данных'}
                </p>
              </div>

              <details className="text-xs text-[#6B7280] pt-2 border-t border-[#EAE6EF]">
                <summary className="cursor-pointer hover:text-[#FF4DB8] transition-colors">
                  Как мы считаем?
                </summary>
                <p className="mt-2">{favoriteCategory.explain || 'нет данных'}</p>
              </details>
            </div>
          </div>
        </div>

        <section className="mb-12">
          <div className="rounded-2xl bg-white border border-[#EAE6EF] p-6 lg:p-8 shadow-sm">
            <div className="flex flex-col gap-2 mb-6">
              <h2 className="text-2xl font-bold text-[#111827]">Personal details</h2>
              <p className="text-sm text-[#6B7280]">
                Optional fields. You can fill them now, later, or leave them empty.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="profile-first-name" className="block text-sm font-medium text-gray-700 mb-2">
                  First name
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
                    placeholder="Enter first name"
                    disabled={isPersonalDetailsSaving}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="profile-last-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Last name
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
                    placeholder="Enter last name"
                    disabled={isPersonalDetailsSaving}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
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
                  City
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
                    placeholder="Enter city"
                    disabled={isPersonalDetailsSaving}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <Mail className="w-4 h-4" />
                <span className="break-all">
                  Email: <span className="font-medium text-[#111827]">{user?.email || 'not set'}</span>
                </span>
              </div>

              <Button
                variant="primary"
                onClick={() => void handleSavePersonalDetails()}
                disabled={isPersonalDetailsSaving}
              >
                {isPersonalDetailsSaving ? 'Saving...' : 'Save details'}
              </Button>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#111827] mb-6">Ваш персональный оффер</h2>

          <OfferCard
            status={offerStatus}
            title={offer?.offerName}
            description={mapOfferDescription(offer?.target)}
            expiresAt={formatDateRu(offer?.expiresAt)}
            discountType={offer?.offerType === 'points_multiplier' ? 'points' : offer?.offerType === 'gift' ? 'gift' : 'percentage'}
            discountValue={offer?.value}
            onApply={async () => {
              if (!offer) return;
              try {
                // POST /api/offers/click :contentReference[oaicite:25]{index=25}
                await clickOffer(offer.assignmentId, { source: 'profile_page' });
                toast.success('Оффер отмечен. Применение будет на этапе корзины/checkout.');
              } catch (e) {
                // не блокируем UX
              }
            }}
          />
        </section>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFE1F2] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#FF4DB8]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#111827]">Специально для вас</h2>
                <p className="text-sm text-[#6B7280]">Рекомендации на основе вашего профиля</p>
              </div>
            </div>
            <Button variant="ghost">Смотреть всё</Button>
          </div>

          <ProductCarousel products={recommendations} />
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#111827] mb-6">Управление</h2>
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
              <h3 className="text-base font-bold text-[#111827] mb-1">Моя рутина</h3>
              <p className="text-sm text-[#6B7280]">Персональный план ухода на основе вашего профиля</p>
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
              <p className="text-sm text-[#6B7280]">Пошаговый план построения идеальной бьюти-рутины</p>
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
              <h3 className="text-base font-bold text-[#111827] mb-1">Мои товары</h3>
              <p className="text-sm text-[#6B7280]">Управление купленными товарами и заметки</p>
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
              <h3 className="text-base font-bold text-[#111827] mb-1">История транзакций</h3>
              <p className="text-sm text-[#6B7280]">Ваши покупки и начисления баллов</p>
            </Link>
          </div>
        </section>
      </div>

      <Dialog.Root open={wizardOpen} onOpenChange={setWizardOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-in fade-in" />
          <Dialog.Content
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in"
            aria-describedby={undefined}
          >
            <Dialog.Title className="sr-only">Анкета профиля</Dialog.Title>

            <ProfileWizard
              onComplete={async (data: ProfileWizardData) => {
                const payload = {
                  skin_type: mapSkinType(data.skinType?.[0]),
                  goals: mapListValues(data.goals, GOAL_MAP),
                  avoid_flags: mapListValues(data.avoidFlags, AVOID_FLAG_MAP),
                  budget: mapBudgetEnum(data.budgetMax),
                  hair_profile: data.hairProfile ?? {},
                  makeup_profile: data.makeupProfile ?? {},
                  fragrance_profile: data.fragranceProfile ?? {},
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
                    toast.success(`Профиль сохранён. +${pointsAdded} баллов`);
                  } else {
                    toast.success('Профиль сохранён');
                  }

                  setWizardOpen(false);
                } catch (error) {
                  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
                    navigate('/login', { replace: true, state: { from: location.pathname } });
                    return;
                  }
                  if (error instanceof Error) toast.error(error.message);
                }
              }}
              onClose={() => setWizardOpen(false)}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
