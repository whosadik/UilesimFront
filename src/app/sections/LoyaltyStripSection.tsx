import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Crown, Gift, Map, Sparkles, Star } from 'lucide-react';

import { useAuth } from '../../shared/auth/AuthContext';
import { useI18n } from '../../shared/i18n/LanguageContext';
import { ApiError } from '../../shared/api/ApiError';
import { getLoyalty, type Loyalty } from '../../shared/api/me';
import { AnimatedNumber } from '../components/AnimatedNumber';

type NormalizedTier = 'bronze' | 'silver' | 'gold';

const TIER_ORDER: NormalizedTier[] = ['bronze', 'silver', 'gold'];

const TIER_THRESHOLDS: Record<NormalizedTier, number> = {
  bronze: 0,
  silver: 1500,
  gold: 5000,
};

const TIER_GRADIENT: Record<NormalizedTier, string> = {
  bronze: 'from-[#F7E2CB] via-[#FFEBD6] to-[#FFF4E5]',
  silver: 'from-[#E5E7EB] via-[#F1F2F5] to-[#FAFAFB]',
  gold: 'from-[#FFE7A3] via-[#FFF3C7] to-[#FFF9DF]',
};

const TIER_ACCENT: Record<NormalizedTier, string> = {
  bronze: 'text-amber-700',
  silver: 'text-slate-600',
  gold: 'text-yellow-700',
};

function normalizeTier(raw: string | null | undefined): NormalizedTier {
  if (!raw) return 'bronze';
  const lowered = raw.trim().toLowerCase();
  if (TIER_ORDER.includes(lowered as NormalizedTier)) {
    return lowered as NormalizedTier;
  }
  return 'gold';
}

function nextTier(tier: NormalizedTier): NormalizedTier | null {
  const idx = TIER_ORDER.indexOf(tier);
  if (idx === -1 || idx === TIER_ORDER.length - 1) return null;
  return TIER_ORDER[idx + 1];
}

export function LoyaltyStripSection() {
  const { messages } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const [loyalty, setLoyalty] = useState<Loyalty | null>(null);
  const [loyaltyLoading, setLoyaltyLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoyalty(null);
      return;
    }

    let cancelled = false;
    setLoyaltyLoading(true);

    getLoyalty()
      .then((data) => {
        if (!cancelled) setLoyalty(data);
      })
      .catch((error) => {
        if (!(error instanceof ApiError)) {
          return;
        }
      })
      .finally(() => {
        if (!cancelled) setLoyaltyLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const copy = messages.home.loyaltyStrip;
  const tierLabels = messages.home.tiers;

  const tier = useMemo<NormalizedTier>(
    () => normalizeTier(loyalty?.tier ?? null),
    [loyalty?.tier],
  );
  const points = loyalty?.points_balance ?? 0;

  const next = nextTier(tier);
  const nextThreshold = next ? TIER_THRESHOLDS[next] : TIER_THRESHOLDS[tier];
  const currentThreshold = TIER_THRESHOLDS[tier];
  const progress = next
    ? Math.max(0, Math.min(1, (points - currentThreshold) / (nextThreshold - currentThreshold)))
    : 1;
  const remaining = next ? Math.max(0, nextThreshold - points) : 0;

  const isAuthed = Boolean(user);
  const firstName = user
    ? user.username || (typeof user.email === 'string' ? user.email.split('@')[0] : '') || 'beauty'
    : '';

  const greeting = isAuthed ? copy.greetingUser(firstName) : copy.greetingGuest;
  const subtitle = isAuthed
    ? copy.subtitleUser(tierLabels[tier], points)
    : copy.subtitleGuest;

  const perks = [
    { key: 'points', icon: Sparkles, color: 'text-[#FF4DB8]', bg: 'bg-[#FFE1F2]' },
    { key: 'offers', icon: Gift, color: 'text-amber-600', bg: 'bg-amber-50' },
    { key: 'roadmap', icon: Map, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { key: 'birthday', icon: Star, color: 'text-sky-600', bg: 'bg-sky-50' },
  ] as const;

  const showSkeleton = authLoading || (isAuthed && loyaltyLoading && !loyalty);

  return (
    <section className="py-10 lg:py-14">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
        <div className="reveal animate-fade-up relative overflow-hidden rounded-3xl border border-[#EAE6EF] bg-white shadow-[0_2px_30px_-12px_rgba(17,24,39,0.12)]">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${TIER_GRADIENT[tier]} opacity-70`}
            aria-hidden
          />
          <div
            className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/60 blur-3xl"
            aria-hidden
          />
          <div
            className="absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-[#FF4DB8]/10 blur-3xl"
            aria-hidden
          />

          <div className="relative z-10 grid grid-cols-1 gap-10 p-6 sm:p-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:p-12">
            <div className="flex flex-col justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 backdrop-blur">
                  <Crown className={`h-3.5 w-3.5 ${TIER_ACCENT[tier]}`} />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#111827]/70">
                    {copy.eyebrow}
                  </span>
                </div>

                <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-[#111827] sm:text-4xl lg:text-[44px]">
                  {greeting}
                </h2>
                {isAuthed ? (
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-[#374151] sm:text-base">
                    Статус{' '}
                    <span className="font-semibold text-[#111827]">{tierLabels[tier]}</span>
                    {' • '}
                    <AnimatedNumber
                      value={points}
                      className="font-semibold tabular-nums text-[#111827]"
                    />{' '}
                    баллов
                  </p>
                ) : (
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-[#374151] sm:text-base">
                    {subtitle}
                  </p>
                )}
              </div>

              <div className="mt-8 space-y-3">
                {showSkeleton ? (
                  <div className="h-2.5 w-full animate-pulse rounded-full bg-white/60" />
                ) : isAuthed && next ? (
                  <>
                    <div className="flex items-center justify-between text-xs font-medium text-[#111827]/75">
                      <span className="uppercase tracking-[0.14em]">
                        {tierLabels[tier]}
                      </span>
                      <span className="uppercase tracking-[0.14em]">
                        {tierLabels[next]}
                      </span>
                    </div>
                    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/60">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#111827] via-[#3b2a52] to-[#FF4DB8] transition-[width] duration-700 ease-out"
                        style={{ width: `${Math.max(6, progress * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#111827]/70">
                      {copy.progressLabel(tierLabels[next], remaining)}
                    </p>
                  </>
                ) : isAuthed ? (
                  <p className="text-sm font-medium text-[#111827]/80">{copy.progressMaxed}</p>
                ) : null}

                <div className="pt-3">
                  {isAuthed ? (
                    <Link
                      to="/me"
                      className="group inline-flex items-center gap-2 rounded-full bg-[#111827] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#0B1220] hover:shadow-lg active:scale-[0.98]"
                    >
                      {copy.profileButton}
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                  ) : (
                    <Link
                      to="/register"
                      className="group inline-flex items-center gap-2 rounded-full bg-[#111827] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#0B1220] hover:shadow-lg active:scale-[0.98]"
                    >
                      {copy.joinButton}
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#111827]/60">
                {copy.perksTitle}
              </p>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {perks.map(({ key, icon: Icon, color, bg }) => {
                  const perk = copy.perks[key];
                  return (
                    <li
                      key={key}
                      className="flex items-start gap-3 rounded-2xl border border-white/60 bg-white/70 p-4 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                        <Icon className={`h-4 w-4 ${color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#111827]">{perk.title}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-[#6B7280]">
                          {perk.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
