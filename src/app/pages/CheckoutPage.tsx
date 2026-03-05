import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { CheckCircle, Sparkles, ArrowRight, Map, TrendingUp, Star, ChevronRight } from 'lucide-react';
import { ApiError } from '../../shared/api/ApiError';
import { listTransactions } from '../../shared/api/transactions';
import { getLoyalty } from '../../shared/api/me';
import { nextOffer } from '../../shared/api/offers';

/**
 * DEV NOTES:
 * Endpoints:
 * - GET /api/transactions/
 * - GET /api/me/loyalty
 * - GET /api/me/next-offer
 * /api/checkout response snapshot в этом роуте недоступен напрямую, поэтому
 * часть полей остаётся fallback до появления endpoint с деталями последнего checkout.
 */

type TierName = 'bronze' | 'silver' | 'gold' | 'platinum';

type CheckoutResult = {
  transactionId: string;
  grossAmount: number;
  discount: number;
  pointsUsed: number;
  netAmount: number;
  pointsEarned: number;
  previousBalance: number;
  newPointsBalance: number;
  tier: TierName;
  tierUpgraded: boolean;
  newTier: string;
};

type RoadmapStep = {
  stepNum: number;
  totalSteps: number;
  title: string;
  description: string;
  productName: string;
  productId: string;
  pointsBonus: number;
};

type NextRecommendation = {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  pointsEarned: number;
  why: string;
};

const FALLBACK_RESULT: CheckoutResult = {
  transactionId: 'TXN-2026-03-12345',
  grossAmount: 2749,
  discount: 412,
  pointsUsed: 0,
  netAmount: 2337,
  pointsEarned: 275,
  previousBalance: 1247,
  newPointsBalance: 1522,
  tier: 'gold',
  tierUpgraded: true,
  newTier: 'Platinum',
};

const FALLBACK_NEXT_ROADMAP_STEP: RoadmapStep = {
  stepNum: 3,
  totalSteps: 5,
  title: 'Увлажнение',
  description: 'Добавьте крем в рутину — шаг 3 из 5',
  productName: 'Ceramide Moisturizer CeraVe',
  productId: '3',
  pointsBonus: 145,
};

