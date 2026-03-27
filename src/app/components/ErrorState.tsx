import { AlertCircle } from 'lucide-react';

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
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-[#111827]">
        {title ?? messages.errors.genericTitle}
      </h3>
      <p className="mb-6 max-w-md text-sm text-[#6B7280]">
        {description ?? messages.errors.genericDescription}
      </p>
      {onRetry ? (
        <Button variant="primary" onClick={onRetry}>
          {messages.errors.retry}
        </Button>
      ) : null}
    </div>
  );
}
