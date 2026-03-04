import { ShieldAlert, LogIn } from "lucide-react";
import { Button } from "../components/Button";

export default function SessionExpiredPage() {
  const handleLogin = () => {
    // Save current path to redirect after login
    localStorage.setItem("redirectAfterLogin", window.location.pathname);
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-12 h-12 text-orange-600" />
          </div>
        </div>

        {/* Content */}
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Сессия истекла
        </h2>
        <p className="text-gray-600 mb-8">
          Ваша сессия истекла из соображений безопасности. Пожалуйста, войдите в систему снова,
          чтобы продолжить.
        </p>

        {/* Actions */}
        <Button variant="primary" onClick={handleLogin} className="w-full">
          <LogIn className="w-4 h-4 mr-2" />
          Войти снова
        </Button>

        {/* Info */}
        <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200 text-left">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Почему это произошло?</strong>
          </p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Долгое отсутствие активности</li>
            <li>• Истек срок действия CSRF токена</li>
            <li>• Вы вышли из системы на другом устройстве</li>
          </ul>
          <p className="text-xs text-gray-500 mt-3">
            После входа вы вернетесь на эту страницу.
          </p>
        </div>
      </div>
    </div>
  );
}
