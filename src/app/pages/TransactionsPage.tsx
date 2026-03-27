import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Receipt, Calendar, ChevronDown } from "lucide-react";
import { TransactionRow, Transaction } from "../components/TransactionRow";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorState } from "../components/ErrorState";
import { Button } from "../components/Button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useAuth } from "../../shared/auth/AuthContext";
import { ApiError } from "../../shared/api/ApiError";
import { useI18n } from "../../shared/i18n/LanguageContext";
import {
  listTransactions,
  getTransactionById,
  type Transaction as ApiTransaction,
  type TransactionItem as ApiTransactionItem,
} from "../../shared/api/transactions";
import type { RoadmapStepSnapshotApi } from "../../shared/api/roadmap";

/**
 * DEV NOTES:
 * Endpoint list: GET /api/transactions/
 * Endpoint detail: GET /api/transactions/{id}/
 * Contract: rich transaction snapshot with pricing fields and product_summary in items.
 */

const transactionsPageCopy = {
  ru: {
    noValue: "—",
    pointsShort: "б.",
    unknownStatus: "Неизвестно",
    statusCompleted: "Завершена",
    statusPending: "В обработке",
    statusFailed: "Ошибка",
    channelOnline: "Онлайн",
    channelOffline: "Офлайн",
    defaultPurchaseDescription: "Покупка",
    productFallback: (id: string) => `Товар #${id}`,
    roadmapProductFallback: "Рекомендованный товар",
    transactionLoadError: "Не удалось загрузить транзакции.",
    transactionDetailLoadError: "Не удалось загрузить детали транзакции.",
    errorTitle: "Не удалось загрузить транзакции",
    title: "История транзакций",
    totalTransactions: "Всего транзакций",
    totalPointsNet: "Чистое изменение баллов",
    monthPointsNet: "Чистое изменение за месяц",
    filterAll: "Все",
    filterPurchase: "Покупки",
    filterReward: "Начисления",
    filterRedeem: "Списания",
    filterRefund: "Возвраты",
    period: "Период",
    loadMore: "Загрузить ещё",
    emptyTitle: "Нет транзакций",
    emptyDescription: "Здесь будет отображаться история ваших покупок и начислений баллов.",
    detailTitle: "Детали транзакции",
    detailLoading: "Загружаем детали транзакции",
    transactionNumber: "Номер транзакции",
    giftCard: "Подарочная карта",
    date: "Дата",
    channel: "Канал",
    grossAmount: "Сумма до скидки",
    discount: "Скидка",
    total: "Итого",
    pointsEarned: "Начислено баллов",
    pointsRedeemed: "Списано баллов",
    netChange: "Чистое изменение",
    balanceAfter: "Баланс после",
    tierAfter: "Уровень после",
    tierUpgraded: "Уровень лояльности повышен после этой транзакции.",
    description: "Описание",
    giftCardDetails: "Детали подарочной карты",
    recipient: "Получатель",
    code: "Код",
    initialAmount: "Начальная сумма",
    nextRoadmapStep: "Следующий шаг roadmap",
    personalStep: "Персональный шаг",
    openRoadmap: "Открыть roadmap",
    stepIndex: (value: number) => `Шаг ${value}`,
    itemsTitle: "Позиции в транзакции",
    itemId: (id: string) => `ID: ${id}`,
    quantityPrice: (quantity: number, price: string) => `${quantity} x ${price}`,
  },
  kk: {
    noValue: "—",
    pointsShort: "ұп.",
    unknownStatus: "Белгісіз",
    statusCompleted: "Аяқталды",
    statusPending: "Өңделіп жатыр",
    statusFailed: "Қате",
    channelOnline: "Онлайн",
    channelOffline: "Офлайн",
    defaultPurchaseDescription: "Сатып алу",
    productFallback: (id: string) => `Тауар #${id}`,
    roadmapProductFallback: "Ұсынылған тауар",
    transactionLoadError: "Транзакцияларды жүктеу мүмкін болмады.",
    transactionDetailLoadError: "Транзакция мәліметтерін жүктеу мүмкін болмады.",
    errorTitle: "Транзакцияларды жүктеу мүмкін болмады",
    title: "Транзакциялар тарихы",
    totalTransactions: "Барлық транзакция",
    totalPointsNet: "Ұпайлардың таза өзгерісі",
    monthPointsNet: "Ай ішіндегі таза өзгеріс",
    filterAll: "Барлығы",
    filterPurchase: "Сатып алулар",
    filterReward: "Есептеулер",
    filterRedeem: "Шегерімдер",
    filterRefund: "Қайтарымдар",
    period: "Кезең",
    loadMore: "Тағы жүктеу",
    emptyTitle: "Транзакциялар жоқ",
    emptyDescription: "Мұнда сатып алуларыңыз бен ұпай есептелу тарихы көрсетіледі.",
    detailTitle: "Транзакция мәліметтері",
    detailLoading: "Транзакция мәліметтерін жүктеп жатырмыз",
    transactionNumber: "Транзакция нөмірі",
    giftCard: "Сыйлық картасы",
    date: "Күні",
    channel: "Арна",
    grossAmount: "Жеңілдікке дейінгі сома",
    discount: "Жеңілдік",
    total: "Барлығы",
    pointsEarned: "Есептелген ұпайлар",
    pointsRedeemed: "Шегерілген ұпайлар",
    netChange: "Таза өзгеріс",
    balanceAfter: "Кейінгі баланс",
    tierAfter: "Кейінгі деңгей",
    tierUpgraded: "Осы транзакциядан кейін адалдық деңгейі көтерілді.",
    description: "Сипаттама",
    giftCardDetails: "Сыйлық картасының мәліметтері",
    recipient: "Алушы",
    code: "Код",
    initialAmount: "Бастапқы сома",
    nextRoadmapStep: "Roadmap-тың келесі қадамы",
    personalStep: "Жеке қадам",
    openRoadmap: "Roadmap ашу",
    stepIndex: (value: number) => `${value}-қадам`,
    itemsTitle: "Транзакциядағы тауарлар",
    itemId: (id: string) => `ID: ${id}`,
    quantityPrice: (quantity: number, price: string) => `${quantity} x ${price}`,
  },
  en: {
    noValue: "—",
    pointsShort: "pts",
    unknownStatus: "Unknown",
    statusCompleted: "Completed",
    statusPending: "Processing",
    statusFailed: "Failed",
    channelOnline: "Online",
    channelOffline: "Offline",
    defaultPurchaseDescription: "Purchase",
    productFallback: (id: string) => `Product #${id}`,
    roadmapProductFallback: "Recommended product",
    transactionLoadError: "Could not load transactions.",
    transactionDetailLoadError: "Could not load transaction details.",
    errorTitle: "Could not load transactions",
    title: "Transaction history",
    totalTransactions: "Total transactions",
    totalPointsNet: "Net points change",
    monthPointsNet: "Net monthly change",
    filterAll: "All",
    filterPurchase: "Purchases",
    filterReward: "Rewards",
    filterRedeem: "Redemptions",
    filterRefund: "Refunds",
    period: "Period",
    loadMore: "Load more",
    emptyTitle: "No transactions",
    emptyDescription: "Your purchase and points history will appear here.",
    detailTitle: "Transaction details",
    detailLoading: "Loading transaction details",
    transactionNumber: "Transaction number",
    giftCard: "Gift card",
    date: "Date",
    channel: "Channel",
    grossAmount: "Amount before discount",
    discount: "Discount",
    total: "Total",
    pointsEarned: "Points earned",
    pointsRedeemed: "Points redeemed",
    netChange: "Net change",
    balanceAfter: "Balance after",
    tierAfter: "Tier after",
    tierUpgraded: "Loyalty tier was upgraded after this transaction.",
    description: "Description",
    giftCardDetails: "Gift card details",
    recipient: "Recipient",
    code: "Code",
    initialAmount: "Initial amount",
    nextRoadmapStep: "Next roadmap step",
    personalStep: "Personal step",
    openRoadmap: "Open roadmap",
    stepIndex: (value: number) => `Step ${value}`,
    itemsTitle: "Items in transaction",
    itemId: (id: string) => `ID: ${id}`,
    quantityPrice: (quantity: number, price: string) => `${quantity} x ${price}`,
  },
} as const;

