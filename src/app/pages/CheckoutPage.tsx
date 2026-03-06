import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ArrowRight, CheckCircle, ChevronRight, Map, Sparkles } from 'lucide-react';
import { ApiError } from '../../shared/api/ApiError';
import { preview } from '../../shared/api/checkout';
import { getLoyalty } from '../../shared/api/me';
import { nextOffer } from '../../shared/api/offers';
import { listTransactions } from '../../shared/api/transactions';

type TierName = 'bronze' | 'silver' | 'gold' | 'platinum';

type CheckoutResult = {
  transactionId: string;
  grossAmount: number;
  discount: number;
  pointsUsed: number;
  netAmount: number;
  pointsEarned: number;
  pointsBalance?: number;
  tier?: TierName;
};

type NextOfferHint = {
  offerName?: string;
  productId?: string;
  expiresAt?: string;
};

type LocationCheckoutState = {
  checkoutCommit?: unknown;
  checkoutPreview?: unknown;
};

const TIERS = [
  { name: 'Bronze', min: 0, color: '#CD7F32' },
  { name: 'Silver', min: 500, color: '#9CA3AF' },
  { name: 'Gold', min: 1000, color: '#F59E0B' },
  { name: 'Platinum', min: 1500, color: '#6366F1' },
];

const FALLBACK_OFFER_IMAGE =
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80';

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

const normalizeTier = (value: unknown): TierName | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.toLowerCase();
  if (
    normalized === 'bronze' ||
    normalized === 'silver' ||
    normalized === 'gold' ||
    normalized === 'platinum'
  ) {
    return normalized;
  }

  return undefined;
};

const formatTransactionId = (value: unknown): string | undefined => {
  const numericId = toNumber(value);
  if (numericId === undefined) {
    return undefined;
  }
  return `TXN-${String(Math.round(numericId)).padStart(8, '0')}`;
};

const isAuthError = (error: unknown): boolean =>
  error instanceof ApiError && (error.status === 401 || error.status === 403);

const parseCheckoutResult = (
  payload: Record<string, unknown>,
  fallbackTransactionId?: string,
): CheckoutResult | null => {
  const gross = toNumber(payload.gross_total);
  const net = toNumber(payload.net_total);
  if (gross === undefined || net === undefined) {
    return null;
  }

  const discount = toNumber(payload.discount_amount) ?? 0;
  const pointsUsed = toNumber(payload.points_redeemed) ?? 0;
  const pointsEarned =
    toNumber(payload.points_earned) ??
    toNumber(payload.estimated_points_earned) ??
    0;
  const transactionId =
    formatTransactionId(payload.transaction_id ?? payload.id) ??
    fallbackTransactionId ??
    '—';

  return {
    transactionId,
    grossAmount: Math.max(0, Math.round(gross)),
    discount: Math.max(0, Math.round(discount)),
    pointsUsed: Math.max(0, Math.round(pointsUsed)),
    netAmount: Math.max(0, Math.round(net)),
    pointsEarned: Math.max(0, Math.round(pointsEarned)),
  };
};

const parsePreviewItemsFromTransaction = (
  transaction: Record<string, unknown>,
): Array<{ product: number; quantity: number }> => {
  const rawItems = Array.isArray(transaction.items) ? transaction.items : [];

  return rawItems
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const productId = toNumber(item.product);
      const quantity = toNumber(item.quantity) ?? 1;

      if (productId === undefined || quantity <= 0) {
        return null;
      }

      return {
        product: Math.round(productId),
        quantity: Math.max(1, Math.round(quantity)),
      };
    })
    .filter(
      (item): item is { product: number; quantity: number } =>
        item !== null,
    );
};

