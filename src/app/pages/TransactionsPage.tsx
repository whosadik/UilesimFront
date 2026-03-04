import { useState } from "react";
import { Receipt, Calendar, Filter, ChevronDown } from "lucide-react";
import { TransactionRow, Transaction } from "../components/TransactionRow";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Button } from "../components/Button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

/**
 * DEV NOTES:
 * Endpoint: GET /api/transactions/?page=1&page_size=20&type=&year=&month=
 * Response: { ok: true, transactions: Transaction[], pagination: {...} }
 * 
 * Detail: GET /api/transactions/{transaction_id}/
 * Response: { ok: true, transaction: {...}, items: [...] }
 */

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    transaction_id: "TRX-2024-001234",
    type: "purchase",
    amount: 4500,
    points_change: 225,
    description: "Покупка на сумму 4 500 ₽",
    date: "2024-03-01T14:30:00Z",
    status: "completed",
    tier_after: "Gold",
  },
  {
    id: "2",
    transaction_id: "TRX-2024-001198",
    type: "reward",
    amount: 0,
    points_change: 50,
    description: "Завершение профиля",
    date: "2024-02-28T10:15:00Z",
    status: "completed",
  },
  {
    id: "3",
    transaction_id: "TRX-2024-001156",
    type: "redeem",
    amount: -500,
    points_change: -100,
    description: "Списание баллов",
    date: "2024-02-25T16:20:00Z",
    status: "completed",
  },
  {
    id: "4",
    transaction_id: "TRX-2024-001089",
    type: "purchase",
    amount: 2100,
    points_change: 105,
    description: "Покупка на сумму 2 100 ₽",
    date: "2024-02-20T11:45:00Z",
    status: "completed",
  },
  {
    id: "5",
    transaction_id: "TRX-2024-000987",
    type: "refund",
    amount: -1200,
    points_change: -60,
    description: "Возврат товара",
    date: "2024-02-15T09:30:00Z",
    status: "completed",
  },
];

export default function TransactionsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // TODO: Load transactions from API
  // useEffect(() => {
  //   fetchTransactions();
  // }, [filterType]);

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailDialog(true);
    
    // TODO: Fetch detailed transaction
    // GET /api/transactions/{transaction_id}/
  };

  const filteredTransactions =
    filterType === "all"
      ? transactions
      : transactions.filter((t) => t.type === filterType);

  const totalPoints = transactions.reduce((sum, t) => sum + t.points_change, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Receipt className="w-8 h-8 text-gray-700" />
            <h1 className="text-3xl font-semibold text-gray-900">История транзакций</h1>
          </div>

          {/* Stats */}
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
              <p className="text-2xl font-semibold text-gray-900">
                +{transactions.slice(0, 2).reduce((sum, t) => sum + t.points_change, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
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

        {/* Transactions list */}
        {filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                onClick={() => handleTransactionClick(transaction)}
              />
            ))}

            {/* Load more */}
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

      {/* Transaction detail dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Детали транзакции</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
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

              {/* TODO: Add purchased items list if type === "purchase" */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}