type TransactionsPageCopy = (typeof transactionsPageCopy)[keyof typeof transactionsPageCopy];

const toNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const toNullableNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

const formatMoney = (value: unknown, locale: string, copy: TransactionsPageCopy): string => {
  const amount = toNullableNumber(value);
  return amount === null ? copy.noValue : `${Math.round(amount).toLocaleString(locale)} ₸`;
};

const formatStatusLabel = (value: unknown, copy: TransactionsPageCopy): string => {
  const status = String(value ?? "").toLowerCase();
  if (status === "completed") return copy.statusCompleted;
  if (status === "pending") return copy.statusPending;
  if (status === "failed") return copy.statusFailed;
  return copy.unknownStatus;
};

const formatChannelLabel = (value: unknown, copy: TransactionsPageCopy): string => {
  const channel = String(value ?? "").toLowerCase();
  if (channel === "online") return copy.channelOnline;
  if (channel === "offline") return copy.channelOffline;
  return channel ? channel : copy.noValue;
};

const formatTierLabel = (value: unknown, copy: TransactionsPageCopy): string => {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) {
    return copy.noValue;
  }

  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

const formatDateTime = (value: unknown, locale: string, copy: TransactionsPageCopy): string => {
  if (typeof value !== "string" || !value) {
    return copy.noValue;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return copy.noValue;
  }

  return parsed.toLocaleString(locale);
};

