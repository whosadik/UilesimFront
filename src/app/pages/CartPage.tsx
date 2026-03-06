import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Button } from '../components/Button';
import { Trash2, Sparkles, ShoppingBag, ArrowRight, ChevronRight, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '../../shared/api/ApiError';
import { preview } from '../../shared/api/checkout';
import { getLoyalty } from '../../shared/api/me';
import { nextOffer } from '../../shared/api/offers';

/**
 * DEV NOTES:
 * Endpoints:
 * - GET /api/me/loyalty
 * - GET /api/me/next-offer
 * - POST /api/checkout/preview
 * - POST /api/checkout
 * Cart items пока остаются локальным fallback: /api/me/cart отсутствует в OpenAPI/schema-map.
 */

interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
  pointsEarned: number;
}

interface CheckoutTotals {
  subtotal: number;
  discount: number;
  pointsDiscount: number;
  total: number;
  pointsEarned: number;
}

interface ActiveOffer {
  name: string;
  type?: string;
  value?: number;
  scope?: string;
  targetValue?: string;
  targetProductId?: string;
}

const POINTS_RATE = 0.1; // 10 баллов за 100 ₸

const LOYALTY_TIERS = [
  { name: 'Bronze', min: 0, color: '#CD7F32' },
  { name: 'Silver', min: 500, color: '#9CA3AF' },
  { name: 'Gold', min: 1000, color: '#F59E0B' },
  { name: 'Platinum', min: 1500, color: '#6366F1' },
];

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

const parseActiveOffer = (value: unknown): ActiveOffer | null => {
  if (!isRecord(value) || !isRecord(value.offer)) {
    return null;
  }

  const offerData = value.offer;
  const targetData = isRecord(value.target) ? value.target : null;
  const targetValue =
    targetData && (typeof targetData.value === 'number' || typeof targetData.value === 'string')
      ? String(targetData.value)
      : undefined;
  const scope = targetData && typeof targetData.scope === 'string' ? targetData.scope : undefined;

  return {
    name:
      (typeof offerData.name === 'string' && offerData.name.trim()) ||
      'Персональное предложение',
    type: typeof offerData.type === 'string' ? offerData.type : undefined,
    value: toNumber(offerData.value),
    scope,
    targetValue,
    targetProductId: scope === 'product_id' ? targetValue : undefined,
  };
};