const FALLBACK_NEXT_REC: NextRecommendation = {
  id: '5',
  name: 'SPF 50 Солнцезащитный крем',
  brand: 'La Roche-Posay',
  price: 1890,
  image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80',
  pointsEarned: 189,
  why: 'Шаг 4 вашего Roadmap',
};

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
  if (normalized === 'bronze' || normalized === 'silver' || normalized === 'gold' || normalized === 'platinum') {
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

const extractOfferTargetProductId = (value: unknown): string | undefined => {
  if (!isRecord(value) || !isRecord(value.target)) {
    return undefined;
  }

  const target = value.target;
  if (target.scope !== 'product_id') {
    return undefined;
  }

  const targetValue = target.value;
  if (typeof targetValue === 'number' || typeof targetValue === 'string') {
    return String(targetValue);
  }

  return undefined;
};

const TIERS = [
  { name: 'Bronze', min: 0, color: '#CD7F32' },
  { name: 'Silver', min: 500, color: '#9CA3AF' },
  { name: 'Gold', min: 1000, color: '#F59E0B' },
  { name: 'Platinum', min: 1500, color: '#6366F1' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPoints, setShowPoints] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [result, setResult] = useState<CheckoutResult>(FALLBACK_RESULT);
  const [nextRoadmapStep, setNextRoadmapStep] = useState<RoadmapStep>(FALLBACK_NEXT_ROADMAP_STEP);
  const [nextRec, setNextRec] = useState<NextRecommendation>(FALLBACK_NEXT_REC);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Staggered animation
  useEffect(() => {
    const t1 = setTimeout(() => setShowPoints(true), 600);
    const t2 = setTimeout(() => setShowNext(true), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadCheckoutData = async () => {
      setIsDataLoading(true);
      setLoadError(null);

      const [transactionsResult, loyaltyResult, offerResult] = await Promise.allSettled([
        listTransactions({ page_size: 1 }),
        getLoyalty(),
        nextOffer(),
      ]);

      if (cancelled) {
        return;
      }

      const rejectedReasons: unknown[] = [];
      for (const item of [transactionsResult, loyaltyResult, offerResult]) {
        if (item.status === 'rejected') {
          rejectedReasons.push(item.reason);
        }
      }

      const authError = rejectedReasons.find(
          (error) =>
            error instanceof ApiError &&
            (error.status === 401 || error.status === 403),
      );

      if (authError) {
        setIsDataLoading(false);
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }

      const nextResult: CheckoutResult = { ...FALLBACK_RESULT };

      if (transactionsResult.status === 'fulfilled' && transactionsResult.value.length > 0) {
        const latestTransaction = transactionsResult.value[0];

        const txId = formatTransactionId(latestTransaction.id);
        if (txId) {
          nextResult.transactionId = txId;
        }

        const txTotal = toNumber(latestTransaction.total_amount);
        if (txTotal !== undefined) {
          const rounded = Math.max(0, Math.round(txTotal));
          nextResult.grossAmount = rounded;
          nextResult.netAmount = rounded;
        }

        const txDiscount = toNumber(latestTransaction['discount_amount']);
        if (txDiscount !== undefined) {
          nextResult.discount = Math.max(0, Math.round(txDiscount));
        }

        const txPointsUsed = toNumber(latestTransaction.points_redeemed);
        if (txPointsUsed !== undefined) {
          nextResult.pointsUsed = Math.max(0, Math.round(txPointsUsed));
        }

        const txNet = toNumber(latestTransaction['net_total']);
        if (txNet !== undefined) {
          nextResult.netAmount = Math.max(0, Math.round(txNet));
        }

        const txPointsEarned = toNumber(latestTransaction.points_earned);
        if (txPointsEarned !== undefined) {
          nextResult.pointsEarned = Math.max(0, Math.round(txPointsEarned));
        }
      }

      if (loyaltyResult.status === 'fulfilled') {
        const balance = toNumber(loyaltyResult.value.points_balance);
        if (balance !== undefined) {
          nextResult.newPointsBalance = Math.max(0, Math.round(balance));
        }

        const tier = normalizeTier(loyaltyResult.value.tier);
        if (tier) {
          nextResult.tier = tier;
        }

        nextResult.previousBalance = Math.max(
          0,
          nextResult.newPointsBalance - nextResult.pointsEarned + nextResult.pointsUsed,
        );
      }

      const nextRoadmap: RoadmapStep = { ...FALLBACK_NEXT_ROADMAP_STEP };
      const nextRecommendation: NextRecommendation = { ...FALLBACK_NEXT_REC };

      if (offerResult.status === 'fulfilled') {
        const offer = offerResult.value;
        const offerProductId = extractOfferTargetProductId(offer);

        if (offerProductId) {
          nextRoadmap.productId = offerProductId;
          nextRoadmap.productName = `Товар #${offerProductId}`;

          nextRecommendation.id = offerProductId;
          nextRecommendation.why = 'Персональный оффер';
          nextRecommendation.name = `Рекомендуемый товар #${offerProductId}`;
        }
      }

      setResult(nextResult);
      setNextRoadmapStep(nextRoadmap);
      setNextRec(nextRecommendation);

      if (
        transactionsResult.status === 'rejected' &&
        loyaltyResult.status === 'rejected' &&
        offerResult.status === 'rejected'
      ) {
        setLoadError('Не удалось загрузить данные оформления. Попробуйте ещё раз.');
      }

      setIsDataLoading(false);
    };

    loadCheckoutData().catch(() => {
      if (!cancelled) {
        setLoadError('Не удалось загрузить данные оформления. Попробуйте ещё раз.');
        setIsDataLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [location.pathname, navigate, retryKey]);

  const currentTier = TIERS.find(t => t.name.toLowerCase() === result.tier) || TIERS[2];
  const nextTierData = TIERS[TIERS.indexOf(currentTier) + 1];
  const progressPct = nextTierData
    ? Math.min(100, ((result.newPointsBalance - currentTier.min) / (nextTierData.min - currentTier.min)) * 100)
    : 100;

  return (
    <div className="pt-20 lg:pt-28 min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-[700px] mx-auto px-6 py-8 lg:py-12">

        {/* ─── Success Header ────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            {result.tierUpgraded && (
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[#FF4DB8] flex items-center justify-center animate-bounce">
                <Star className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <h1 className="text-3xl font-semibold text-[#111827] mb-2">Заказ оформлен!</h1>
          <p className="text-[#6B7280]">
            Номер: <span className="font-semibold text-[#111827]">{result.transactionId}</span>
          </p>
        </div>

        {isDataLoading && (
          <div className="mb-4 p-3 rounded-xl border border-[#EAE6EF] bg-white text-sm text-[#6B7280]">
            Загружаем данные заказа...
          </div>
        )}

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

        {/* ─── Tier Upgrade Banner ───────────────────────── */}
        {result.tierUpgraded && (
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 text-center">
            <p className="text-xs text-violet-500 font-semibold uppercase tracking-wide mb-1">Поздравляем!</p>
            <p className="text-base font-semibold text-[#111827] mb-0.5">
              Вы достигли уровня <span className="text-violet-600">{result.newTier}</span>! 🎉
            </p>
            <p className="text-sm text-[#6B7280]">Открыты эксклюзивные привилегии и повышенный кэшбэк</p>
          </div>
        )}

        {/* ─── Order Summary ─────────────────────────────── */}
        <div className="p-6 rounded-2xl bg-white border border-[#EAE6EF] mb-4 space-y-3">
          <h2 className="text-base font-semibold text-[#111827] mb-4">Детали заказа</h2>

          <div className="space-y-2.5 pb-3 border-b border-[#EAE6EF]">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">Товары</span>
              <span className="font-semibold text-[#111827]">{result.grossAmount.toLocaleString('ru')} ₸</span>
            </div>
            {result.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Скидка −15%</span>
                <span className="font-semibold text-[#FF4DB8]">−{result.discount.toLocaleString('ru')} ₸</span>
              </div>
            )}
            {result.pointsUsed > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Списано баллов</span>
                <span className="font-semibold text-[#FF4DB8]">−{result.pointsUsed.toLocaleString('ru')} ₸</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-baseline pt-1">
            <span className="font-semibold text-[#111827]">Итого оплачено</span>
            <span className="text-2xl font-bold text-[#111827]">{result.netAmount.toLocaleString('ru')} ₸</span>
          </div>
        </div>

        {/* ─── Points Earned (animated) ──────────────────── */}
        <div
          className={`mb-4 p-5 rounded-2xl bg-white border border-[#EAE6EF] transition-all duration-700 ${
            showPoints ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-[#6B7280] mb-1">Начислено баллов</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#FF4DB8]">+{result.pointsEarned}</span>
                <span className="text-sm text-[#6B7280]">баллов</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#6B7280] mb-1">Новый баланс</p>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-[#6B7280] line-through">{result.previousBalance.toLocaleString('ru')}</span>
                <span className="text-base font-bold text-[#111827]">{result.newPointsBalance.toLocaleString('ru')}</span>
                <Sparkles className="w-4 h-4 text-[#FF4DB8]" />
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {nextTierData && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs text-[#6B7280]">
                  До <span className="font-semibold" style={{ color: nextTierData.color }}>{nextTierData.name}</span>
                </p>
                <p className="text-xs font-semibold text-[#111827]">
                  {Math.max(0, nextTierData.min - result.newPointsBalance)} баллов
                </p>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${progressPct}%`, backgroundColor: currentTier.color }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ─── Next Step (animated) ──────────────────────── */}
        <div
          className={`mb-6 transition-all duration-700 delay-200 ${
            showNext ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Следующий рекомендуемый шаг</p>

          {/* Roadmap next step */}
          <Link to="/me/roadmap" className="block group mb-3">
            <div className="p-4 rounded-2xl bg-[#111827] hover:bg-[#0B1220] transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Map className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-xs text-white/60">Roadmap · Шаг {nextRoadmapStep.stepNum}/{nextRoadmapStep.totalSteps}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF4DB8]/20 text-[#FF4DB8] font-medium">
                      +{nextRoadmapStep.pointsBonus} б.
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white mb-0.5">{nextRoadmapStep.title}</p>
                  <p className="text-xs text-white/60">{nextRoadmapStep.productName}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors flex-shrink-0 mt-1" />
              </div>
            </div>
          </Link>

          {/* Rec product */}
          <Link to={`/product/${nextRec.id}`} className="block group">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#EAE6EF] hover:shadow-md transition-all">
              <img src={nextRec.image} alt={nextRec.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFE1F2] text-[#FF4DB8] text-[10px] font-medium mb-1">
                  ✦ {nextRec.why}
                </span>
                <p className="text-xs text-[#6B7280]">{nextRec.brand}</p>
                <p className="text-sm font-semibold text-[#111827] line-clamp-1">{nextRec.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-sm font-bold text-[#111827]">{nextRec.price.toLocaleString('ru')} ₸</span>
                  <span className="text-xs text-[#FF4DB8]">+{nextRec.pointsEarned} б.</span>
                </div>
              </div>
              <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-[#111827] text-white group-hover:bg-[#0B1220] transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>

        {/* ─── Actions ───────────────────────────────────── */}
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

        <p className="mt-6 text-center text-xs text-[#6B7280]">
          Детали заказа отправлены на вашу почту
        </p>
      </div>
    </div>
  );
}
