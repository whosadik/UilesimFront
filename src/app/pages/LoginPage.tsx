import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '../../shared/auth/AuthContext';
import { savePendingVerificationEmail } from '../../shared/auth/emailVerificationStorage';
import { useI18n } from '../../shared/i18n/LanguageContext';
import { AlertBanner } from '../components/AlertBanner';
import { Button } from '../components/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { messages } = useI18n();
  const loginMessages = messages.pages.auth.login;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError(loginMessages.fillBothFields);
      return;
    }

    setIsLoading(true);

    try {
      const { isAdmin, user } = await login(email.trim(), password);
      const state = location.state as { from?: string } | null;
      const returnPath = typeof state?.from === 'string' ? state.from : null;

      if (user.email && user.email_verified === false) {
        if (typeof user.email === 'string' && user.email.trim()) {
          savePendingVerificationEmail(user.email);
        }

        toast.info(loginMessages.verifyEmailToast);
        navigate('/verify-email-pending', {
          replace: true,
          state: { email: user.email ?? '', from: returnPath ?? '/for-you' },
        });
        return;
      }

      const targetPath = isAdmin
        ? returnPath && returnPath.startsWith('/admin')
          ? returnPath
          : '/admin'
        : returnPath && !returnPath.startsWith('/admin')
          ? returnPath
          : '/for-you';

      toast.success(loginMessages.welcomeToast);
      navigate(targetPath, { replace: true });
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError(loginMessages.invalidCredentials);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-centered-with-navbar-offset flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-serif text-gray-900">Uilesim</h1>
          <p className="text-gray-600">{loginMessages.title}</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? <AlertBanner variant="error" message={error} dismissible /> : null}

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="name@example.com"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                {loginMessages.passwordLabel}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-12 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder={loginMessages.passwordPlaceholder}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-900"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-700">{loginMessages.rememberMe}</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-sm text-gray-600 transition-colors hover:text-gray-900"
              >
                {loginMessages.forgotPassword}
              </Link>
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
              {isLoading ? loginMessages.submitting : loginMessages.submit}
            </Button>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-center text-sm text-gray-500">
                {loginMessages.helper}
              </p>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          {loginMessages.noAccount}{' '}
          <Link to="/register" className="font-medium text-gray-900 hover:underline">
            {loginMessages.createAccount}
          </Link>
        </p>
      </div>
    </div>
  );
}