const formatPoints = (value: number, copy: TransactionsPageCopy): string => {
  const rounded = Math.round(value);
  return `${rounded > 0 ? "+" : ""}${rounded} ${copy.pointsShort}`;
};

const getRoadmapStep = (transaction: ApiTransaction | null): RoadmapStepSnapshotApi | null =>
  transaction && transaction.next_roadmap_step && isRecord(transaction.next_roadmap_step)
    ? (transaction.next_roadmap_step as RoadmapStepSnapshotApi)
    : null;

interface TransactionDetailItem {
  productId: string;
  productName: string;
  brand?: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
}

const mapApiTransactionToRow = (
  transaction: ApiTransaction,
  index: number,
  copy: TransactionsPageCopy,
): Transaction => {
  const idValue = typeof transaction.id === "number" ? transaction.id : index + 1;
  const explicitType = typeof transaction.type === "string" ? transaction.type.toLowerCase() : "";
  const totalAmount = toNumber(transaction.net_total ?? transaction.total_amount ?? transaction.amount);
  const pointsEarned = toNumber(transaction.points_earned);
  const pointsRedeemed = toNumber(transaction.points_redeemed);
  const explicitPointsChange = toNumber(transaction.points_change);

  const pointsChange =
    explicitPointsChange !== 0
      ? explicitPointsChange
      : pointsEarned !== 0
        ? pointsEarned
        : pointsRedeemed !== 0
          ? -Math.abs(pointsRedeemed)
          : 0;

  const type: Transaction["type"] =
    explicitType === "purchase" ||
    explicitType === "reward" ||
    explicitType === "refund" ||
    explicitType === "redeem"
      ? explicitType
      : "purchase";

  const transactionId =
    (typeof transaction.transaction_id === "string" && transaction.transaction_id) ||
    (typeof transaction.transaction_id === "number" && Number.isFinite(transaction.transaction_id)
      ? String(transaction.transaction_id)
      : `TXN-${String(idValue).padStart(8, "0")}`);

  const date =
    (typeof transaction.created_at === "string" && transaction.created_at) ||
    new Date().toISOString();

  const description =
    (typeof transaction.description === "string" && transaction.description) ||
    copy.defaultPurchaseDescription;

  const rawStatus = typeof transaction.status === "string" ? transaction.status.toLowerCase() : "";
  const status: Transaction["status"] =
    rawStatus === "pending" || rawStatus === "failed" || rawStatus === "completed"
      ? rawStatus
      : "completed";

  return {
    id: String(idValue),
    transaction_id: transactionId,
    type,
    amount: totalAmount,
    points_change: pointsChange,
    description,
    date,
    status,
    tier_after:
      typeof transaction.new_tier === "string"
        ? transaction.new_tier
        : typeof transaction.tier_after === "string"
          ? transaction.tier_after
          : undefined,
  };
};

