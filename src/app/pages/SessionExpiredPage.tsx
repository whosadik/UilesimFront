import { LogIn, ShieldAlert } from 'lucide-react';

import { useI18n } from '../../shared/i18n/LanguageContext';
import { Button } from '../components/Button';

export default function SessionExpiredPage() {
  const { messages } = useI18n();
  const sessionMessages = messages.pages.system.sessionExpired;

  const handleLogin = () => {
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    window.location.href = '/login';
  };

  return (
    <div className="page-centered-with-navbar-offset flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-100">
            <ShieldAlert className="h-12 w-12 text-orange-600" />
          </div>
        </div>

        <h2 className="mb-3 text-xl font-semibold text-gray-900">{sessionMessages.title}</h2>
        <p className="mb-8 text-gray-600">{sessionMessages.description}</p>

        <Button variant="primary" onClick={handleLogin} className="w-full">
          <LogIn className="mr-2 h-4 w-4" />
          {sessionMessages.signInAgain}
        </Button>

        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-4 text-left">
          <p className="mb-2 text-sm text-gray-700">
            <strong>{sessionMessages.whyTitle}</strong>
          </p>
          <ul className="space-y-1 text-xs text-gray-600">
            {sessionMessages.reasons.map((reason) => (
              <li key={reason}>• {reason}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-gray-500">{sessionMessages.footer}</p>
        </div>
      </div>
    </div>
  );
}
