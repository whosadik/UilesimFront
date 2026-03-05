import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { PromoBannerCard } from '../components/PromoBannerCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorState } from '../components/ErrorState';
import { listMyOffers, nextOffer } from '../../shared/api/offers';
import { ApiError } from '../../shared/api/ApiError';

type PromotionFilter = 'all' | 'discount' | 'points' | 'gift' | 'personal';

type PromotionCard = {
  id: string;
  title: string;
  description: string;
  badge: string;
  type: PromotionFilter;
};

const FALLBACK_PROMOTIONS: PromotionCard[] = [
  {
    id: 'fallback-discount',
    title: 'Скидки до −50%',
    description: 'На избранные товары категории Skincare',
    badge: 'Скидка',
    type: 'discount',
  },
  {
    id: 'fallback-points',
    title: '2× баллы на всё',
    description: 'Удвоенные баллы за каждую покупку в марте',
    badge: 'Баллы',
    type: 'points',
  },
  {
    id: 'fallback-gift',
    title: 'Подарок к заказу',
    description: 'Мини-формат при покупке от 3000 ₽',
    badge: 'Подарок',
    type: 'gift',
  },
  {
    id: 'fallback-personal',
    title: 'Персональный оффер',
    description: 'Эксклюзивная скидка 15% на уход',
    badge: 'Для вас',
    type: 'personal',
  },
];

const FILTER_LABELS: Record<PromotionFilter, string> = {
  all: 'Все',
  discount: 'Скидки',
  points: '2× баллы',
  gift: 'Подарок',
  personal: 'Персональные',
};

const toRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

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

const extractOfferItems = (payload: unknown): Record<string, unknown>[] => {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is Record<string, unknown> => Boolean(toRecord(item)));
  }

  const single = toRecord(payload);
  return single ? [single] : [];
};

const toFilterType = (offerType: string): PromotionFilter => {
  if (offerType === 'discount') {
    return 'discount';
  }
  if (offerType === 'points_multiplier') {
    return 'points';
  }
  if (offerType === 'gift') {
    return 'gift';
  }
  return 'personal';
};

const toBadge = (type: PromotionFilter): string => {
  if (type === 'discount') {
    return 'Скидка';
  }
  if (type === 'points') {
    return 'Баллы';
  }
  if (type === 'gift') {
    return 'Подарок';
  }
  return 'Для вас';
};

const formatTitle = (type: PromotionFilter, offerName: string | null, offerValue: number | undefined): string => {
  if (offerName) {
    return offerName;
  }

  if (type === 'discount' && offerValue !== undefined) {
    return `Скидка ${Math.round(offerValue)}%`;
  }
  if (type === 'points' && offerValue !== undefined) {
    return `${Math.round(offerValue)}× баллы`;
  }
  if (type === 'gift') {
    return 'Подарок к заказу';
  }

  return 'Персональное предложение';
};

const formatDescription = (reason: Record<string, unknown> | null, target: Record<string, unknown> | null): string => {
  if (reason && typeof reason.message === 'string' && reason.message.trim()) {
    return reason.message;
  }
  if (reason && typeof reason.picked_because === 'string' && reason.picked_because.trim()) {
    return reason.picked_because;
  }

  const category = target && typeof target.category === 'string' ? target.category : null;
  const productType = target && typeof target.product_type === 'string' ? target.product_type : null;

  if (category && productType) {
    return `Спецпредложение для категории ${category} (${productType}).`;
  }
  if (category) {
    return `Спецпредложение для категории ${category}.`;
  }
  if (productType) {
    return `Спецпредложение для типа продукта ${productType}.`;
  }

  return 'Специальное предложение доступно для вас прямо сейчас.';
};

const mapApiOfferToPromotion = (item: Record<string, unknown>, index: number): PromotionCard => {
  const offer = toRecord(item.offer);
  const reason = toRecord(item.reason);
  const target = toRecord(item.target);
  const offerType = typeof offer?.type === 'string' ? offer.type : 'personal';
  const type = toFilterType(offerType);
  const offerName = typeof offer?.name === 'string' && offer.name.trim() ? offer.name : null;
  const offerValue = toNumber(offer?.value);

  return {
    id:
      item.assignment_id !== undefined && item.assignment_id !== null
        ? String(item.assignment_id)
        : `promo-${index}`,
    title: formatTitle(type, offerName, offerValue),
    description: formatDescription(reason, target),
    badge: toBadge(type),
    type,
  };
};

export default function PromotionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [filter, setFilter] = useState<PromotionFilter>('all');
  const [promotions, setPromotions] = useState<PromotionCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadPromotions = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const offers = await listMyOffers();
        let mapped = extractOfferItems(offers).map(mapApiOfferToPromotion);

        if (mapped.length === 0) {
          const next = await nextOffer();
          mapped = extractOfferItems(next).map(mapApiOfferToPromotion);
        }

        if (!cancelled) {
          setPromotions(mapped.length > 0 ? mapped : FALLBACK_PROMOTIONS);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        setPromotions([]);
        setLoadError('Не удалось загрузить акции из API. Попробуйте ещё раз.');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadPromotions();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, navigate, reloadKey]);

  const filteredPromotions = useMemo(
    () => promotions.filter((promo) => filter === 'all' || promo.type === filter),
    [filter, promotions],
  );

  return (
    <div className="pt-20 lg:pt-28 min-h-screen">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Акции' }]} />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#111827] mb-3">Акции</h1>
          <p className="text-base text-[#6B7280]">Специальные предложения и промо</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {(Object.keys(FILTER_LABELS) as PromotionFilter[]).map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === value
                  ? 'bg-[#111827] text-white'
                  : 'bg-gray-50 text-[#6B7280] hover:bg-gray-100'
              }`}
            >
              {FILTER_LABELS[value]}
            </button>
          ))}
        </div>

        {isLoading ? (
          <LoadingSpinner size="md" text="Загружаем акции..." />
        ) : loadError ? (
          <ErrorState
            title="Не удалось загрузить акции"
            description={loadError}
            onRetry={() => setReloadKey((value) => value + 1)}
          />
        ) : filteredPromotions.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredPromotions.map((promo) => (
              <PromoBannerCard key={promo.id} {...promo} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[#EAE6EF] bg-white p-6 text-sm text-[#6B7280]">
            Для выбранного фильтра акции пока не найдены.
          </div>
        )}
      </div>

      <div className="hidden">
        {/* Sources: GET /api/me/offers and GET /api/me/next-offer */}
      </div>
    </div>
  );
}
