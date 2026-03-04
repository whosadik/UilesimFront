import { Calendar, TrendingUp, TrendingDown, Gift, ShoppingBag } from "lucide-react";
import { Badge } from "./Badge";

export interface Transaction {
  id: string;
  transaction_id: string;
  type: "purchase" | "reward" | "refund" | "redeem";
  amount: number;
  points_change: number;
  description: string;
  date: string;
  status?: "completed" | "pending" | "failed";
  tier_after?: string;
}

interface TransactionRowProps {
  transaction: Transaction;
  onClick?: () => void;
}

export function TransactionRow({ transaction, onClick }: TransactionRowProps) {
  const getIcon = () => {
    switch (transaction.type) {
      case "purchase":
        return <ShoppingBag className="w-5 h-5" />;
      case "reward":
        return <Gift className="w-5 h-5" />;
      case "refund":
        return <TrendingDown className="w-5 h-5" />;
      case "redeem":
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <ShoppingBag className="w-5 h-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (transaction.type) {
      case "purchase":
        return "Покупка";
      case "reward":
        return "Начисление";
      case "refund":
        return "Возврат";
      case "redeem":
        return "Списание";
      default:
        return transaction.type;
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case "completed":
        return "bg-green-50 text-green-700";
      case "pending":
        return "bg-yellow-50 text-yellow-700";
      case "failed":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const isPositive = transaction.points_change > 0;

  return (
    <div
      className={`flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-100 transition-all ${
        onClick ? "cursor-pointer hover:shadow-sm hover:border-gray-200" : ""
      }`}
      onClick={onClick}
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-600">
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-gray-900 truncate">{transaction.description}</p>
          {transaction.status && (
            <Badge variant="secondary" className={`text-xs ${getStatusColor()}`}>
              {transaction.status}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(transaction.date).toLocaleDateString("ru-RU")}
          </span>
          <span>•</span>
          <span>{getTypeLabel()}</span>
          {transaction.transaction_id && (
            <>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline font-mono text-xs">#{transaction.transaction_id.slice(0, 8)}</span>
            </>
          )}
        </div>
      </div>

      {/* Points change */}
      <div className="flex-shrink-0 text-right">
        <p
          className={`font-semibold ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? "+" : ""}
          {transaction.points_change} б.
        </p>
        {transaction.amount !== 0 && (
          <p className="text-sm text-gray-500 mt-0.5">
            {transaction.amount.toLocaleString("ru-RU")} ₽
          </p>
        )}
      </div>
    </div>
  );
}
