import { Crown, Sparkles, Star } from "lucide-react";
import { useI18n } from "../../shared/i18n/LanguageContext";

interface LoyaltyBadgeProps {
  tier: "bronze" | "silver" | "gold";
  points: number;
  variant?: "compact" | "full";
}

export function LoyaltyBadge({ tier, points, variant = "compact" }: LoyaltyBadgeProps) {
  const { language } = useI18n();
  const copy = {
    ru: { balance: "Баланс", status: "Ваш статус", points: "баллов", tiers: { bronze: "Bronze", silver: "Silver", gold: "Gold" } },
    kk: { balance: "Баланс", status: "Сіздің мәртебеңіз", points: "ұпай", tiers: { bronze: "Bronze", silver: "Silver", gold: "Gold" } },
    en: { balance: "Balance", status: "Your status", points: "points", tiers: { bronze: "Bronze", silver: "Silver", gold: "Gold" } },
  }[language];

  const tierConfig = {
    bronze: { label: copy.tiers.bronze, icon: Star, gradient: "from-amber-100 to-orange-50", color: "text-amber-700", iconColor: "text-amber-600" },
    silver: { label: copy.tiers.silver, icon: Sparkles, gradient: "from-gray-100 to-slate-50", color: "text-slate-700", iconColor: "text-slate-600" },
    gold: { label: copy.tiers.gold, icon: Crown, gradient: "from-yellow-100 to-amber-50", color: "text-yellow-700", iconColor: "text-yellow-600" },
  }[tier];

  const Icon = tierConfig.icon;

  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${tierConfig.gradient} border border-black/5`}>
        <Icon className={`w-4 h-4 ${tierConfig.iconColor}`} />
        <span className={`text-sm font-semibold ${tierConfig.color}`}>{tierConfig.label}</span>
        <span className="text-xs text-[#6B7280]">{points.toLocaleString()} {copy.points}</span>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-2xl bg-gradient-to-br ${tierConfig.gradient} border border-black/5`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center">
            <Icon className={`w-6 h-6 ${tierConfig.iconColor}`} />
          </div>
          <div>
            <p className="text-xs text-[#6B7280] mb-1">{copy.status}</p>
            <h3 className={`text-lg font-bold ${tierConfig.color}`}>{tierConfig.label}</h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#6B7280] mb-1">{copy.balance}</p>
          <p className="text-xl font-bold text-[#111827]">{points.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
