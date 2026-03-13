import { Button } from '../components/Button';
import { useNavigate } from 'react-router';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="page-with-navbar-offset min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="text-center px-6 max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-[#FF4DB8] mb-4">404</h1>
          <h2 className="text-2xl font-bold text-[#111827] mb-3">
            Страница не найдена
          </h2>
          <p className="text-base text-[#6B7280]">
            К сожалению, запрашиваемая страница не существует или была удалена
          </p>
        </div>

        <Button variant="primary" onClick={() => navigate('/')}>
          <Home className="w-4 h-4 mr-2" />
          На главную
        </Button>
      </div>
    </div>
  );
}

