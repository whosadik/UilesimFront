import { Sparkles, Truck, Gift, ShieldCheck } from 'lucide-react';

import { useI18n } from '../../shared/i18n/LanguageContext';

const ICONS = [Sparkles, Truck, Gift, ShieldCheck];

export function AnnouncementMarquee() {
  const { messages } = useI18n();
  const trust = messages.home?.trustStrip;
  if (!trust) return null;

  const items = [
    { text: trust.delivery.title, Icon: ICONS[1] },
    { text: trust.points.title, Icon: ICONS[0] },
    { text: trust.original.title, Icon: ICONS[3] },
    { text: trust.support.title, Icon: ICONS[2] },
  ];

  // Duplicate the list so the marquee track loops seamlessly.
  const track = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-b border-[#EAE6EF] bg-[#111827] text-white">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#111827] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#111827] to-transparent" />

      <div className="flex animate-marquee whitespace-nowrap py-2 text-[12px] tracking-[0.06em]">
        {track.map(({ text, Icon }, index) => (
          <span
            key={`${text}-${index}`}
            className="mx-6 inline-flex items-center gap-2 text-white/80"
          >
            <Icon className="h-3.5 w-3.5 text-[#FF4DB8]" />
            <span>{text}</span>
            <span className="ml-6 inline-block h-1 w-1 rounded-full bg-white/25" aria-hidden />
          </span>
        ))}
      </div>
    </div>
  );
}
