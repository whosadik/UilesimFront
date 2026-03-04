import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { Button } from "../components/Button";
import { AlertBanner } from "../components/AlertBanner";
import { toast } from "sonner";

/**
 * DEV NOTES:
 * Endpoint: POST /api-auth/login/
 * Auth: SessionAuth (Django SessionAuthentication)
 * CSRF: Required (X-CSRFToken header)
 * 
 * Request: { username: string, password: string }
 * Response success: { ok: true, user: {...}, session_key: string }
 * Response error: { ok: false, code: "invalid_credentials", message: string }
 * 
 * После успешного логина редирект на /for-you или запомненный путь
 * CSRF token получается из cookie csrftoken
 */

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("Заполните все поля");
      return;
    }

    setIsLoading(true);

    // TODO: Replace with actual API call
    // const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1];
    // const response = await fetch('/api-auth/login/', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'X-CSRFToken': csrfToken || '',
    //   },
    //   credentials: 'include',
    //   body: JSON.stringify({ username, password }),
    // });

    // Mock login
    setTimeout(() => {
      setIsLoading(false);

      if (username === "demo" && password === "demo") {
        toast.success("Добро пожаловать!");
        // Store session info
        localStorage.setItem("isAuthenticated", "true");
        navigate("/for-you");
      } else {
        setError("Неверное имя пользователя или пароль");
      }
    }, 1000);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Uilesim</h1>
          <p className="text-gray-600">Войдите в свой аккаунт</p>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error banner */}
            {error && (
              <AlertBanner
                variant="error"
                message={error}
                dismissible
              />
            )}

            {/* Username field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Имя пользователя
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="Введите имя пользователя"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="Введите пароль"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 border-gray-300 rounded text-gray-900 focus:ring-2 focus:ring-gray-900"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-700">Запомнить меня</span>
              </label>

              <button
                type="button"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Забыли пароль?
              </button>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
              loading={isLoading}
            >
              Войти
            </Button>

            {/* Demo hint */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 text-center">
                Демо доступ: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">demo / demo</span>
              </p>
            </div>
          </form>
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Нет аккаунта?{" "}
          <button className="text-gray-900 font-medium hover:underline">
            Зарегистрироваться
          </button>
        </p>
      </div>
    </div>
  );
}
