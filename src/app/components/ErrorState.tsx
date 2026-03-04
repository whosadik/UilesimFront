import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = 'Что-то пошло не так', 
  description = 'Попробуйте обновить страницу или повторить попытку позже',
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 mb-4 rounded-2xl bg-red-50 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-[#111827] mb-2">{title}</h3>
      <p className="text-sm text-[#6B7280] mb-6 max-w-md">{description}</p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry}>
          Попробовать снова
        </Button>
      )}
    </div>
  );
}
