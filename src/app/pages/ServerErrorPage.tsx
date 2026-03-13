import { ServerCrash, Home, RefreshCw } from "lucide-react";
import { Button } from "../components/Button";

export default function ServerErrorPage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="page-centered-with-navbar-offset bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <ServerCrash className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* Content */}
        <h1 className="text-4xl font-semibold text-gray-900 mb-3">500</h1>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Ошибка сервера
        </h2>
        <p className="text-gray-600 mb-8">
          Что-то пошло не так на нашей стороне. Мы уже работаем над исправлением. Пожалуйста,
          попробуйте обновить страницу или вернуться позже.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="primary" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Обновить страницу
          </Button>
          <Button variant="secondary" onClick={handleGoHome}>
            <Home className="w-4 h-4 mr-2" />
            На главную
          </Button>
        </div>

        {/* Error details (dev mode) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left">
            <p className="text-xs font-mono text-gray-600">
              Error ID: {Math.random().toString(36).substr(2, 9)}
            </p>
            <p className="text-xs font-mono text-gray-600 mt-1">
              Timestamp: {new Date().toISOString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

