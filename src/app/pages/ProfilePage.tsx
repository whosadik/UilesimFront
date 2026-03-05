import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ProfileSummaryCard } from '../components/ProfileSummaryCard';
import { OfferCard } from '../components/OfferCard';
import { ProductCarousel } from '../components/ProductCarousel';
import { Button } from '../components/Button';
import { ProfileWizard } from '../components/ProfileWizard';
import { Sparkles, Heart, ChevronRight, Package, Receipt, Map, Clock } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { useAuth } from '../../shared/auth/AuthContext';
import { ApiError } from '../../shared/api/ApiError';
import { getFavoriteCategory, getLoyalty, getProfile, updateProfile } from '../../shared/api/me';
import { home } from '../../shared/api/recommendations';

// TODO: добавь/импортни из своего api слоя (пример ниже в разделе 3)
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
  totalSpent: number;      // TODO: нет в API
  productsBought: number;  // TODO: нет в API
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

  const [loyalty, setLoyaltyState] = useState({
    tier: 'bronze' as const,
    points: 0,
  });

  const [favoriteCategory, setFavoriteCategory] = useState<FavoriteCategoryState>({
    category: '',
    totalSpent: 0,       // TODO: нет в API
    productsBought: 0,   // TODO: нет в API
    explain: '',
  });

  const [recommendations, setRecommendations] = useState<RecommendationCard[]>([]);
  const [offer, setOffer] = useState<OfferState | null>(null);

  const offerStatus = useMemo<'active' | 'none' | 'expired'>(() => {
    if (!offer) return 'none';
    if (offer.expiresAt) {
      const d = new Date(offer.expiresAt);
      if (!Number.isNaN(d.getTime()) && d.getTime() < Date.now()) return 'expired';
    }
    return 'active';
  }, [offer]);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }

    let cancelled = false;

    const load = async () => {
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
        const profileName = user.username || '';

        setProfileSummary({
          name: profileName,
          initials: profileName.charAt(0).toUpperCase(),
          completionPercentage: calcCompletion(profileObj),
        });

        const loyaltyObj = isRecord(loyaltyResp) ? loyaltyResp : {};
        setLoyaltyState({
          tier: mapTier(loyaltyObj.tier),
          points: Number(loyaltyObj.points_balance) || 0,
        });

        const favObj = isRecord(favResp) ? favResp : {};
        const explainObj = isRecord(favObj.explain) ? favObj.explain : null;

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

        setFavoriteCategory((prev) => ({
          ...prev,
          category: typeof favObj.favorite_category === 'string' ? favObj.favorite_category : '',
          explain: explainText,
          // totalSpent / productsBought — оставить как есть (нет в API)
        }));

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
        if (error instanceof Error) toast.error(error.message);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, location.pathname, navigate, user]);

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
              <p className="text-2xl font-bold text-[#FF4DB8]">{favoriteCategory.category}</p>

              {/* TODO: totalSpent/productsBought нет в API ответа /api/me/favorite-category :contentReference[oaicite:24]{index=24} */}
              <div className="space-y-1 text-sm text-[#6B7280]">
                <p>{favoriteCategory.productsBought} покупок</p>
                <p>{favoriteCategory.totalSpent.toLocaleString()} ₽ потрачено</p>
              </div>

              <details className="text-xs text-[#6B7280] pt-2 border-t border-[#EAE6EF]">
                <summary className="cursor-pointer hover:text-[#FF4DB8] transition-colors">
                  Как мы считаем?
                </summary>
                <p className="mt-2">{favoriteCategory.explain}</p>
              </details>
            </div>
          </div>
        </div>

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
                // PUT /api/me/profile :contentReference[oaicite:26]{index=26}
                const payload = {
                  skin_type: data.skinType?.[0] ?? 'normal',
                  goals: data.goals ?? [],
                  avoid_flags: data.avoidFlags ?? [],
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

                  const profileObj = Object.keys(updatedProfile || {}).length > 0 ? updatedProfile : await getProfile();
                  const loyaltyObj = await getLoyalty();

                  setProfileSummary({
                    name: user?.username || '',
                    initials: (user?.username?.charAt(0) || '').toUpperCase(),
                    completionPercentage: calcCompletion(isRecord(profileObj) ? profileObj : {}),
                  });

                  const l = isRecord(loyaltyObj) ? loyaltyObj : {};
                  setLoyaltyState({
                    tier: mapTier(l.tier),
                    points: Number(l.points_balance) || 0,
                  });

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