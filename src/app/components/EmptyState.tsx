import { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  tone?: 'default' | 'loyalty';
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  tone = 'default',
}: EmptyStateProps) {
  const isLoyalty = tone === 'loyalty';

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#EAE6EF] bg-white px-6 py-14 text-center sm:py-16">
      <div
        className={`pointer-events-none absolute -top-24 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full blur-3xl ${
          isLoyalty ? 'bg-[#FFE1F2]/80' : 'bg-[#F3F4F6]'
        }`}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 right-0 h-52 w-52 rounded-full bg-[#FFF8F5] blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-md flex-col items-center">
        <div
          className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${
            isLoyalty
              ? 'bg-gradient-to-br from-[#FFE1F2] to-white text-[#FF4DB8]'
              : 'bg-gradient-to-br from-[#F3F4F6] to-white text-[#111827]'
          } shadow-[0_8px_24px_-12px_rgba(17,24,39,0.15)]`}
        >
          {icon ?? <Sparkles className="h-7 w-7" />}
        </div>

        <h3 className="mb-2 text-lg font-bold tracking-tight text-[#111827] sm:text-xl">
          {title}
        </h3>
        {description ? (
          <p className="mb-6 text-sm leading-relaxed text-[#6B7280]">{description}</p>
        ) : null}

        {action || secondaryAction ? (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {action ? (
              <Button variant="primary" onClick={action.onClick}>
                {action.label}
              </Button>
            ) : null}
            {secondaryAction ? (
              <Button variant="ghost" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
