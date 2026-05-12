import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, BadgePercent, Crown, Gift, Info, Leaf, Sparkles, Star } from 'lucide-react';

import { useAuth } from '../../shared/auth/AuthContext';
import { useI18n } from '../../shared/i18n/LanguageContext';
import { ApiError } from '../../shared/api/ApiError';
import { getLoyalty, type Loyalty } from '../../shared/api/me';
import { AnimatedNumber } from '../components/AnimatedNumber';
import loyaltyHeroBackground from '../../assets/loyalty-hero-background.png';

type NormalizedTier = 'bronze' | 'silver' | 'gold';

const TIER_ORDER: NormalizedTier[] = ['bronze', 'silver', 'gold'];

const TIER_THRESHOLDS: Record<NormalizedTier, number> = {
  bronze: 0,
  silver: 1500,
  gold: 5000,
};

const TIER_ACCENT: Record<NormalizedTier, string> = {
  bronze: 'text-[#A56A42]',
  silver: 'text-[#667085]',
  gold: 'text-[#C9985A]',
};

function normalizeTier(raw: string | null | undefined): NormalizedTier {
  if (!raw) return 'gold';
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
  const { messages, language } = useI18n();
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
  const numberLocale = language === 'en' ? 'en-US' : 'ru-RU';

  const tier = useMemo<NormalizedTier>(
    () => normalizeTier(loyalty?.tier ?? null),
    [loyalty?.tier],
  );
  const points = loyalty?.points_balance ?? 0;

  const next = nextTier(tier);
  const nextThreshold = next ? TIER_THRESHOLDS[next] : TIER_THRESHOLDS[tier];
  const remaining = next ? Math.max(0, nextThreshold - points) : 0;

  const isAuthed = Boolean(user);
  const firstName = isAuthed
    ? user?.username || (typeof user?.email === 'string' ? user.email.split('@')[0] : '')
    : '';
  const displayName = firstName.trim() || copy.fallbackName;

  const perks = [
    {
      key: 'points',
      icon: Sparkles,
      color: 'text-[#D95F86]',
      bg: 'bg-[#FDE7EF]',
    },
    {
      key: 'offers',
      icon: Gift,
      color: 'text-[#D88928]',
      bg: 'bg-[#FFEFD6]',
    },
    {
      key: 'roadmap',
      icon: Leaf,
      color: 'text-[#78A95F]',
      bg: 'bg-[#EAF4DC]',
    },
    {
      key: 'birthday',
      icon: Gift,
      color: 'text-[#268CD9]',
      bg: 'bg-[#E2F1FF]',
    },
  ] as const;

  const showSkeleton = authLoading || (isAuthed && loyaltyLoading && !loyalty);
  const heroDescription = !isAuthed
    ? copy.subtitleGuest
    : next
      ? copy.progressLabel(tierLabels[next], remaining)
      : copy.progressMaxed;
  const statusStripText = !isAuthed
    ? copy.statusStripGuest
    : next
      ? copy.statusStripProgress(tierLabels[next], remaining)
      : copy.statusStripMax(tierLabels[tier]);
  const profileHref = isAuthed ? '/me' : '/register';
  const primaryCta = isAuthed ? copy.profileButton : copy.joinButton;

  return (
    <section id="loyalty" className="py-10 lg:py-14">
      <div className="mx-auto max-w-[1160px] px-6 lg:px-10">
        <div className="reveal animate-fade-up relative isolate overflow-hidden rounded-[28px] border border-white/70 bg-[#FFF3E6] shadow-[0_28px_80px_-36px_rgba(13,18,32,0.36)]">
          <img
            src={loyaltyHeroBackground}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[67%_center] opacity-80 sm:opacity-90"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,248,244,0.98)_0%,rgba(255,246,242,0.94)_34%,rgba(255,246,242,0.58)_60%,rgba(255,246,242,0.16)_100%)]"
            aria-hidden
          />
          <div
            className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-[#FDE7EF]/80 blur-3xl"
            aria-hidden
          />
          <div
            className="absolute bottom-16 right-10 h-72 w-72 rounded-full bg-[#FFEFD6]/55 blur-3xl"
            aria-hidden
          />

          <div className="relative z-10 flex flex-col gap-5 p-5 sm:p-8 lg:min-h-[620px] lg:p-10">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)] lg:gap-8">
              <div className="min-w-0 pt-2">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3.5 py-1.5 shadow-[0_10px_28px_-22px_rgba(13,18,32,0.55)] backdrop-blur-md">
                  <Crown className={`h-3.5 w-3.5 ${TIER_ACCENT[tier]}`} />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0D1220]/70">
                    {copy.eyebrow}
                  </span>
                </div>

                <h2 className="font-display max-w-[520px] text-[34px] font-semibold leading-[1.04] text-[#0D1220] [letter-spacing:0] sm:text-[44px] lg:text-[50px]">
                  <span className="block">{copy.greetingLead}</span>
                  <span className="block break-words [overflow-wrap:anywhere]">{displayName}</span>
                </h2>

                <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] leading-relaxed text-[#374151] sm:text-base">
                  <span>{copy.statusLabel}</span>
                  <span className={`font-semibold ${TIER_ACCENT[tier]}`}>{tierLabels[tier]}</span>
                  <span className="text-[#0D1220]/50">•</span>
                  {showSkeleton ? (
                    <span className="h-4 w-20 animate-pulse rounded-full bg-white/70" />
                  ) : (
                    <AnimatedNumber
                      value={points}
                      locale={numberLocale}
                      className="font-semibold tabular-nums text-[#0D1220]"
                    />
                  )}
                  <span>{copy.pointsLabel}</span>
                </p>

                <p className="mt-4 max-w-[430px] text-[15px] leading-7 text-[#4B5563] sm:text-base">
                  {heroDescription}
                </p>

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link
                    to={profileHref}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-pink-500 px-6 py-3 text-[15px] font-semibold text-white shadow-[0_18px_34px_-22px_rgba(255,77,184,0.75)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-pink-600 hover:shadow-[0_22px_42px_-22px_rgba(255,77,184,0.85)] active:translate-y-0 sm:w-auto"
                  >
                    {primaryCta}
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>

                  <Link
                    to="/help#loyalty"
                    className="inline-flex items-center justify-center gap-2 text-sm font-medium text-[#0D1220]/75 underline decoration-[#0D1220]/25 underline-offset-4 transition-colors hover:text-[#0D1220] sm:justify-start"
                  >
                    {copy.workLink}
                    <Info className="h-4 w-4 text-[#0D1220]/50" />
                  </Link>
                </div>
              </div>
            </div>

            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {perks.map(({ key, icon: Icon, color, bg }) => {
                const perk = copy.perks[key];
                return (
                  <li
                    key={key}
                    className="group relative min-h-[108px] overflow-hidden rounded-2xl border border-white/75 bg-white/70 p-4 shadow-[0_18px_44px_-34px_rgba(13,18,32,0.45)] backdrop-blur-[14px] transition-all duration-200 hover:-translate-y-1 hover:bg-white/90 hover:shadow-[0_24px_48px_-30px_rgba(13,18,32,0.5)] lg:min-h-[132px] lg:p-4"
                  >
                    <div className="absolute right-5 top-5 text-[#F472B6]/40 transition-transform duration-200 group-hover:scale-110">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex items-start gap-3 lg:gap-2.5">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full lg:h-10 lg:w-10 ${bg}`}>
                        <Icon className={`h-6 w-6 lg:h-5 lg:w-5 ${color}`} />
                      </div>
                      <div className="min-w-0 pr-3 lg:pr-1">
                        <p className="text-[15px] font-semibold leading-snug text-[#0D1220] lg:text-[14px] lg:leading-[1.24]">
                          {perk.title}
                        </p>
                        <p className="mt-2 text-[13px] leading-5 text-[#5E6673] lg:mt-1.5 lg:text-[12px] lg:leading-[1.45]">
                          {perk.description}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="flex flex-col gap-3 rounded-2xl border border-white/70 bg-white/60 px-4 py-3 shadow-[0_18px_44px_-34px_rgba(13,18,32,0.45)] backdrop-blur-[14px] sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex items-center gap-3 text-sm text-[#4B5563]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FDE7EF] text-[#D95F86]">
                  <Sparkles className="h-4 w-4" />
                </span>
                <span>{statusStripText}</span>
              </div>
              <Link
                to="/help#loyalty"
                className="group inline-flex items-center gap-2 self-start text-sm font-medium text-[#0D1220] underline decoration-[#0D1220]/20 underline-offset-4 transition-colors hover:text-[#C9985A] sm:self-auto"
              >
                {copy.statusesLink}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
