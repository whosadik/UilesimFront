import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "../components/Button";

export default function NetworkErrorPage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
            <WifiOff className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        {/* Content */}
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Нет подключения к сети
        </h2>
        <p className="text-gray-600 mb-8">
          Не удается установить соединение с сервером. Проверьте подключение к интернету и
          попробуйте снова.
        </p>

        {/* Actions */}
        <Button variant="primary" onClick={handleRetry}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Попробовать снова
        </Button>

        {/* Troubleshooting */}
        <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200 text-left">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Что можно попробовать:</strong>
          </p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Проверьте подключение к Wi-Fi или мобильным данным</li>
            <li>• Перезагрузите роутер</li>
            <li>• Попробуйте другую сеть</li>
            <li>• Отключите VPN (если используется)</li>
            <li>• Проверьте настройки брандмауэра</li>
          </ul>
        </div>

        {/* Status indicator */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>Офлайн</span>
        </div>
      </div>
    </div>
  );
}
