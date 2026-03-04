import { Crown, Sparkles, Star } from 'lucide-react';

interface LoyaltyBadgeProps {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  variant?: 'compact' | 'full';
}

export function LoyaltyBadge({ tier, points, variant = 'compact' }: LoyaltyBadgeProps) {
  const tierConfig = {
    bronze: {
      label: 'Bronze',
      icon: Star,
      gradient: 'from-amber-100 to-orange-50',
      color: 'text-amber-700',
      iconColor: 'text-amber-600',
    },
    silver: {
      label: 'Silver',
      icon: Sparkles,
      gradient: 'from-gray-100 to-slate-50',
      color: 'text-slate-700',
      iconColor: 'text-slate-600',
    },
    gold: {
      label: 'Gold',
      icon: Crown,
      gradient: 'from-yellow-100 to-amber-50',
      color: 'text-yellow-700',
      iconColor: 'text-yellow-600',
    },
    platinum: {
      label: 'Platinum',
      icon: Crown,
      gradient: 'from-purple-100 to-pink-50',
      color: 'text-purple-700',
      iconColor: 'text-purple-600',
    },
  }[tier];

  const Icon = tierConfig.icon;

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${tierConfig.gradient} border border-${tier === 'platinum' ? '[#FF4DB8]' : 'current'}/20`}>
        <Icon className={`w-4 h-4 ${tierConfig.iconColor}`} />
        <span className={`text-sm font-semibold ${tierConfig.color}`}>
          {tierConfig.label}
        </span>
        <span className="text-xs text-[#6B7280]">
          {points.toLocaleString()} баллов
        </span>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-2xl bg-gradient-to-br ${tierConfig.gradient} border border-${tier === 'platinum' ? '[#FF4DB8]' : 'current'}/20`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center">
            <Icon className={`w-6 h-6 ${tierConfig.iconColor}`} />
          </div>
          <div>
            <p className="text-xs text-[#6B7280] mb-1">Ваш статус</p>
            <h3 className={`text-lg font-bold ${tierConfig.color}`}>
              {tierConfig.label}
            </h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#6B7280] mb-1">Баланс</p>
          <p className="text-xl font-bold text-[#111827]">
            {points.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