const mapApiItems = (
  items: ApiTransactionItem[] | undefined,
  copy: TransactionsPageCopy,
): TransactionDetailItem[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => {
    const summary = isRecord(item.product_summary) ? item.product_summary : null;
    const productId =
      typeof summary?.id === "number"
        ? String(summary.id)
        : typeof item.product === "number" || typeof item.product === "string"
          ? String(item.product)
          : `#${index + 1}`;
    const imageUrl =
      typeof summary?.image_url === "string" && summary.image_url
        ? summary.image_url
        : Array.isArray(summary?.image_urls) && typeof summary.image_urls[0] === "string"
          ? summary.image_urls[0]
          : undefined;

    return {
      productId,
      productName:
        typeof summary?.name === "string" && summary.name.trim()
          ? summary.name
          : copy.productFallback(productId),
      brand:
        typeof summary?.brand === "string" && summary.brand.trim()
          ? summary.brand
          : undefined,
      imageUrl,
      quantity: typeof item.quantity === "number" && Number.isFinite(item.quantity) ? item.quantity : 0,
      unitPrice: toNumber(item.unit_price),
    };
  });
};

const getCurrentMonthPoints = (items: Transaction[]): number => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  return items.reduce((sum, item) => {
    const date = new Date(item.date);
    if (Number.isNaN(date.getTime())) {
      return sum;
    }

    if (date.getFullYear() === year && date.getMonth() === month) {
      return sum + item.points_change;
    }

    return sum;
  }, 0);
};

