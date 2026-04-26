import { ArrowRight, Droplets, Flower2, Sun } from 'lucide-react';
import { Link } from 'react-router';

import { useI18n } from '../../shared/i18n/LanguageContext';

const STEPS = [
  { key: 'cleanse', icon: Droplets, label: 'Cleanse' },
  { key: 'treat', icon: Flower2, label: 'Treat' },
  { key: 'protect', icon: Sun, label: 'Protect' },
] as const;

export function EditorialBannerSection() {
  const { messages } = useI18n();
  const copy = messages.home.editorial;

  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
        <div className="relative overflow-hidden rounded-3xl bg-[#111827] text-white shadow-[0_20px_60px_-30px_rgba(17,24,39,0.6)]">
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,77,184,0.35),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(251,191,36,0.15),transparent_60%)]"
            aria-hidden
          />
          <div
            className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-[#FF4DB8]/30 blur-3xl animate-pulse-soft"
            aria-hidden
          />
          <div
            className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl"
            aria-hidden
          />
          <div
            className="absolute inset-0 opacity-[0.06]"
            aria-hidden
            style={{
              backgroundImage:
                'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          />

          <div className="relative z-10 grid grid-cols-1 gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16 lg:p-16">
            <div className="max-w-xl">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF4DB8]" />
                {copy.eyebrow}
              </p>

              <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[60px]">
                {copy.title}
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/75 sm:text-base">
                {copy.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/routine"
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-[#111827] transition-all hover:bg-white/90 hover:shadow-lg active:scale-[0.98]"
                >
                  {copy.cta}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to="/for-you"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/5"
                >
                  {copy.secondaryCta}
                </Link>
              </div>
            </div>

            <ol className="relative grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:gap-5">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <li
                    key={step.key}
                    className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm transition-all hover:border-white/25 hover:bg-white/[0.08] lg:min-w-[260px]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 transition-colors group-hover:bg-[#FF4DB8]/20">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
                        Step 0{index + 1}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-white">{step.label}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
