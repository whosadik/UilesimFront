import { Calendar, TrendingUp, TrendingDown, Gift, ShoppingBag } from 'lucide-react';
import { Badge } from './Badge';

type UiTransactionType = 'purchase' | 'reward' | 'refund' | 'redeem';
type UiTransactionStatus = 'completed' | 'pending' | 'failed';

export interface Transaction {
  id: string | number;
  transaction_id?: string | number;
  type?: UiTransactionType | string;
  amount?: number | string;
  total_amount?: number | string;
  points_change?: number | string;
  points_delta?: number | string;
  points_earned?: number | string;
  description?: string;
  date?: string;
  created_at?: string;
  status?: UiTransactionStatus | string;
  tier_after?: string;
}

interface TransactionRowProps {
  transaction: Transaction;
  onClick?: () => void;
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

function normalizeType(value?: string): UiTransactionType {
  const raw = String(value ?? '').trim().toLowerCase();
  if (raw === 'purchase' || raw === 'reward' || raw === 'refund' || raw === 'redeem') {
    return raw;
  }
  return 'purchase';
}

function normalizeStatus(value?: string): UiTransactionStatus | undefined {
  const raw = String(value ?? '').trim().toLowerCase();
  if (raw === 'completed' || raw === 'pending' || raw === 'failed') {
    return raw;
  }
  return undefined;
}

function getStatusLabel(status?: UiTransactionStatus): string {
  if (status === 'completed') return 'Завершена';
  if (status === 'pending') return 'В обработке';
  if (status === 'failed') return 'Ошибка';
  return '';
}

export function TransactionRow({ transaction, onClick }: TransactionRowProps) {
  const type = normalizeType(typeof transaction.type === 'string' ? transaction.type : undefined);
  const status = normalizeStatus(typeof transaction.status === 'string' ? transaction.status : undefined);

  const amountRaw = toNumber(transaction.amount ?? transaction.total_amount);
  const amount = amountRaw !== undefined ? amountRaw : 0;
  const pointsRaw = toNumber(transaction.points_change ?? transaction.points_delta ?? transaction.points_earned);
  const pointsChange = pointsRaw !== undefined ? Math.round(pointsRaw) : 0;
  const isPositive = pointsChange > 0;

  const dateValue =
    (typeof transaction.date === 'string' && transaction.date) ||
    (typeof transaction.created_at === 'string' && transaction.created_at) ||
    '';
  const parsedDate = dateValue ? new Date(dateValue) : null;
  const formattedDate =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? parsedDate.toLocaleDateString('ru-RU')
      : 'Дата не указана';

  const description =
    typeof transaction.description === 'string' && transaction.description.trim()
      ? transaction.description
      : type === 'purchase'
        ? 'Покупка'
        : type === 'reward'
          ? 'Начисление баллов'
          : type === 'redeem'
            ? 'Списание баллов'
            : 'Возврат';

  const transactionId =
    transaction.transaction_id !== undefined && transaction.transaction_id !== null
      ? String(transaction.transaction_id)
      : '';

  const getIcon = () => {
    switch (type) {
      case 'purchase':
        return <ShoppingBag className="w-5 h-5" />;
      case 'reward':
        return <Gift className="w-5 h-5" />;
      case 'refund':
        return <TrendingDown className="w-5 h-5" />;
      case 'redeem':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <ShoppingBag className="w-5 h-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'purchase':
        return 'Покупка';
      case 'reward':
        return 'Начисление';
      case 'refund':
        return 'Возврат';
      case 'redeem':
        return 'Списание';
      default:
        return 'Операция';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700';
      case 'failed':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-100 transition-all ${
        onClick ? 'cursor-pointer hover:shadow-sm hover:border-gray-200' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-600">
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-gray-900 truncate">{description}</p>
          {status && (
            <Badge variant="secondary" className={`text-xs ${getStatusColor()}`}>
              {getStatusLabel(status)}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
          <span>•</span>
          <span>{getTypeLabel()}</span>
          {transactionId && (
            <>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline font-mono text-xs">#{transactionId.slice(0, 8)}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 text-right">
        <p className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}
          {pointsChange} б.
        </p>
        {amount !== 0 && (
          <p className="text-sm text-gray-500 mt-0.5">{amount.toLocaleString('ru-RU')} ₸</p>
        )}
      </div>
    </div>
  );
}
