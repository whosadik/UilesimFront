import { AlertCircle, RefreshCw } from 'lucide-react';

import { Button } from './Button';
import { useI18n } from '../../shared/i18n/LanguageContext';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  const { messages } = useI18n();

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#FBE5E5] bg-gradient-to-br from-red-50/40 via-white to-white px-6 py-14 text-center sm:py-16">
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-red-100/50 blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-md flex-col items-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-50 to-white text-red-500 shadow-[0_8px_24px_-12px_rgba(239,68,68,0.25)]">
          <AlertCircle className="h-7 w-7" />
        </div>

        <h3 className="mb-2 text-lg font-bold tracking-tight text-[#111827] sm:text-xl">
          {title ?? messages.errors.genericTitle}
        </h3>
        <p className="mb-6 text-sm leading-relaxed text-[#6B7280]">
          {description ?? messages.errors.genericDescription}
        </p>
        {onRetry ? (
          <Button variant="primary" onClick={onRetry} className="inline-flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            {messages.errors.retry}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