function LoyaltyCartWidget({
  pointsEarned,
  currentBalance,
  tier,
}: {
  pointsEarned: number;
  currentBalance: number;
  tier: string;
}) {
  const newBalance = currentBalance + pointsEarned;
  const currentTier = LOYALTY_TIERS.find(t => t.name.toLowerCase() === tier) || LOYALTY_TIERS[2];
  const nextTier = LOYALTY_TIERS[LOYALTY_TIERS.indexOf(currentTier) + 1];
  const toNext = nextTier ? nextTier.min - newBalance : 0;
  const progressPct = nextTier
    ? Math.min(100, ((newBalance - currentTier.min) / (nextTier.min - currentTier.min)) * 100)
    : 100;

  return (
    <div className="p-5 rounded-2xl bg-white border border-[#EAE6EF]">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-[#FF4DB8]" />
        <h3 className="text-sm font-semibold text-[#111827]">Баллы за эту покупку</h3>
      </div>

      {/* Points earned */}
      <div className="flex items-center justify-between p-3 bg-[#FFE1F2] rounded-xl mb-4">
        <div>
          <p className="text-xs text-[#6B7280] mb-0.5">Начислим после покупки</p>
          <p className="text-lg font-bold text-[#FF4DB8]">+{pointsEarned} баллов</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#6B7280] mb-0.5">Новый баланс</p>
          <p className="text-sm font-semibold text-[#111827]">
            {currentBalance.toLocaleString('ru')} → <span className="text-[#FF4DB8]">{newBalance.toLocaleString('ru')}</span>
          </p>
        </div>
      </div>

      {/* Progress to next tier */}
      {nextTier && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-[#6B7280]">
              До <span className="font-semibold" style={{ color: nextTier.color }}>{nextTier.name}</span>
            </p>
            <p className="text-xs font-semibold text-[#111827]">{Math.max(0, toNext)} баллов</p>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%`, backgroundColor: currentTier.color }}
            />
          </div>
          {toNext <= 0 ? (
            <p className="text-xs text-emerald-600 font-medium">🎉 После этой покупки вы достигнете {nextTier.name}!</p>
          ) : (
            <p className="text-xs text-[#6B7280]">
              Добавьте товаров на <strong>{Math.ceil(toNext / (POINTS_RATE * 10)).toLocaleString('ru')} ₸</strong> и повысьте уровень
            </p>
          )}
        </div>
      )}

      {!nextTier && (
        <p className="text-xs text-purple-600 font-medium">✦ Вы на максимальном уровне Platinum!</p>
      )}
    </div>
  );
}

export default function CartPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Vitamin C Serum',
      brand: 'The Ordinary',
      price: 1299,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&q=80',
      pointsEarned: 130,
    },
    {
      id: '2',
      name: 'Ceramide Moisturizer',
      brand: 'CeraVe',
      price: 1450,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=200&q=80',
      pointsEarned: 145,
    },
  ]);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [previewTotals, setPreviewTotals] = useState<CheckoutTotals | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [availablePoints, setAvailablePoints] = useState(1247);
  const [currentTier, setCurrentTier] = useState('gold');
  const [activeOffer, setActiveOffer] = useState<ActiveOffer | null>(null);
  const [isMetaLoading, setIsMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [metaRetryKey, setMetaRetryKey] = useState(0);

  const updateQuantity = (id: string, newQty: number) => {
    setCartItems(items =>
      items.map(item => (item.id === id ? { ...item, quantity: Math.max(1, newQty) } : item))
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = Math.round(subtotal * 0.15);
  const pointsDiscount = pointsToUse;
  const total = subtotal - discount - pointsDiscount;
  const totalPointsEarned = cartItems.reduce((sum, item) => sum + item.pointsEarned * item.quantity, 0);

  const summarySubtotal = previewTotals?.subtotal ?? subtotal;
  const summaryDiscount = previewTotals?.discount ?? discount;
  const summaryPointsDiscount = previewTotals?.pointsDiscount ?? pointsDiscount;
  const summaryTotal = previewTotals?.total ?? total;
  const summaryPointsEarned = previewTotals?.pointsEarned ?? totalPointsEarned;

  useEffect(() => {
    let cancelled = false;

    const loadSidebarMeta = async () => {
      setIsMetaLoading(true);
      setMetaError(null);

      const [loyaltyResult, offerResult] = await Promise.allSettled([getLoyalty(), nextOffer()]);

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
        setActiveOffer(parseActiveOffer(offerResult.value));
      }

      if (loyaltyResult.status === 'rejected' && offerResult.status === 'rejected') {
        setMetaError('Не удалось загрузить данные лояльности. Попробуйте еще раз.');
      }

      setIsMetaLoading(false);
    };

    loadSidebarMeta().catch(() => {
      if (!cancelled) {
        setMetaError('Не удалось загрузить данные лояльности. Попробуйте еще раз.');
        setIsMetaLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [location.pathname, metaRetryKey, navigate]);

  useEffect(() => {
    setPointsToUse((value) => Math.min(value, availablePoints));
  }, [availablePoints]);

  const buildCheckoutItems = () =>
    cartItems
      .map((item) => ({
        product: Number(item.id),
        quantity: item.quantity,
      }))
      .filter((item) => Number.isFinite(item.product) && item.quantity > 0);

  useEffect(() => {
    if (cartItems.length === 0) {
      setPreviewTotals(null);
      return;
    }

    let cancelled = false;

    const loadPreview = async () => {
      const items = buildCheckoutItems();
      if (items.length === 0) {
        setPreviewTotals(null);
        return;
      }

      try {
        const response: any = await preview({
          channel: 'online',
          items,
          redeem_points: pointsToUse > 0 ? pointsToUse : undefined,
        });

        if (cancelled) {
          return;
        }

        const gross = toNumber(response.gross_total) ?? toNumber(response.subtotal) ?? subtotal;
        const appliedDiscount = toNumber(response.discount_amount) ?? toNumber(response.discount) ?? discount;
        const usedPoints = toNumber(response.points_redeemed) ?? pointsToUse;
        const net = toNumber(response.net_total) ?? total;
        const earned =
          toNumber(response.estimated_points_earned) ??
          toNumber(response.points_earned) ??
          totalPointsEarned;

        setPreviewTotals({
          subtotal: Math.max(0, Math.round(gross)),
          discount: Math.max(0, Math.round(appliedDiscount)),
          pointsDiscount: Math.max(0, Math.round(usedPoints)),
          total: Math.max(0, Math.round(net)),
          pointsEarned: Math.max(0, Math.round(earned)),
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        setPreviewTotals(null);
      }
    };

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, [cartItems, pointsToUse, navigate, location.pathname, subtotal, discount, total, totalPointsEarned]);

  const handleCheckout = async () => {
    const items = buildCheckoutItems();
    if (items.length === 0 || isCheckingOut) {
      return;
    }

    setIsCheckingOut(true);

    try {
      const previewResponse: any = await preview({
        channel: 'online',
        items,
        redeem_points: pointsToUse > 0 ? pointsToUse : undefined,
      });

      navigate('/checkout', {
        state: {
          checkoutPreview: previewResponse,
          items,
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
        toast.error('Не удалось получить предпросмотр checkout');
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  const fallbackOfferTitle = 'Скидка 15% применена';
  const offerTitle =
    activeOffer && activeOffer.type === 'discount' && activeOffer.value !== undefined
      ? `Активный оффер: ${activeOffer.value}%`
      : activeOffer?.name || fallbackOfferTitle;

  const offerDescription =
    summaryDiscount > 0
      ? `Выгода по расчету: ${summaryDiscount.toLocaleString('ru')} ₸`
      : activeOffer?.scope === 'cart'
        ? 'Оффер будет применен ко всей корзине при оформлении.'
        : activeOffer?.scope === 'product_id' && activeOffer.targetValue
          ? `Оффер действует на товар #${activeOffer.targetValue}.`
          : 'Оффер будет применен к подходящим товарам.';

  const upsellProductId = activeOffer?.targetProductId;
  const upsellActionProductId = upsellProductId || '4';
  const upsellTitle = upsellProductId
    ? `Добавьте товар #${upsellProductId} и используйте персональный оффер`
    : 'Добавьте еще на 201 ₸ и получите Platinum!';
  const upsellDescription = upsellProductId
    ? 'Этот товар отмечен в рамках активного оффера.'
    : 'SPF-крем за 890 ₸ - шаг 4 вашего Roadmap';

  return (
    <div className="pt-20 lg:pt-28 min-h-screen bg-gray-50">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Корзина' }]} />
        </div>

        <h1 className="text-3xl font-semibold text-[#111827] mb-8">Корзина</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-[#6B7280]" />
            </div>
            <p className="text-[#6B7280] mb-2 font-medium">Корзина пуста</p>
            <p className="text-sm text-[#6B7280] mb-6">Добавьте товары из рекомендаций или каталога</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="primary" onClick={() => navigate('/for-you')}>
                <Sparkles className="w-4 h-4 mr-2" />
                Мои рекомендации
              </Button>
              <Button variant="secondary" onClick={() => navigate('/catalog')}>
                Каталог
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-white border border-[#EAE6EF]">
                  <img src={item.image} alt={item.name} className="w-20 h-20 lg:w-24 lg:h-24 rounded-xl object-cover flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#6B7280] mb-0.5">{item.brand}</p>
                    <h3 className="text-sm font-semibold text-[#111827] mb-2 line-clamp-1">{item.name}</h3>
                    <p className="text-base font-bold text-[#111827]">{item.price.toLocaleString('ru')} ₸</p>
                    <p className="text-xs text-[#FF4DB8] mt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      +{item.pointsEarned * item.quantity} баллов
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[#6B7280] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center border border-[#EAE6EF] rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1.5 text-[#6B7280] hover:bg-gray-50 text-sm"
                      >
                        −
                      </button>
                      <span className="px-3 py-1.5 text-sm font-semibold text-[#111827]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1.5 text-[#6B7280] hover:bg-gray-50 text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Upsell nudge */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-dashed border-[#EAE6EF]">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-[#6B7280]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#111827]">{upsellTitle}</p>
                  <p className="text-xs text-[#6B7280]">{upsellDescription}</p>
                </div>
                <button
                  onClick={() => navigate(`/product/${upsellActionProductId}`)}
                  className="flex-shrink-0 flex items-center gap-1 text-xs text-[#111827] font-medium hover:text-[#FF4DB8] transition-colors"
                >
                  Добавить <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="space-y-4">
              {/* Active Offer */}
              <div className="p-4 rounded-2xl bg-[#FFE1F2] border border-[#FF4DB8]/20">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FF4DB8] text-white">ОФФЕР</span>
                </div>
                {isMetaLoading ? (
                  <p className="text-xs text-[#6B7280] mt-0.5">Загружаем персональный оффер...</p>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-[#111827]">{offerTitle}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{offerDescription}</p>
                  </>
                )}
                {metaError && (
                  <div className="mt-3">
                    <p className="text-xs text-[#B42318]">{metaError}</p>
                    <button
                      onClick={() => setMetaRetryKey((value) => value + 1)}
                      className="mt-2 text-xs text-[#111827] font-medium underline underline-offset-2"
                    >
                      Повторить
                    </button>
                  </div>
                )}
              </div>

              {/* Loyalty Points widget */}
              <LoyaltyCartWidget
                pointsEarned={summaryPointsEarned}
                currentBalance={availablePoints}
                tier={currentTier}
              />

              {/* Use Points */}
              <div className="p-5 rounded-2xl bg-white border border-[#EAE6EF]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FF4DB8]" />
                    <h3 className="text-sm font-semibold text-[#111827]">Списать баллы</h3>
                  </div>
                  <span className="text-xs text-[#6B7280]">Доступно: {availablePoints.toLocaleString('ru')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={pointsToUse || ''}
                    onChange={e => setPointsToUse(Math.min(availablePoints, Math.max(0, Number(e.target.value))))}
                    placeholder="0"
                    className="flex-1 px-3 py-2 rounded-xl border border-[#EAE6EF] text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                  <button
                    onClick={() => setPointsToUse(Math.min(availablePoints, summaryTotal))}
                    className="text-xs text-[#111827] font-medium px-3 py-2 rounded-xl border border-[#EAE6EF] hover:bg-gray-50 transition-colors whitespace-nowrap"
                  >
                    Макс.
                  </button>
                </div>
                {pointsToUse > 0 && (
                  <p className="text-xs text-[#FF4DB8] mt-2">Экономия: −{pointsToUse.toLocaleString('ru')} ₸</p>
                )}
              </div>

              {/* Total */}
              <div className="p-5 rounded-2xl bg-white border border-[#EAE6EF] space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Товары</span>
                  <span className="font-semibold text-[#111827]">{summarySubtotal.toLocaleString('ru')} ₸</span>
                </div>
                {summaryDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Скидка −15%</span>
                    <span className="font-semibold text-[#FF4DB8]">−{summaryDiscount.toLocaleString('ru')} ₸</span>
                  </div>
                )}
                {summaryPointsDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Баллы</span>
                    <span className="font-semibold text-[#FF4DB8]">−{summaryPointsDiscount.toLocaleString('ru')} ₸</span>
                  </div>
                )}
                <div className="pt-3 border-t border-[#EAE6EF] flex justify-between items-baseline">
                  <span className="text-base font-semibold text-[#111827]">Итого</span>
                  <span className="text-2xl font-bold text-[#111827]">{Math.max(0, summaryTotal).toLocaleString('ru')} ₸</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full h-12 rounded-xl bg-[#111827] text-white font-semibold text-sm hover:bg-[#0B1220] transition-all flex items-center justify-center gap-2 hover:shadow-lg"
              >
                Оформить заказ
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-xs text-[#6B7280]">
                После покупки начислим <strong className="text-[#FF4DB8]">+{summaryPointsEarned} баллов</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
