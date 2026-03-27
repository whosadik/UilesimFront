import { useState } from 'react';
import { Link } from 'react-router';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';

import { ApiError } from '../../shared/api/ApiError';
import { requestPasswordReset } from '../../shared/api/auth';
import { useI18n } from '../../shared/i18n/LanguageContext';
import { AlertBanner } from '../components/AlertBanner';
import { Button } from '../components/Button';

function formatResetRequestError(error: unknown, fallbackMessage: string): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

export default function ForgotPasswordPage() {
  const { messages } = useI18n();
  const forgotPasswordMessages = messages.pages.auth.forgotPassword;
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError(forgotPasswordMessages.enterEmail);
      return;
    }

    setIsLoading(true);
    try {
      const response = await requestPasswordReset(email.trim());
      setSuccessMessage(response.message);
      toast.success(forgotPasswordMessages.successToast);
    } catch (requestError) {
      setError(formatResetRequestError(requestError, forgotPasswordMessages.requestError));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-centered-with-navbar-offset flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-serif text-gray-900">{forgotPasswordMessages.title}</h1>
          <p className="text-gray-600">{forgotPasswordMessages.subtitle}</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? <AlertBanner variant="error" message={error} dismissible /> : null}
            {successMessage ? <AlertBanner variant="success" message={successMessage} /> : null}

            <div>
              <label htmlFor="forgot-password-email" className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  id="forgot-password-email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="name@example.com"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
              {isLoading ? forgotPasswordMessages.submitting : forgotPasswordMessages.submit}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          {forgotPasswordMessages.rememberedPassword}{' '}
          <Link to="/login" className="font-medium text-gray-900 hover:underline">
            {forgotPasswordMessages.backToSignIn}
          </Link>
        </p>
      </div>
    </div>
  );
}
