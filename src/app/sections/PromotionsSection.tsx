import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { CarouselHeader } from '../components/CarouselHeader';
import { PromoBannerCard } from '../components/PromoBannerCard';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { ApiError } from '../../shared/api/ApiError';
import { clickOffer, nextOffer } from '../../shared/api/offers';

type PromoCardItem = {
  id: string;
  title: string;
  description: string;
  badge?: string;
  buttonText?: string;
  onClick?: () => void;
};

const FALLBACK_PROMOS: PromoCardItem[] = [
  {
    id: 'fallback-discount',
    title: 'Скидки до 50%',
    description: 'На избранные позиции по уходу за кожей.',
    badge: 'Скидка',
    buttonText: 'Открыть',
  },
  {
    id: 'fallback-points',
    title: '2x баллы на уход',
    description: 'Удвоенные бонусы на категорию skincare.',
    badge: 'Бонусы',
    buttonText: 'Активировать',
  },
  {
    id: 'fallback-gift',
    title: 'Подарок за заказ',
    description: 'Миниатюра при покупке от 25 000 тг.',
    badge: 'Подарок',
    buttonText: 'Подробнее',
  },
  {
    id: 'fallback-weekend',
    title: 'Предложения выходного дня',
    description: 'Специальные условия на ограниченный период.',
    badge: 'Хит',
    buttonText: 'Смотреть',
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toNumber(value: unknown): number | undefined {
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
}

function buildOfferDescription(payload: Record<string, unknown>): string {
  const target = isRecord(payload.target) ? payload.target : null;
  const scope = typeof target?.scope === 'string' ? target.scope : undefined;

  if (scope === 'category' && typeof target?.category === 'string') {
    return `Действует на категорию ${target.category}.`;
  }

  if (scope === 'product_type' && typeof target?.product_type === 'string') {
    return `Действует на тип товаров: ${target.product_type}.`;
  }

  if (scope === 'product_id') {
    return 'Действует на выбранный товар.';
  }

  const value = toNumber(isRecord(payload.offer) ? payload.offer.value : undefined);
  if (value !== undefined) {
    return `Персональное предложение со значением ${value}.`;
  }

  return 'Персональное предложение подобрано для вас.';
}

function mapNextOfferToPromo(
  payload: unknown,
  onClick: () => void,
): PromoCardItem | null {
  if (!isRecord(payload)) {
    return null;
  }

  const offer = isRecord(payload.offer) ? payload.offer : null;
  const assignmentId = toNumber(payload.assignment_id);

  if (!offer || assignmentId === undefined) {
    return null;
  }

  const offerName = typeof offer.name === 'string' && offer.name.trim() ? offer.name.trim() : 'Персональный оффер';
  const offerType = typeof offer.type === 'string' ? offer.type : undefined;
  const title = offerType === 'discount' ? `Скидка: ${offerName}` : offerName;

  return {
    id: `offer-${assignmentId}`,
    title,
    description: buildOfferDescription(payload),
    badge: 'Оффер',
    buttonText: 'Открыть',
    onClick,
  };
}

export function PromotionsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [promos, setPromos] = useState<PromoCardItem[]>(FALLBACK_PROMOS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadOffer = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const payload = await nextOffer();

        if (cancelled) {
          return;
        }

        const assignmentId = toNumber(isRecord(payload) ? payload.assignment_id : undefined);

        const onClick = async () => {
          if (assignmentId === undefined) {
            return;
          }

          try {
            await clickOffer(Math.round(assignmentId), { source: 'home_promotions' });
          } catch (clickError) {
            if (clickError instanceof ApiError && (clickError.status === 401 || clickError.status === 403)) {
              navigate('/login', { replace: true, state: { from: location.pathname } });
            }
          }
        };

        const dynamicPromo = mapNextOfferToPromo(payload, () => {
          void onClick();
        });

        if (dynamicPromo) {
          setPromos([dynamicPromo, ...FALLBACK_PROMOS.slice(0, 3)]);
        } else {
          setPromos(FALLBACK_PROMOS);
        }
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        if (loadError instanceof ApiError && (loadError.status === 401 || loadError.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        setPromos(FALLBACK_PROMOS);
        setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить акции');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadOffer();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, navigate, retryKey]);

  return (
    <section className="py-12 bg-gradient-to-b from-white to-pink-50/30">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
        <CarouselHeader title="Акции и предложения" />

        {error ? (
          <ErrorState
            title="Не удалось загрузить акции"
            description="Произошла ошибка при загрузке персонального оффера. Попробуйте ещё раз."
            onRetry={() => setRetryKey((value) => value + 1)}
          />
        ) : !isLoading && promos.length === 0 ? (
          <EmptyState
            title="Акций пока нет"
            description="Сейчас нет доступных предложений. Проверьте позже."
            action={{
              label: 'Обновить',
              onClick: () => setRetryKey((value) => value + 1),
            }}
          />
        ) : (
          <>
            <div
              ref={scrollRef}
              className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 snap-x snap-mandatory"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {isLoading
                ? [...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className="min-w-[280px] md:min-w-[320px] rounded-2xl border border-[#FF4DB8]/20 bg-gradient-to-br from-[#FFE1F2] to-pink-50 p-6 animate-pulse"
                    >
                      <div className="h-4 w-20 bg-white/80 rounded mb-4" />
                      <div className="h-7 w-2/3 bg-white/80 rounded mb-3" />
                      <div className="h-4 w-full bg-white/70 rounded mb-2" />
                      <div className="h-4 w-4/5 bg-white/70 rounded mb-6" />
                      <div className="h-10 w-32 bg-white rounded-xl" />
                    </div>
                  ))
                : promos.map((promo) => <PromoBannerCard key={promo.id} {...promo} />)}
            </div>

            <div className="lg:hidden relative -mt-4 h-4">
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-pink-50/30 via-pink-50/20 to-transparent pointer-events-none" />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
