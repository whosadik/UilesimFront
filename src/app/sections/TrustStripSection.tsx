import { Truck, ShieldCheck, Sparkles, MessageCircle } from 'lucide-react';

import { useI18n } from '../../shared/i18n/LanguageContext';

const ITEMS = [
  { key: 'delivery', icon: Truck },
  { key: 'original', icon: ShieldCheck },
  { key: 'points', icon: Sparkles },
  { key: 'support', icon: MessageCircle },
] as const;

export function TrustStripSection() {
  const { messages } = useI18n();
  const copy = messages.home.trustStrip;

  return (
    <section className="border-y border-[#EAE6EF] bg-white/70 backdrop-blur-sm">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-[30px]">
        <ul className="grid grid-cols-2 divide-x divide-[#EAE6EF] sm:grid-cols-4">
          {ITEMS.map(({ key, icon: Icon }) => {
            const item = copy[key];
            return (
              <li
                key={key}
                className="flex items-center gap-3 px-4 py-5 first:pl-0 last:pr-0 sm:px-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFE1F2] text-[#FF4DB8]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#111827] sm:text-sm">{item.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-[#6B7280] sm:text-xs">
                    {item.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