export default function TransactionsPage() {
  const { language } = useI18n();
  const copy = transactionsPageCopy[language];
  const locale = language === "kk" ? "kk-KZ" : language === "en" ? "en-US" : "ru-RU";
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedTransactionDetail, setSelectedTransactionDetail] = useState<ApiTransaction | null>(null);
  const [detailItems, setDetailItems] = useState<TransactionDetailItem[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      navigate("/login", { replace: true, state: { from: location.pathname } });
      return;
    }

    let cancelled = false;

    const fetchTransactions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const apiTransactions = await listTransactions();
        if (cancelled) {
          return;
        }

        setTransactions(apiTransactions.map((transaction, index) => mapApiTransactionToRow(transaction, index, copy)));
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        if (loadError instanceof ApiError && (loadError.status === 401 || loadError.status === 403)) {
          navigate("/login", { replace: true, state: { from: location.pathname } });
          return;
        }

        setTransactions([]);
        setError(loadError instanceof Error ? loadError.message : copy.transactionLoadError);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchTransactions();

    return () => {
      cancelled = true;
    };
  }, [copy, isAuthLoading, location.pathname, navigate, retryKey, user]);

  const handleTransactionClick = async (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setSelectedTransactionDetail(null);
    setDetailItems([]);
    setDetailError(null);
    setIsDetailLoading(true);
    setShowDetailDialog(true);

    try {
      const detail = await getTransactionById(transaction.id);
      const mapped = mapApiTransactionToRow(detail, 0, copy);
      setSelectedTransaction(mapped);
      setSelectedTransactionDetail(detail);
      setDetailItems(mapApiItems(detail.items, copy));
    } catch (detailLoadError) {
      if (detailLoadError instanceof ApiError && (detailLoadError.status === 401 || detailLoadError.status === 403)) {
        navigate("/login", { replace: true, state: { from: location.pathname } });
        return;
      }

      setDetailError(copy.transactionDetailLoadError);
      toast.error(copy.transactionDetailLoadError);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const filteredTransactions =
    filterType === "all"
      ? transactions
      : transactions.filter((transaction) => transaction.type === filterType);

  const totalPointsNet = transactions.reduce((sum, transaction) => sum + transaction.points_change, 0);
  const currentMonthPointsNet = getCurrentMonthPoints(transactions);
  const roadmapStep = getRoadmapStep(selectedTransactionDetail);
  const roadmapProduct =
    roadmapStep && roadmapStep.recommended_product && isRecord(roadmapStep.recommended_product)
      ? roadmapStep.recommended_product
      : null;
  const detailGrossAmount = toNullableNumber(selectedTransactionDetail?.gross_total);
  const detailDiscountAmount = toNullableNumber(selectedTransactionDetail?.discount_amount);
  const detailNetAmount =
    toNullableNumber(selectedTransactionDetail?.net_total) ??
    toNullableNumber(selectedTransaction?.amount);
  const detailPointsEarned = toNullableNumber(selectedTransactionDetail?.points_earned);
  const detailPointsRedeemed = toNullableNumber(selectedTransactionDetail?.points_redeemed);
  const detailNewBalance = toNullableNumber(selectedTransactionDetail?.new_balance);
  const detailTierAfter = selectedTransactionDetail?.new_tier ?? selectedTransactionDetail?.tier_after;
  const detailGiftCard =
    selectedTransactionDetail?.gift_card && isRecord(selectedTransactionDetail.gift_card)
      ? selectedTransactionDetail.gift_card
      : null;

  if (isLoading) {
    return (
      <div className="page-centered-with-navbar-offset bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-centered-with-navbar-offset bg-gray-50 flex items-center justify-center">
        <ErrorState
          title={copy.errorTitle}
          description={error}
          onRetry={() => setRetryKey((value) => value + 1)}
        />
      </div>
    );
  }

  return (
    <div className="page-with-navbar-offset min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Receipt className="w-8 h-8 text-gray-700" />
            <h1 className="text-3xl font-semibold text-gray-900">{copy.title}</h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{copy.totalTransactions}</p>
              <p className="text-2xl font-semibold text-gray-900">{transactions.length}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{copy.totalPointsNet}</p>
              <p className={`text-2xl font-semibold ${totalPointsNet >= 0 ? "text-green-600" : "text-red-600"}`}>
                {totalPointsNet > 0 ? "+" : ""}
                {totalPointsNet}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{copy.monthPointsNet}</p>
              <p className={`text-2xl font-semibold ${currentMonthPointsNet >= 0 ? "text-gray-900" : "text-red-600"}`}>
                {currentMonthPointsNet > 0 ? "+" : ""}
                {currentMonthPointsNet}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <Button
            variant={filterType === "all" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilterType("all")}
          >
            {copy.filterAll}
          </Button>
          <Button
            variant={filterType === "purchase" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilterType("purchase")}
          >
            {copy.filterPurchase}
          </Button>
          <Button
            variant={filterType === "reward" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilterType("reward")}
          >
            {copy.filterReward}
          </Button>
          <Button
            variant={filterType === "redeem" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilterType("redeem")}
          >
            {copy.filterRedeem}
          </Button>
          <Button
            variant={filterType === "refund" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilterType("refund")}
          >
            {copy.filterRefund}
          </Button>

          <div className="ml-auto">
            <Button variant="secondary" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              {copy.period}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                onClick={() => void handleTransactionClick(transaction)}
              />
            ))}

            <div className="pt-6 text-center">
              <Button variant="secondary">{copy.loadMore}</Button>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<Receipt className="w-12 h-12" />}
            title={copy.emptyTitle}
            description={copy.emptyDescription}
          />
        )}
      </div>

      <Dialog
        open={showDetailDialog}
        onOpenChange={(nextOpen) => {
          setShowDetailDialog(nextOpen);
          if (!nextOpen) {
            setSelectedTransactionDetail(null);
            setDetailItems([]);
            setDetailError(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{copy.detailTitle}</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              {isDetailLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" text={copy.detailLoading} />
                </div>
              ) : detailError ? (
                <p className="text-sm text-red-600">{detailError}</p>
              ) : (
                <>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{copy.transactionNumber}</p>
                        <p className="font-mono text-sm text-gray-900">
                          {selectedTransaction.transaction_id}
                        </p>
                      </div>
                      <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        {formatStatusLabel(selectedTransactionDetail?.status ?? selectedTransaction.status, copy)}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      {detailGiftCard &&
                        toNullableNumber(detailGiftCard.applied_amount) !== null &&
                        toNullableNumber(detailGiftCard.applied_amount)! > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              {copy.giftCard}
                              {typeof detailGiftCard.masked_code === "string"
                                ? ` (${detailGiftCard.masked_code})`
                                : ""}
                            </span>
                            <span className="font-semibold text-green-600">
                              -{formatMoney(detailGiftCard.applied_amount, locale, copy)}
                            </span>
                          </div>
                        )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">{copy.date}</span>
                        <span className="text-gray-900">
                            {formatDateTime(selectedTransaction.date, locale, copy)}
                        </span>
                      </div>
                      {selectedTransactionDetail?.channel && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{copy.channel}</span>
                          <span className="text-gray-900">{formatChannelLabel(selectedTransactionDetail.channel, copy)}</span>
                        </div>
                      )}
                      {detailGrossAmount !== null && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{copy.grossAmount}</span>
                          <span className="text-gray-900">{formatMoney(detailGrossAmount, locale, copy)}</span>
                        </div>
                      )}
                      {detailDiscountAmount !== null && detailDiscountAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{copy.discount}</span>
                          <span className="font-semibold text-green-600">-{formatMoney(detailDiscountAmount, locale, copy)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">{copy.total}</span>
                        <span className="text-gray-900 font-semibold">
                          {detailNetAmount !== null
                            ? `${detailNetAmount.toLocaleString(locale)} ₸`
                            : formatMoney(selectedTransaction.amount, locale, copy)}
                        </span>
                      </div>
                      {detailPointsEarned !== null && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{copy.pointsEarned}</span>
                          <span className="font-semibold text-green-600">{formatPoints(detailPointsEarned, copy)}</span>
                        </div>
                      )}
                      {detailPointsRedeemed !== null && detailPointsRedeemed > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{copy.pointsRedeemed}</span>
                          <span className="font-semibold text-red-600">{formatPoints(-Math.abs(detailPointsRedeemed), copy)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">{copy.netChange}</span>
                        <span
                          className={`font-semibold ${
                            selectedTransaction.points_change > 0
                              ? "text-green-600"
                              : selectedTransaction.points_change < 0
                                ? "text-red-600"
                                : "text-gray-500"
                          }`}
                        >
                          {formatPoints(selectedTransaction.points_change, copy)}
                        </span>
                      </div>
                      {detailNewBalance !== null && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{copy.balanceAfter}</span>
                          <span className="text-gray-900 font-medium">{Math.round(detailNewBalance)} {copy.pointsShort}</span>
                        </div>
                      )}
                      {detailTierAfter && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{copy.tierAfter}</span>
                          <span className="text-gray-900 font-medium">
                            {formatTierLabel(detailTierAfter, copy)}
                          </span>
                        </div>
                      )}
                      {selectedTransactionDetail?.tier_upgraded && (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
                          {copy.tierUpgraded}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">{copy.description}</p>
                    <p className="text-sm text-gray-900">{selectedTransaction.description}</p>
                  </div>

                  {detailGiftCard && (
                    <div className="rounded-lg border border-[#EAE6EF] bg-white p-4">
                      <p className="text-sm font-semibold text-[#111827] mb-3">{copy.giftCardDetails}</p>
                      <div className="space-y-2 text-sm">
                        {typeof detailGiftCard.recipient_email === "string" && detailGiftCard.recipient_email && (
                          <div className="flex justify-between gap-3">
                            <span className="text-gray-600">{copy.recipient}</span>
                            <span className="text-gray-900">{detailGiftCard.recipient_email}</span>
                          </div>
                        )}
                        {typeof detailGiftCard.masked_code === "string" && detailGiftCard.masked_code && (
                          <div className="flex justify-between gap-3">
                            <span className="text-gray-600">{copy.code}</span>
                            <span className="font-mono text-gray-900">{detailGiftCard.masked_code}</span>
                          </div>
                        )}
                        {toNullableNumber(detailGiftCard.amount) !== null && (
                          <div className="flex justify-between gap-3">
                            <span className="text-gray-600">{copy.initialAmount}</span>
                            <span className="text-gray-900">{formatMoney(detailGiftCard.amount, locale, copy)}</span>
                          </div>
                        )}
                        {toNullableNumber(detailGiftCard.remaining_amount) !== null && (
                          <div className="flex justify-between gap-3">
                            <span className="text-gray-600">{copy.balanceAfter}</span>
                            <span className="text-gray-900">{formatMoney(detailGiftCard.remaining_amount, locale, copy)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {roadmapStep && (
                    <div className="rounded-lg border border-[#EAE6EF] bg-[#FFF8FC] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#111827]">
                            {copy.nextRoadmapStep}
                          </p>
                          <p className="text-xs text-[#6B7280] mt-1">
                            {roadmapStep.title ?? copy.personalStep}
                            {roadmapStep.step_index ? ` | ${copy.stepIndex(roadmapStep.step_index)}` : ""}
                          </p>
                        </div>
                        <Link
                          to="/me/roadmap"
                          className="text-xs font-medium text-[#FF4DB8] hover:underline"
                        >
                          {copy.openRoadmap}
                        </Link>
                      </div>

                      {typeof roadmapStep.description === "string" && roadmapStep.description.trim() && (
                        <p className="mt-3 text-sm text-[#4B5563]">{roadmapStep.description}</p>
                      )}

                      {roadmapProduct && (
                        <div className="mt-3 flex items-center gap-3 rounded-lg border border-white bg-white p-3">
                          {typeof roadmapProduct.image_url === "string" && roadmapProduct.image_url ? (
                            <img
                              src={roadmapProduct.image_url}
                              alt={typeof roadmapProduct.name === "string" ? roadmapProduct.name : copy.roadmapProductFallback}
                              className="h-14 w-14 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="h-14 w-14 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                              {typeof roadmapProduct.name === "string" && roadmapProduct.name
                                ? roadmapProduct.name.slice(0, 1).toUpperCase()
                                : "P"}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            {typeof roadmapProduct.id === "number" ? (
                              <Link
                                to={`/product/${roadmapProduct.id}`}
                                className="text-sm font-medium text-[#111827] hover:text-[#FF4DB8] line-clamp-2"
                              >
                                {typeof roadmapProduct.name === "string" && roadmapProduct.name.trim()
                                  ? roadmapProduct.name
                                  : copy.productFallback(String(roadmapProduct.id))}
                              </Link>
                            ) : (
                              <p className="text-sm font-medium text-[#111827] line-clamp-2">
                                {typeof roadmapProduct.name === "string" && roadmapProduct.name.trim()
                                  ? roadmapProduct.name
                                  : copy.roadmapProductFallback}
                              </p>
                            )}
                            <p className="text-xs text-[#6B7280] mt-1">
                              {typeof roadmapProduct.brand === "string" && roadmapProduct.brand.trim()
                                ? roadmapProduct.brand
                                : "Uilesim"}
                              {toNullableNumber(roadmapProduct.price) !== null
                                ? ` | ${formatMoney(roadmapProduct.price, locale, copy)}`
                                : ""}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {detailItems.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">{copy.itemsTitle}</p>
                      <div className="space-y-2">
                        {detailItems.map((item, index) => (
                          <div
                            key={`${item.productId}-${index}`}
                            className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.productName}
                                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-gray-100 text-gray-500 text-xs font-medium flex items-center justify-center flex-shrink-0">
                                  {item.productName.slice(0, 1).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm text-gray-900 truncate">{item.productName}</p>
                                <p className="text-xs text-gray-500 truncate">
                                  {item.brand ?? copy.itemId(item.productId)}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              {copy.quantityPrice(item.quantity, formatMoney(item.unitPrice, locale, copy))}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}




