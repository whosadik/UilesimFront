import { Clock, Coffee, Home } from 'lucide-react';

import { useI18n } from '../../shared/i18n/LanguageContext';
import { Button } from '../components/Button';

export default function RateLimitPage() {
  const { messages } = useI18n();
  const rateLimitMessages = messages.pages.system.rateLimit;

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="page-centered-with-navbar-offset flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-100">
            <Clock className="h-12 w-12 text-yellow-600" />
          </div>
        </div>

        <h1 className="mb-3 text-4xl font-semibold text-gray-900">429</h1>
        <h2 className="mb-3 text-xl font-semibold text-gray-900">{rateLimitMessages.title}</h2>
        <p className="mb-8 text-gray-600">{rateLimitMessages.description}</p>

        <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <Coffee className="mx-auto mb-2 h-8 w-8 text-yellow-600" />
          <p className="text-sm text-gray-700">
            <span className="font-semibold">{rateLimitMessages.waitMessage(30)}</span>
          </p>
        </div>

        <Button variant="primary" onClick={handleGoHome}>
          <Home className="mr-2 h-4 w-4" />
          {rateLimitMessages.goHome}
        </Button>

        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-4 text-left">
          <p className="mb-2 text-sm text-gray-600">
            <strong>{rateLimitMessages.whyTitle}</strong>
          </p>
          <ul className="space-y-1 text-xs text-gray-600">
            {rateLimitMessages.reasons.map((reason) => (
              <li key={reason}>• {reason}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
