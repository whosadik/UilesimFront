import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { ApiError } from '../../shared/api/ApiError';
import { useAuth } from '../../shared/auth/AuthContext';
import { savePendingVerificationEmail } from '../../shared/auth/emailVerificationStorage';
import { useI18n } from '../../shared/i18n/LanguageContext';
import { AlertBanner } from '../components/AlertBanner';
import { Button } from '../components/Button';

function formatRegisterError(error: unknown, fallbackMessage: string): string {
  if (error instanceof ApiError) {
    const details = error.details;
    if (details && typeof details === 'object' && !Array.isArray(details)) {
      for (const value of Object.values(details as Record<string, unknown>)) {
        if (Array.isArray(value) && value.length > 0) {
          const first = value[0];
          if (typeof first === 'string' && first.trim()) {
            return first;
          }
        }
      }
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { messages } = useI18n();
  const registerMessages = messages.pages.auth.register;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password || !passwordConfirm) {
      setError(registerMessages.fillAllFields);
      return;
    }

    if (password !== passwordConfirm) {
      setError(registerMessages.passwordsDontMatch);
      return;
    }

    setIsLoading(true);

    try {
      const { response } = await register(email.trim(), password, passwordConfirm);
      savePendingVerificationEmail(
        response.verification_email,
        response.resend_available_in_seconds,
      );
      if (response.verification_email_sent) {
        toast.success(registerMessages.successToast);
      } else {
        toast.warning(registerMessages.warningToast);
      }
      navigate('/verify-email-pending', {
        replace: true,
        state: {
          email: response.verification_email,
          resendAvailableInSeconds: response.resend_available_in_seconds,
        },
      });
    } catch (requestError) {
      setError(formatRegisterError(requestError, registerMessages.createAccountError));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-centered-with-navbar-offset flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-serif text-gray-900">Uilesim</h1>
          <p className="text-gray-600">{registerMessages.title}</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? <AlertBanner variant="error" message={error} dismissible /> : null}

            <div>
              <label htmlFor="register-email" className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  id="register-email"
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
              <label htmlFor="register-password" className="mb-2 block text-sm font-medium text-gray-700">
                {registerMessages.passwordLabel}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="register-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-12 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder={registerMessages.passwordPlaceholder}
                  disabled={isLoading}
                  autoComplete="new-password"
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

            <div>
              <label htmlFor="register-password-confirm" className="mb-2 block text-sm font-medium text-gray-700">
                {registerMessages.confirmPasswordLabel}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  id="register-password-confirm"
                  value={passwordConfirm}
                  onChange={(event) => setPasswordConfirm(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-12 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder={registerMessages.confirmPasswordPlaceholder}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPasswordConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
              {isLoading ? registerMessages.submitting : registerMessages.submit}
            </Button>

            <p className="text-center text-xs text-gray-500">
              {registerMessages.helper}
            </p>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          {registerMessages.alreadyHaveAccount}{' '}
          <Link to="/login" className="font-medium text-gray-900 hover:underline">
            {registerMessages.signIn}
          </Link>
        </p>
      </div>
    </div>
  );
}