const parseNextOfferHint = (payload: unknown): NextOfferHint | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const offer = isRecord(payload.offer) ? payload.offer : null;
  const target = isRecord(payload.target) ? payload.target : null;
  const scope = typeof target?.scope === 'string' ? target.scope : '';

  const productId =
    scope === 'product_id' &&
    (typeof target?.value === 'number' || typeof target?.value === 'string')
      ? String(target.value)
      : undefined;

  const offerName =
    typeof offer?.name === 'string' && offer.name.trim().length > 0
      ? offer.name.trim()
      : undefined;

  const expiresAt =
    typeof payload.expires_at === 'string' && payload.expires_at
      ? payload.expires_at
      : undefined;

  if (!productId && !offerName && !expiresAt) {
    return null;
  }

  return { offerName, productId, expiresAt };
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [nextOfferHint, setNextOfferHint] = useState<NextOfferHint | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [showPoints, setShowPoints] = useState(false);
  const [showNext, setShowNext] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowPoints(true), 450);
    const t2 = setTimeout(() => setShowNext(true), 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [retryKey]);

  useEffect(() => {
    let cancelled = false;

    const fail = (message: string) => {
      if (!cancelled) {
        setResult(null);
        setLoadError(message);
      }
    };

    const loadCheckoutData = async () => {
      setIsDataLoading(true);
      setLoadError(null);

      try {
        const statePayload: LocationCheckoutState = isRecord(location.state)
          ? (location.state as LocationCheckoutState)
          : {};

        const stateCommit = isRecord(statePayload.checkoutCommit)
          ? statePayload.checkoutCommit
          : null;
        const statePreview = isRecord(statePayload.checkoutPreview)
          ? statePayload.checkoutPreview
          : null;

        const [loyaltyResult, offerResult] = await Promise.allSettled([
          getLoyalty(),
          nextOffer(),
        ]);

        const authError = [loyaltyResult, offerResult]
          .filter((item) => item.status === 'rejected')
          .map((item) => (item as PromiseRejectedResult).reason)
          .find(isAuthError);

        if (authError) {
          if (!cancelled) {
            navigate('/login', { replace: true, state: { from: location.pathname } });
          }
          return;
        }

        let checkoutPayload: Record<string, unknown> | null = stateCommit ?? statePreview;
        let transactionFallbackId: string | undefined;

        if (!checkoutPayload) {
          const latestTransactions = await listTransactions({ page_size: 1 });
          const latestTransaction = latestTransactions[0];

          if (!latestTransaction || !isRecord(latestTransaction)) {
            if (!cancelled) {
              setResult(null);
              setNextOfferHint(
                offerResult.status === 'fulfilled'
                  ? parseNextOfferHint(offerResult.value)
                  : null,
              );
            }
            return;
          }

          transactionFallbackId = formatTransactionId(latestTransaction.id);
          const previewItems = parsePreviewItemsFromTransaction(latestTransaction);

          if (previewItems.length === 0) {
            fail('В последней транзакции нет позиций для расчета preview.');
            return;
          }

          const previewResponse = await preview({
            channel:
              typeof latestTransaction.channel === 'string'
                ? latestTransaction.channel
                : 'online',
            items: previewItems,
          });

          checkoutPayload = isRecord(previewResponse)
            ? previewResponse
            : null;
        }

        if (!checkoutPayload) {
          fail('Не удалось получить данные checkout.');
          return;
        }

        const parsed = parseCheckoutResult(checkoutPayload, transactionFallbackId);
        if (!parsed) {
          fail(
            'Ответ /api/checkout/preview не содержит обязательные поля gross_total/net_total.',
          );
          return;
        }

        if (loyaltyResult.status === 'fulfilled') {
          const balance = toNumber(loyaltyResult.value.points_balance);
          if (balance !== undefined) {
            parsed.pointsBalance = Math.max(0, Math.round(balance));
          }

          const tier = normalizeTier(loyaltyResult.value.tier);
          if (tier) {
            parsed.tier = tier;
          }
        }

        if (!cancelled) {
          setResult(parsed);
          setNextOfferHint(
            offerResult.status === 'fulfilled'
              ? parseNextOfferHint(offerResult.value)
              : null,
          );
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (isAuthError(error)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        setResult(null);
        setLoadError(
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить данные оформления.',
        );
      } finally {
        if (!cancelled) {
          setIsDataLoading(false);
        }
      }
    };

    void loadCheckoutData();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, location.state, navigate, retryKey]);

  const currentTierData = useMemo(() => {
    if (!result?.tier) {
      return null;
    }
    return TIERS.find((item) => item.name.toLowerCase() === result.tier) ?? null;
  }, [result?.tier]);

  const nextTierData = useMemo(() => {
    if (!currentTierData) {
      return null;
    }
    const index = TIERS.indexOf(currentTierData);
    return TIERS[index + 1] ?? null;
  }, [currentTierData]);

  const previousBalance = useMemo(() => {
    if (!result || result.pointsBalance === undefined) {
      return undefined;
    }
    return Math.max(0, result.pointsBalance - result.pointsEarned + result.pointsUsed);
  }, [result]);

  const progressPct = useMemo(() => {
    if (
      !result ||
      result.pointsBalance === undefined ||
      !currentTierData ||
      !nextTierData
    ) {
      return null;
    }

    return Math.min(
      100,
      ((result.pointsBalance - currentTierData.min) /
        (nextTierData.min - currentTierData.min)) *
        100,
    );
  }, [currentTierData, nextTierData, result]);

  if (isDataLoading) {
    return (
      <div className="pt-20 lg:pt-28 min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-[700px] mx-auto px-6 py-8 lg:py-12">
          <div className="p-6 rounded-2xl bg-white border border-[#EAE6EF] text-sm text-[#6B7280]">
            Загружаем данные checkout...
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="pt-20 lg:pt-28 min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-[700px] mx-auto px-6 py-8 lg:py-12">
          <div className="p-6 rounded-2xl bg-white border border-[#EAE6EF]">
            <h1 className="text-2xl font-semibold text-[#111827] mb-2">
              Нет данных для страницы checkout
            </h1>
            <p className="text-sm text-[#6B7280] mb-4">
              Откройте checkout сразу после оформления заказа в корзине.
            </p>
            {loadError && (
              <p className="text-sm text-[#B42318] mb-4">{loadError}</p>
            )}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setRetryKey((value) => value + 1)}
                className="h-11 px-4 rounded-xl border border-[#EAE6EF] text-sm font-medium text-[#111827] hover:bg-gray-50 transition-colors"
              >
                Повторить
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="h-11 px-4 rounded-xl bg-[#111827] text-white text-sm font-medium hover:bg-[#0B1220] transition-colors"
              >
                Перейти в корзину
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 lg:pt-28 min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-[700px] mx-auto px-6 py-8 lg:py-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-semibold text-[#111827] mb-2">
            Заказ оформлен
          </h1>
          <p className="text-[#6B7280]">
            Номер: <span className="font-semibold text-[#111827]">{result.transactionId}</span>
          </p>
        </div>

        {loadError && (
          <div className="mb-4 p-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2]">
            <p className="text-sm text-[#B42318]">{loadError}</p>
            <button
              onClick={() => setRetryKey((value) => value + 1)}
              className="mt-2 text-xs font-medium text-[#111827] underline underline-offset-2"
            >
              Повторить
            </button>
          </div>
        )}

        <div className="p-6 rounded-2xl bg-white border border-[#EAE6EF] mb-4 space-y-3">
          <h2 className="text-base font-semibold text-[#111827] mb-4">
            Детали заказа
          </h2>

          <div className="space-y-2.5 pb-3 border-b border-[#EAE6EF]">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">Товары</span>
              <span className="font-semibold text-[#111827]">
                {result.grossAmount.toLocaleString('ru')} тг
              </span>
            </div>
            {result.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Скидка</span>
                <span className="font-semibold text-[#FF4DB8]">
                  -{result.discount.toLocaleString('ru')} тг
                </span>
              </div>
            )}
            {result.pointsUsed > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Списано баллов</span>
                <span className="font-semibold text-[#FF4DB8]">
                  -{result.pointsUsed.toLocaleString('ru')} тг
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-baseline pt-1">
            <span className="font-semibold text-[#111827]">Итого оплачено</span>
            <span className="text-2xl font-bold text-[#111827]">
              {result.netAmount.toLocaleString('ru')} тг
            </span>
          </div>
        </div>

        <div
          className={`mb-4 p-5 rounded-2xl bg-white border border-[#EAE6EF] transition-all duration-700 ${
            showPoints ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-[#6B7280] mb-1">Начислено баллов</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#FF4DB8]">
                  +{result.pointsEarned}
                </span>
                <span className="text-sm text-[#6B7280]">баллов</span>
              </div>
            </div>

            {result.pointsBalance !== undefined && (
              <div className="text-right">
                <p className="text-xs text-[#6B7280] mb-1">Баланс сейчас</p>
                <div className="flex items-center gap-1.5 justify-end">
                  {previousBalance !== undefined && (
                    <span className="text-sm text-[#6B7280] line-through">
                      {previousBalance.toLocaleString('ru')}
                    </span>
                  )}
                  <span className="text-base font-bold text-[#111827]">
                    {result.pointsBalance.toLocaleString('ru')}
                  </span>
                  <Sparkles className="w-4 h-4 text-[#FF4DB8]" />
                </div>
              </div>
            )}
          </div>

          {currentTierData && nextTierData && progressPct !== null && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs text-[#6B7280]">
                  До{' '}
                  <span className="font-semibold" style={{ color: nextTierData.color }}>
                    {nextTierData.name}
                  </span>
                </p>
                <p className="text-xs font-semibold text-[#111827]">
                  {Math.max(0, nextTierData.min - (result.pointsBalance ?? 0))} баллов
                </p>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${progressPct}%`, backgroundColor: currentTierData.color }}
                />
              </div>
            </div>
          )}
        </div>

        <div
          className={`mb-6 transition-all duration-700 delay-200 ${
            showNext ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">
            Следующий шаг
          </p>

          <Link to="/me/roadmap" className="block group mb-3">
            <div className="p-4 rounded-2xl bg-[#111827] hover:bg-[#0B1220] transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Map className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/60 mb-0.5">Roadmap</p>
                  <p className="text-sm font-semibold text-white mb-0.5">
                    Откройте roadmap для следующего шага ухода
                  </p>
                  <p className="text-xs text-white/60">
                    Актуальные рекомендации берутся из API roadmap
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors flex-shrink-0 mt-1" />
              </div>
            </div>
          </Link>

          {nextOfferHint?.productId ? (
            <Link to={`/product/${nextOfferHint.productId}`} className="block group">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#EAE6EF] hover:shadow-md transition-all">
                <img
                  src={FALLBACK_OFFER_IMAGE}
                  alt="offer"
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFE1F2] text-[#FF4DB8] text-[10px] font-medium mb-1">
                    Персональный оффер
                  </span>
                  <p className="text-sm font-semibold text-[#111827] line-clamp-1">
                    {nextOfferHint.offerName ?? `Товар #${nextOfferHint.productId}`}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    ID товара: {nextOfferHint.productId}
                  </p>
                  {nextOfferHint.expiresAt && (
                    <p className="text-xs text-[#6B7280]">
                      До: {new Date(nextOfferHint.expiresAt).toLocaleString('ru')}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-[#111827] text-white group-hover:bg-[#0B1220] transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ) : (
            <div className="p-4 rounded-2xl bg-white border border-[#EAE6EF] text-sm text-[#6B7280]">
              Персональный оффер сейчас недоступен.
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/for-you')}
            className="h-12 rounded-xl border border-[#EAE6EF] text-[#111827] font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#FF4DB8]" />
            Мои рекомендации
          </button>
          <button
            onClick={() => navigate('/catalog')}
            className="h-12 rounded-xl bg-[#111827] text-white font-medium text-sm hover:bg-[#0B1220] transition-colors flex items-center justify-center gap-2"
          >
            Продолжить покупки
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
