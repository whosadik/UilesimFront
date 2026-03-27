import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { toast } from 'sonner';

import { ApiError } from '../../shared/api/ApiError';
import { confirmPasswordReset, validatePasswordResetLink } from '../../shared/api/auth';
import { useI18n } from '../../shared/i18n/LanguageContext';
import { AlertBanner } from '../components/AlertBanner';
import { Button } from '../components/Button';

function formatResetConfirmError(error: unknown, fallbackMessage: string): string {
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

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { messages } = useI18n();
  const resetPasswordMessages = messages.pages.auth.resetPassword;
  const [searchParams] = useSearchParams();
  const uid = searchParams.get('uid') ?? '';
  const token = searchParams.get('token') ?? '';

  const [isChecking, setIsChecking] = useState(true);
  const [isValidLink, setIsValidLink] = useState(false);
  const [statusMessage, setStatusMessage] = useState(resetPasswordMessages.checkingLink);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid || !token) {
      setIsChecking(false);
      setIsValidLink(false);
      setStatusMessage(resetPasswordMessages.incompleteLink);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const response = await validatePasswordResetLink(uid, token);
        if (cancelled) {
          return;
        }
        setIsValidLink(response.valid);
        setStatusMessage(response.message);
      } catch (validationError) {
        if (cancelled) {
          return;
        }
        setIsValidLink(false);
        setStatusMessage(
          validationError instanceof Error
            ? validationError.message
            : resetPasswordMessages.invalidLink,
        );
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [resetPasswordMessages.incompleteLink, resetPasswordMessages.invalidLink, token, uid]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!password || !passwordConfirm) {
      setError(resetPasswordMessages.fillBothFields);
      return;
    }

    if (password !== passwordConfirm) {
      setError(resetPasswordMessages.passwordsDontMatch);
      return;
    }

    setIsSaving(true);
    try {
      const response = await confirmPasswordReset(uid, token, password, passwordConfirm);
      toast.success(response.message);
      navigate('/login', { replace: true });
    } catch (requestError) {
      setError(formatResetConfirmError(requestError, resetPasswordMessages.resetError));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-centered-with-navbar-offset flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-serif text-gray-900">{resetPasswordMessages.title}</h1>
          <p className="text-gray-600">{resetPasswordMessages.subtitle}</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          {isChecking ? (
            <AlertBanner variant="info" message={statusMessage} />
          ) : isValidLink ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error ? <AlertBanner variant="error" message={error} dismissible /> : null}

              <AlertBanner variant="success" message={statusMessage} />

              <div>
                <label htmlFor="reset-password" className="mb-2 block text-sm font-medium text-gray-700">
                  {resetPasswordMessages.newPasswordLabel}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="reset-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-12 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder={resetPasswordMessages.newPasswordPlaceholder}
                    disabled={isSaving}
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
                <label htmlFor="reset-password-confirm" className="mb-2 block text-sm font-medium text-gray-700">
                  {resetPasswordMessages.confirmPasswordLabel}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPasswordConfirm ? 'text' : 'password'}
                    id="reset-password-confirm"
                    value={passwordConfirm}
                    onChange={(event) => setPasswordConfirm(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-12 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder={resetPasswordMessages.confirmPasswordPlaceholder}
                    disabled={isSaving}
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

              <Button type="submit" variant="primary" className="w-full" disabled={isSaving}>
                {isSaving ? resetPasswordMessages.submitting : resetPasswordMessages.submit}
              </Button>
            </form>
          ) : (
            <div className="space-y-5">
              <AlertBanner variant="warning" message={statusMessage} />
              <Link
                to="/forgot-password"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#111827] px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-[#0B1220] hover:shadow-lg active:scale-[0.98]"
              >
                {resetPasswordMessages.requestNewLink}
              </Link>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          {resetPasswordMessages.backToLabel}{' '}
          <Link to="/login" className="font-medium text-gray-900 hover:underline">
            {resetPasswordMessages.signIn}
          </Link>
        </p>
      </div>
    </div>
  );
}
