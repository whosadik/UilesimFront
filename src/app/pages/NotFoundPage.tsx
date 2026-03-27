import { Home } from 'lucide-react';
import { useNavigate } from 'react-router';

import { useI18n } from '../../shared/i18n/LanguageContext';
import { Button } from '../components/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { messages } = useI18n();
  const notFoundMessages = messages.pages.system.notFound;

  return (
    <div className="page-with-navbar-offset flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-md px-6 text-center">
        <div className="mb-8">
          <h1 className="mb-4 text-9xl font-bold text-[#FF4DB8]">404</h1>
          <h2 className="mb-3 text-2xl font-bold text-[#111827]">{notFoundMessages.title}</h2>
          <p className="text-base text-[#6B7280]">{notFoundMessages.description}</p>
        </div>

        <Button variant="primary" onClick={() => navigate('/')}>
          <Home className="mr-2 h-4 w-4" />
          {notFoundMessages.goHome}
        </Button>
      </div>
    </div>
  );
}
