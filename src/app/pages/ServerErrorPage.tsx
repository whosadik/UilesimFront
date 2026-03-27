import { Home, RefreshCw, ServerCrash } from 'lucide-react';

import { useI18n } from '../../shared/i18n/LanguageContext';
import { Button } from '../components/Button';

export default function ServerErrorPage() {
  const { messages } = useI18n();
  const serverMessages = messages.pages.system.serverError;

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="page-centered-with-navbar-offset flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
            <ServerCrash className="h-12 w-12 text-red-600" />
          </div>
        </div>

        <h1 className="mb-3 text-4xl font-semibold text-gray-900">500</h1>
        <h2 className="mb-3 text-xl font-semibold text-gray-900">{serverMessages.title}</h2>
        <p className="mb-8 text-gray-600">{serverMessages.description}</p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="primary" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {serverMessages.refresh}
          </Button>
          <Button variant="ghost" onClick={handleGoHome}>
            <Home className="mr-2 h-4 w-4" />
            {serverMessages.goHome}
          </Button>
        </div>
      </div>
    </div>
  );
}
