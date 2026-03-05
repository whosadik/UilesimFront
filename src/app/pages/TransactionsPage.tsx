import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
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

/**
 * DEV NOTES:
 * Endpoint list: GET /api/transactions/
 * Endpoint detail: GET /api/transactions/{id}/
 * Contract: { id, created_at, total_amount, channel, items[] }
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

interface TransactionDetailItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

const mapApiTransactionToRow = (transaction: ApiTransaction, index: number): Transaction => {
  const idValue = typeof transaction.id === "number" ? transaction.id : index + 1;
  const explicitType = typeof transaction.type === "string" ? transaction.type.toLowerCase() : "";
  const totalAmount = toNumber(transaction.total_amount ?? transaction.net_total ?? transaction.amount);
  const pointsEarned = toNumber(transaction.points_earned);
  const pointsRedeemed = toNumber(transaction.points_redeemed);
  const fallbackPoints = toNumber(transaction.points_change);

  const pointsChange =
    pointsEarned !== 0 ? pointsEarned : pointsRedeemed !== 0 ? -Math.abs(pointsRedeemed) : fallbackPoints;

  const type: Transaction["type"] =
    explicitType === "purchase" ||
    explicitType === "reward" ||
    explicitType === "refund" ||
    explicitType === "redeem"
      ? explicitType
      : pointsChange < 0 || totalAmount < 0
        ? "redeem"
        : "purchase";

  const transactionId =
    (typeof transaction.transaction_id === "string" && transaction.transaction_id) ||
    `TRX-${String(idValue).padStart(6, "0")}`;

  const date =
    (typeof transaction.created_at === "string" && transaction.created_at) ||
    new Date().toISOString();

  const description =
    (typeof transaction.description === "string" && transaction.description) ||
    `Транзакция #${idValue}`;

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
    tier_after: typeof transaction.tier_after === "string" ? transaction.tier_after : undefined,
  };
};

const mapApiItems = (items: ApiTransactionItem[] | undefined): TransactionDetailItem[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => {
    const productId =
      typeof item.product === "number" || typeof item.product === "string"
        ? String(item.product)
        : `#${index + 1}`;

    return {
      productId,
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
    setDetailItems([]);
    setDetailError(null);
    setIsDetailLoading(true);
    setShowDetailDialog(true);

    try {
      const detail = await getTransactionById(transaction.id);
      const mapped = mapApiTransactionToRow(detail, 0);
      setSelectedTransaction(mapped);
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

  const totalPoints = transactions.reduce((sum, transaction) => sum + transaction.points_change, 0);
  const currentMonthPoints = getCurrentMonthPoints(transactions);

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
              <p className="text-sm text-gray-600 mb-1">Всего баллов заработано</p>
              <p className="text-2xl font-semibold text-green-600">+{totalPoints}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">За текущий месяц</p>
              <p className="text-2xl font-semibold text-gray-900">+{currentMonthPoints}</p>
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

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
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
                        {selectedTransaction.status}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Дата</span>
                        <span className="text-gray-900">
                          {new Date(selectedTransaction.date).toLocaleString("ru-RU")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Сумма</span>
                        <span className="text-gray-900 font-semibold">
                          {selectedTransaction.amount.toLocaleString("ru-RU")} ₽
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Баллы</span>
                        <span
                          className={`font-semibold ${
                            selectedTransaction.points_change > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {selectedTransaction.points_change > 0 ? "+" : ""}
                          {selectedTransaction.points_change} б.
                        </span>
                      </div>
                      {selectedTransaction.tier_after && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Уровень после</span>
                          <span className="text-gray-900 font-medium">
                            {selectedTransaction.tier_after}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Описание</p>
                    <p className="text-sm text-gray-900">{selectedTransaction.description}</p>
                  </div>

                  {detailItems.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Позиции в транзакции</p>
                      <div className="space-y-2">
                        {detailItems.map((item, index) => (
                          <div
                            key={`${item.productId}-${index}`}
                            className="flex items-center justify-between rounded-lg border border-gray-200 p-2"
                          >
                            <p className="text-sm text-gray-900">Товар #{item.productId}</p>
                            <p className="text-sm text-gray-600">
                              {item.quantity} × {item.unitPrice.toLocaleString("ru-RU")} ₽
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
