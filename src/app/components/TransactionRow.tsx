import { Calendar, Gift, ShoppingBag, TrendingDown, TrendingUp } from 'lucide-react';
import { Badge } from './Badge';
import { useI18n } from '../../shared/i18n/LanguageContext';

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

const transactionRowCopy = {
  ru: {
    statusCompleted: 'Завершена',
    statusPending: 'В обработке',
    statusFailed: 'Ошибка',
    dateMissing: 'Дата не указана',
    purchase: 'Покупка',
    reward: 'Начисление баллов',
    redeem: 'Списание баллов',
    refund: 'Возврат',
    typePurchase: 'Покупка',
    typeReward: 'Начисление',
    typeRedeem: 'Списание',
    typeRefund: 'Возврат',
    typeDefault: 'Операция',
    pointsShort: 'б.',
  },
  kk: {
    statusCompleted: 'Аяқталды',
    statusPending: 'Өңделіп жатыр',
    statusFailed: 'Қате',
    dateMissing: 'Күні көрсетілмеген',
    purchase: 'Сатып алу',
    reward: 'Ұпай есептеу',
    redeem: 'Ұпай шегеру',
    refund: 'Қайтарым',
    typePurchase: 'Сатып алу',
    typeReward: 'Есептеу',
    typeRedeem: 'Шегеру',
    typeRefund: 'Қайтарым',
    typeDefault: 'Операция',
    pointsShort: 'ұп.',
  },
  en: {
    statusCompleted: 'Completed',
    statusPending: 'Processing',
    statusFailed: 'Failed',
    dateMissing: 'Date not specified',
    purchase: 'Purchase',
    reward: 'Points credited',
    redeem: 'Points redeemed',
    refund: 'Refund',
    typePurchase: 'Purchase',
    typeReward: 'Reward',
    typeRedeem: 'Redeem',
    typeRefund: 'Refund',
    typeDefault: 'Operation',
    pointsShort: 'pts',
  },
} as const;

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

export function TransactionRow({ transaction, onClick }: TransactionRowProps) {
  const { language } = useI18n();
  const copy = transactionRowCopy[language];
  const locale = language === 'kk' ? 'kk-KZ' : language === 'en' ? 'en-US' : 'ru-RU';
  const type = normalizeType(typeof transaction.type === 'string' ? transaction.type : undefined);
  const status = normalizeStatus(typeof transaction.status === 'string' ? transaction.status : undefined);

  const amountRaw = toNumber(transaction.amount ?? transaction.total_amount);
  const amount = amountRaw !== undefined ? amountRaw : 0;
  const pointsRaw = toNumber(transaction.points_change ?? transaction.points_delta ?? transaction.points_earned);
  const pointsChange = pointsRaw !== undefined ? Math.round(pointsRaw) : 0;
  const pointsTone =
    pointsChange > 0 ? 'text-green-600' : pointsChange < 0 ? 'text-red-600' : 'text-gray-500';

  const dateValue =
    (typeof transaction.date === 'string' && transaction.date) ||
    (typeof transaction.created_at === 'string' && transaction.created_at) ||
    '';
  const parsedDate = dateValue ? new Date(dateValue) : null;
  const formattedDate =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? parsedDate.toLocaleDateString(locale)
      : copy.dateMissing;

  const description =
    typeof transaction.description === 'string' && transaction.description.trim()
      ? transaction.description
      : type === 'purchase'
        ? copy.purchase
        : type === 'reward'
          ? copy.reward
          : type === 'redeem'
            ? copy.redeem
            : copy.refund;

  const transactionId =
    transaction.transaction_id !== undefined && transaction.transaction_id !== null
      ? String(transaction.transaction_id)
      : '';

  const getStatusLabel = () => {
    if (status === 'completed') return copy.statusCompleted;
    if (status === 'pending') return copy.statusPending;
    if (status === 'failed') return copy.statusFailed;
    return '';
  };

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
        return copy.typePurchase;
      case 'reward':
        return copy.typeReward;
      case 'refund':
        return copy.typeRefund;
      case 'redeem':
        return copy.typeRedeem;
      default:
        return copy.typeDefault;
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
              {getStatusLabel()}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
          <span>|</span>
          <span>{getTypeLabel()}</span>
          {transactionId && (
            <>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline font-mono text-xs">#{transactionId.slice(0, 8)}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 text-right">
        <p className={`font-semibold ${pointsTone}`}>
          {pointsChange > 0 ? '+' : ''}
          {pointsChange} {copy.pointsShort}
        </p>
        {amount !== 0 && (
          <p className="text-sm text-gray-500 mt-0.5">{amount.toLocaleString(locale)} ₸</p>
        )}
      </div>
    </div>
  );
}
