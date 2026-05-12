import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { CheckCircle2, LoaderCircle, MailWarning } from 'lucide-react';

import { ApiError } from '../../shared/api/ApiError';
import { verifyEmail } from '../../shared/api/auth';
import { useAuth } from '../../shared/auth/AuthContext';
import { clearPendingVerificationState } from '../../shared/auth/emailVerificationStorage';
import { useI18n } from '../../shared/i18n/LanguageContext';
import { AlertBanner } from '../components/AlertBanner';

function formatVerifyError(error: unknown, fallbackMessage: string): string {
  if (error instanceof ApiError) {
    const details = error.details;
    if (details && typeof details === 'object' && !Array.isArray(details)) {
      const tokenErrors = (details as { token?: unknown }).token;
      if (Array.isArray(tokenErrors) && tokenErrors.length > 0 && typeof tokenErrors[0] === 'string') {
        return tokenErrors[0];
      }
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

export default function VerifyEmailPage() {
  const { messages } = useI18n();
  const verifyEmailMessages = messages.pages.auth.verifyEmail;
  const [searchParams] = useSearchParams();
  const { user, refresh } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState(verifyEmailMessages.checkingLink);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage(verifyEmailMessages.missingToken);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const response = await verifyEmail(token);
        if (cancelled) {
          return;
        }
        clearPendingVerificationState();
        setStatus('success');
        setMessage(response.message);
        await refresh().catch(() => undefined);
      } catch (error) {
        if (cancelled) {
          return;
        }
        setStatus('error');
        setMessage(formatVerifyError(error, verifyEmailMessages.verifyError));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refresh, searchParams, verifyEmailMessages.missingToken, verifyEmailMessages.verifyError]);

  return (
    <div className="page-centered-with-navbar-offset flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl rounded-3xl border border-gray-100 bg-white p-8 shadow-sm md:p-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
          {status === 'verifying' ? (
            <LoaderCircle className="h-8 w-8 animate-spin text-gray-700" />
          ) : status === 'success' ? (
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          ) : (
            <MailWarning className="h-8 w-8 text-amber-600" />
          )}
        </div>

        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-serif text-gray-900">{verifyEmailMessages.title}</h1>
          <p className="text-gray-600">
            {status === 'verifying'
              ? verifyEmailMessages.verifyingDescription
              : status === 'success'
                ? verifyEmailMessages.successDescription
                : verifyEmailMessages.errorDescription}
          </p>
        </div>

        <AlertBanner
          variant={status === 'success' ? 'success' : status === 'error' ? 'warning' : 'info'}
          message={message}
        />

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          {status === 'success' ? (
            <Link
              to={user ? '/for-you' : '/login'}
              className="inline-flex items-center justify-center rounded-full bg-brand-pink-500 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-brand-pink-600 hover:shadow-lg active:scale-[0.98]"
            >
              {user ? verifyEmailMessages.goToForYou : verifyEmailMessages.goToSignIn}
            </Link>
          ) : null}

          {status !== 'verifying' ? (
            <Link
              to={user ? '/for-you' : '/register'}
              className="inline-flex items-center justify-center rounded-full border border-[#EAE6EF] bg-white/80 px-6 py-3 text-sm font-medium text-gray-800 transition-all duration-200 hover:border-[#FF4DB8]/20 hover:bg-white hover:shadow-md hover:shadow-[#FF4DB8]/10 active:scale-[0.98]"
            >
              {user ? verifyEmailMessages.backToForYou : verifyEmailMessages.backToRegister}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
