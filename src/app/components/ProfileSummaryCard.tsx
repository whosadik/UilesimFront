import { ChevronRight } from 'lucide-react';
import * as Progress from '@radix-ui/react-progress';
import { Button } from './Button';
import { LoyaltyBadge } from './LoyaltyBadge';

interface ProfileSummaryCardProps {
  profile: {
    name?: string;
    avatar?: string;
    initials?: string;
    completionPercentage: number;
  };
  loyalty: {
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    points: number;
  };
  onUpdateProfile?: () => void;
}

export function ProfileSummaryCard({ profile, loyalty, onUpdateProfile }: ProfileSummaryCardProps) {
  const pctRaw = Number(profile.completionPercentage);
  const pct = Number.isFinite(pctRaw) ? Math.max(0, Math.min(100, Math.round(pctRaw))) : 0;

  const isComplete = pct >= 100;

  return (
    <div className="p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-[#EAE6EF] shadow-sm">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFE1F2] to-pink-50 flex items-center justify-center text-2xl font-bold text-[#FF4DB8] flex-shrink-0">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.name || 'Avatar'} className="w-full h-full rounded-2xl object-cover" />
          ) : (
            profile.initials || profile.name?.charAt(0) || 'U'
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold text-[#111827] mb-1">
            Привет, {profile.name || 'Гость'}!
          </h3>
          <LoyaltyBadge tier={loyalty.tier} points={loyalty.points} variant="compact" />
        </div>
      </div>

      {!isComplete && (
        <div className="space-y-3 mb-6 pb-6 border-b border-[#EAE6EF]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6B7280]">Заполнение профиля</span>
            <span className="font-semibold text-[#FF4DB8]">{pct}%</span>
          </div>

          <Progress.Root className="relative overflow-hidden bg-gray-200 rounded-full w-full h-2" value={pct}>
            <Progress.Indicator
              className="bg-gradient-to-r from-[#FF4DB8] to-pink-400 h-full transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${100 - pct}%)` }}
            />
          </Progress.Root>

          <p className="text-xs text-[#6B7280]">
            Заполните профиль для персональных рекомендаций
          </p>
        </div>
      )}

      <Button
        variant="ghost"
        onClick={onUpdateProfile}
        className="w-full justify-between"
        disabled={!onUpdateProfile}
      >
        <span>{isComplete ? 'Обновить профиль' : 'Заполнить профиль'}</span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}