import { ChevronRight } from 'lucide-react';
import * as Progress from '@radix-ui/react-progress';
import { Button } from './Button';
import { LoyaltyBadge } from './LoyaltyBadge';
import { useI18n } from '../../shared/i18n/LanguageContext';

type LoyaltyTier = 'bronze' | 'silver' | 'gold';

interface ProfileSummaryCardProps {
  profile: {
    name?: string;
    avatar?: string;
    avatar_url?: string;
    initials?: string;
    completionPercentage: number | string;
  };
  loyalty: {
    tier: LoyaltyTier | string | null | undefined;
    points?: number | string;
    points_balance?: number | string;
  };
  onUpdateProfile?: () => void;
}

const profileSummaryCopy = {
  ru: {
    guest: 'Гость',
    hello: (name: string) => `Привет, ${name}!`,
    profileProgress: 'Заполнение профиля',
    fillDescription: 'Заполните профиль для персональных рекомендаций.',
    update: 'Обновить профиль',
    complete: 'Заполнить профиль',
  },
  kk: {
    guest: 'Қонақ',
    hello: (name: string) => `Сәлем, ${name}!`,
    profileProgress: 'Профильді толтыру',
    fillDescription: 'Жеке ұсыныстар алу үшін профильді толтырыңыз.',
    update: 'Профильді жаңарту',
    complete: 'Профильді толтыру',
  },
  en: {
    guest: 'Guest',
    hello: (name: string) => `Hello, ${name}!`,
    profileProgress: 'Profile completion',
    fillDescription: 'Complete your profile to receive personal recommendations.',
    update: 'Update profile',
    complete: 'Complete profile',
  },
} as const;

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function normalizeTier(rawTier: unknown): LoyaltyTier {
  const value = String(rawTier ?? '').trim().toLowerCase();
  if (!value || value === 'bronze') return 'bronze';
  if (value === 'silver' || value === 'gold') return value;
  return 'gold';
}

export function ProfileSummaryCard({ profile, loyalty, onUpdateProfile }: ProfileSummaryCardProps) {
  const { language } = useI18n();
  const copy = profileSummaryCopy[language];
  const pctRaw = toNumber(profile.completionPercentage);
  const pct = pctRaw !== undefined ? Math.max(0, Math.min(100, Math.round(pctRaw))) : 0;
  const pointsRaw = toNumber(loyalty.points ?? loyalty.points_balance);
  const points = pointsRaw !== undefined ? Math.max(0, Math.round(pointsRaw)) : 0;
  const tier = normalizeTier(loyalty.tier);

  const profileName = typeof profile.name === 'string' && profile.name.trim() ? profile.name.trim() : copy.guest;
  const avatarSource =
    (typeof profile.avatar === 'string' && profile.avatar.trim()) ||
    (typeof profile.avatar_url === 'string' && profile.avatar_url.trim()) ||
    undefined;
  const initials = (typeof profile.initials === 'string' && profile.initials.trim()) || profileName.charAt(0) || 'U';
  const isComplete = pct >= 100;

  return (
    <div className="p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-[#EAE6EF] shadow-sm">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFE1F2] to-pink-50 flex items-center justify-center text-2xl font-bold text-[#FF4DB8] flex-shrink-0">
          {avatarSource ? <img src={avatarSource} alt={profileName} className="w-full h-full rounded-2xl object-cover" /> : initials}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[#111827] mb-1">{copy.hello(profileName)}</h3>
          <LoyaltyBadge tier={tier} points={points} variant="compact" />
        </div>
      </div>

      {!isComplete && (
        <div className="space-y-3 mb-6 pb-6 border-b border-[#EAE6EF]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6B7280]">{copy.profileProgress}</span>
            <span className="font-semibold text-[#FF4DB8]">{pct}%</span>
          </div>
          <Progress.Root className="relative overflow-hidden bg-gray-200 rounded-full w-full h-2" value={pct}>
            <Progress.Indicator className="bg-gradient-to-r from-[#FF4DB8] to-pink-400 h-full transition-transform duration-500 ease-out" style={{ transform: `translateX(-${100 - pct}%)` }} />
          </Progress.Root>
          <p className="text-xs text-[#6B7280]">{copy.fillDescription}</p>
        </div>
      )}

      <Button variant="ghost" onClick={onUpdateProfile} className="w-full justify-between" disabled={!onUpdateProfile}>
        <span>{isComplete ? copy.update : copy.complete}</span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
