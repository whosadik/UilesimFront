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

const formatMoney = (value: unknown): string => {
  const amount = toNullableNumber(value);
  return amount === null ? "—" : `${Math.round(amount).toLocaleString("ru-RU")} ₸`;
};

const formatStatusLabel = (value: unknown): string => {
  const status = String(value ?? "").toLowerCase();
  if (status === "completed") return "Завершена";
  if (status === "pending") return "В обработке";
  if (status === "failed") return "Ошибка";
  return "Неизвестно";
};

const formatChannelLabel = (value: unknown): string => {
  const channel = String(value ?? "").toLowerCase();
  if (channel === "online") return "Онлайн";
  if (channel === "offline") return "Офлайн";
  return channel ? channel : "—";
};

const formatTierLabel = (value: unknown): string => {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) {
    return "—";
  }

  return raw.charAt(0).toUpperCase() + raw.slice(1);
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

const mapApiTransactionToRow = (transaction: ApiTransaction, index: number): Transaction => {
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
    "Покупка";

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

const mapApiItems = (items: ApiTransactionItem[] | undefined): TransactionDetailItem[] => {
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
          : `Товар #${productId}`,
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

        setTransactions(apiTransactions.map((transaction, index) => mapApiTransactionToRow(transaction, index)));
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        if (loadError instanceof ApiError && (loadError.status === 401 || loadError.status === 403)) {
          navigate("/login", { replace: true, state: { from: location.pathname } });
          return;
        }

        setTransactions([]);
        setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить транзакции.");
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
  }, [isAuthLoading, location.pathname, navigate, retryKey, user]);

  const handleTransactionClick = async (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setSelectedTransactionDetail(null);
    setDetailItems([]);
    setDetailError(null);
    setIsDetailLoading(true);
    setShowDetailDialog(true);

    try {
      const detail = await getTransactionById(transaction.id);
      const mapped = mapApiTransactionToRow(detail, 0);
      setSelectedTransaction(mapped);
      setSelectedTransactionDetail(detail);
      setDetailItems(mapApiItems(detail.items));
    } catch (detailLoadError) {
      if (detailLoadError instanceof ApiError && (detailLoadError.status === 401 || detailLoadError.status === 403)) {
        navigate("/login", { replace: true, state: { from: location.pathname } });
        return;
      }

      setDetailError("Не удалось загрузить детали транзакции.");
      toast.error("Не удалось загрузить детали транзакции.");
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState
          title="Не удалось загрузить транзакции"
          description={error}
          onRetry={() => setRetryKey((value) => value + 1)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Receipt className="w-8 h-8 text-gray-700" />
            <h1 className="text-3xl font-semibold text-gray-900">История транзакций</h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Всего транзакций</p>
              <p className="text-2xl font-semibold text-gray-900">{transactions.length}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Чистое изменение баллов</p>
              <p className={`text-2xl font-semibold ${totalPointsNet >= 0 ? "text-green-600" : "text-red-600"}`}>
                {totalPointsNet > 0 ? "+" : ""}
                {totalPointsNet}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Чистое изменение за месяц</p>
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
            Все
          </Button>
          <Button
            variant={filterType === "purchase" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilterType("purchase")}
          >
            Покупки
          </Button>
          <Button
            variant={filterType === "reward" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilterType("reward")}
          >
            Начисления
          </Button>
          <Button
            variant={filterType === "redeem" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilterType("redeem")}
          >
            Списания
          </Button>
          <Button
            variant={filterType === "refund" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilterType("refund")}
          >
            Возвраты
          </Button>

          <div className="ml-auto">
            <Button variant="secondary" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Период
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
              <Button variant="secondary">Загрузить ещё</Button>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<Receipt className="w-12 h-12" />}
            title="Нет транзакций"
            description="Здесь будет отображаться история ваших покупок и начислений баллов."
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
            <DialogTitle>Детали транзакции</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              {isDetailLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" text="Загружаем детали транзакции" />
                </div>
              ) : detailError ? (
                <p className="text-sm text-red-600">{detailError}</p>
              ) : (
                <>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Номер транзакции</p>
                        <p className="font-mono text-sm text-gray-900">
                          {selectedTransaction.transaction_id}
                        </p>
                      </div>
                      <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        {formatStatusLabel(selectedTransactionDetail?.status ?? selectedTransaction.status)}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Дата</span>
                        <span className="text-gray-900">
                            {new Date(selectedTransaction.date).toLocaleString("ru-RU")}
                        </span>
                      </div>
                      {selectedTransactionDetail?.channel && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Канал</span>
                          <span className="text-gray-900">{formatChannelLabel(selectedTransactionDetail.channel)}</span>
                        </div>
                      )}
                      {detailGrossAmount !== null && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Сумма до скидки</span>
                          <span className="text-gray-900">{formatMoney(detailGrossAmount)}</span>
                        </div>
                      )}
                      {detailDiscountAmount !== null && detailDiscountAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Скидка</span>
                          <span className="font-semibold text-green-600">−{formatMoney(detailDiscountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Итого</span>
                        <span className="text-gray-900 font-semibold">
                          {detailNetAmount !== null
                            ? `${detailNetAmount.toLocaleString("ru-RU")} ₸`
                            : formatMoney(selectedTransaction.amount)}
                        </span>
                      </div>
                      {detailPointsEarned !== null && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Начислено баллов</span>
                          <span className="font-semibold text-green-600">+{Math.round(detailPointsEarned)} б.</span>
                        </div>
                      )}
                      {detailPointsRedeemed !== null && detailPointsRedeemed > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Списано баллов</span>
                          <span className="font-semibold text-red-600">−{Math.round(detailPointsRedeemed)} б.</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Чистое изменение</span>
                        <span
                          className={`font-semibold ${
                            selectedTransaction.points_change > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {selectedTransaction.points_change > 0 ? "+" : ""}
                          {selectedTransaction.points_change} б.
                        </span>
                      </div>
                      {detailNewBalance !== null && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Баланс после</span>
                          <span className="text-gray-900 font-medium">{Math.round(detailNewBalance)} б.</span>
                        </div>
                      )}
                      {detailTierAfter && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Уровень после</span>
                          <span className="text-gray-900 font-medium">
                            {formatTierLabel(detailTierAfter)}
                          </span>
                        </div>
                      )}
                      {selectedTransactionDetail?.tier_upgraded && (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
                          Уровень лояльности повышен после этой транзакции.
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Описание</p>
                    <p className="text-sm text-gray-900">{selectedTransaction.description}</p>
                  </div>

                  {roadmapStep && (
                    <div className="rounded-lg border border-[#EAE6EF] bg-[#FFF8FC] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#111827]">
                            Следующий шаг roadmap
                          </p>
                          <p className="text-xs text-[#6B7280] mt-1">
                            {roadmapStep.title ?? "Персональный шаг"}
                            {roadmapStep.step_index ? ` · Шаг ${roadmapStep.step_index}` : ""}
                          </p>
                        </div>
                        <Link
                          to="/me/roadmap"
                          className="text-xs font-medium text-[#FF4DB8] hover:underline"
                        >
                          Открыть roadmap
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
                              alt={typeof roadmapProduct.name === "string" ? roadmapProduct.name : "Recommended product"}
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
                                  : `Товар #${roadmapProduct.id}`}
                              </Link>
                            ) : (
                              <p className="text-sm font-medium text-[#111827] line-clamp-2">
                                {typeof roadmapProduct.name === "string" && roadmapProduct.name.trim()
                                  ? roadmapProduct.name
                                  : "Рекомендованный товар"}
                              </p>
                            )}
                            <p className="text-xs text-[#6B7280] mt-1">
                              {typeof roadmapProduct.brand === "string" && roadmapProduct.brand.trim()
                                ? roadmapProduct.brand
                                : "Uilesim"}
                              {toNullableNumber(roadmapProduct.price) !== null
                                ? ` · ${formatMoney(roadmapProduct.price)}`
                                : ""}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {detailItems.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Позиции в транзакции</p>
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
                                  {item.brand ?? `ID: ${item.productId}`}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              {item.quantity} × {item.unitPrice.toLocaleString("ru-RU")} ₸
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


