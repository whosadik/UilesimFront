import { ReactNode } from 'react';

interface StatMiniProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function StatMini({ icon, title, description }: StatMiniProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/80 border border-[#EAE6EF] backdrop-blur-sm">
      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#FFE1F2] text-[#FF4DB8]">
        {icon}
      </div>
      <div>
        <div className="text-xs text-[#6B7280]">{title}</div>
        <div className="text-sm font-semibold text-[#111827]">{description}</div>
      </div>
    </div>
  );
}