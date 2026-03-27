import { RefreshCw, WifiOff } from 'lucide-react';

import { useI18n } from '../../shared/i18n/LanguageContext';
import { Button } from '../components/Button';

export default function NetworkErrorPage() {
  const { messages } = useI18n();
  const networkMessages = messages.pages.system.networkError;

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="page-centered-with-navbar-offset flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100">
            <WifiOff className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        <h2 className="mb-3 text-xl font-semibold text-gray-900">{networkMessages.title}</h2>
        <p className="mb-8 text-gray-600">{networkMessages.description}</p>

        <Button variant="primary" onClick={handleRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {networkMessages.retry}
        </Button>

        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-4 text-left">
          <p className="mb-2 text-sm text-gray-700">
            <strong>{networkMessages.tipsTitle}</strong>
          </p>
          <ul className="space-y-1 text-xs text-gray-600">
            {networkMessages.tips.map((tip) => (
              <li key={tip}>• {tip}</li>
            ))}
          </ul>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          <span>{networkMessages.offline}</span>
        </div>
      </div>
    </div>
  );
}
