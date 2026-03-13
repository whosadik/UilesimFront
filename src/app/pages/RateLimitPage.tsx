import { Clock, Home, Coffee } from "lucide-react";
import { Button } from "../components/Button";

export default function RateLimitPage() {
  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="page-centered-with-navbar-offset bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="w-12 h-12 text-yellow-600" />
          </div>
        </div>

        {/* Content */}
        <h1 className="text-4xl font-semibold text-gray-900 mb-3">429</h1>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Слишком много запросов
        </h2>
        <p className="text-gray-600 mb-8">
          Вы отправили слишком много запросов за короткое время. Пожалуйста, подождите немного и
          попробуйте снова.
        </p>

        {/* Countdown timer (mock) */}
        <div className="mb-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <Coffee className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-sm text-gray-700">
            Попробуйте снова через <span className="font-semibold">30 секунд</span>
          </p>
        </div>

        {/* Actions */}
        <Button variant="primary" onClick={handleGoHome}>
          <Home className="w-4 h-4 mr-2" />
          На главную
        </Button>

        {/* Info */}
        <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200 text-left">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Почему это произошло?</strong>
          </p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Слишком частые обновления страницы</li>
            <li>• Слишком много запросов к API</li>
            <li>• Автоматические скрипты или боты</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

