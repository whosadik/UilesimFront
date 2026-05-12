import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Clock3, Mail, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { ApiError } from '../../shared/api/ApiError';
import { getVerificationStatus } from '../../shared/api/auth';
import { useAuth } from '../../shared/auth/AuthContext';
import {
  clearPendingVerificationState,
  readPendingVerificationCooldownSeconds,
  readPendingVerificationEmail,
  savePendingVerificationEmail,
  updatePendingVerificationCooldownSeconds,
} from '../../shared/auth/emailVerificationStorage';
import { useI18n } from '../../shared/i18n/LanguageContext';
import { AlertBanner } from '../components/AlertBanner';

function formatStatusError(error: unknown, fallbackMessage: string): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

function formatResendError(error: unknown, fallbackMessage: string): string {
  if (error instanceof ApiError) {
    const details = error.details;
    if (details && typeof details === 'object' && !Array.isArray(details)) {
      const waitErrors = (details as { resend_available_in_seconds?: unknown }).resend_available_in_seconds;
      if (Array.isArray(waitErrors) && waitErrors.length > 0 && typeof waitErrors[0] === 'string') {
        return waitErrors[0];
      }
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

export default function VerifyEmailPendingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { messages } = useI18n();
  const verifyEmailPendingMessages = messages.pages.auth.verifyEmailPending;
  const { user, isLoading: isAuthLoading, resendVerificationEmail, refresh, logout } = useAuth();
  const routeState = location.state as
    | { email?: string; from?: string; resendAvailableInSeconds?: number }
    | null;
  const targetPath = useMemo(
    () => (typeof routeState?.from === 'string' && routeState.from.trim() ? routeState.from : '/for-you'),
    [routeState],
  );

  const [email, setEmail] = useState(
    () => routeState?.email || readPendingVerificationEmail() || user?.email || '',
  );
  const [cooldownSeconds, setCooldownSeconds] = useState(
    () => Math.max(routeState?.resendAvailableInSeconds ?? 0, readPendingVerificationCooldownSeconds()),
  );
  const [statusMessage, setStatusMessage] = useState(
    verifyEmailPendingMessages.initialStatusMessage,
  );
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isStatusLoading, setIsStatusLoading] = useState(true);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (routeState?.email) {
      savePendingVerificationEmail(
        routeState.email,
        routeState.resendAvailableInSeconds ?? readPendingVerificationCooldownSeconds(),
      );
    }
  }, [routeState]);

  const syncVerificationStatus = useCallback(async () => {
    if (!user) {
      setIsStatusLoading(false);
      return;
    }

    setStatusError(null);
    setIsStatusLoading(true);

    try {
      const response = await getVerificationStatus();
      setEmail(response.email);
      savePendingVerificationEmail(response.email, response.resend_available_in_seconds);
      updatePendingVerificationCooldownSeconds(response.resend_available_in_seconds);
      setCooldownSeconds(response.resend_available_in_seconds);

      if (response.email_verified) {
        clearPendingVerificationState();
        await refresh().catch(() => undefined);
        toast.success(verifyEmailPendingMessages.verifiedToast);
        navigate(targetPath, { replace: true });
        return;
      }

      setStatusMessage(verifyEmailPendingMessages.waitingStatusMessage);
    } catch (error) {
      setStatusError(formatStatusError(error, verifyEmailPendingMessages.statusLoadError));
    } finally {
      setIsStatusLoading(false);
    }
  }, [
    navigate,
    refresh,
    targetPath,
    user,
    verifyEmailPendingMessages.statusLoadError,
    verifyEmailPendingMessages.verifiedToast,
    verifyEmailPendingMessages.waitingStatusMessage,
  ]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (user?.email_verified) {
      clearPendingVerificationState();
      navigate(targetPath, { replace: true });
      return;
    }

    void syncVerificationStatus();
    const intervalId = window.setInterval(() => {
      void syncVerificationStatus();
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isAuthLoading, navigate, syncVerificationStatus, targetPath, user]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCooldownSeconds(readPendingVerificationCooldownSeconds());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const handleResend = async () => {
    if (cooldownSeconds > 0 || isResending) {
      return;
    }

    setIsResending(true);
    setStatusError(null);

    try {
      const response = await resendVerificationEmail();
      setEmail(response.email);
      setStatusMessage(verifyEmailPendingMessages.resendSuccessMessage);
      savePendingVerificationEmail(response.email, response.resend_available_in_seconds);
      updatePendingVerificationCooldownSeconds(response.resend_available_in_seconds);
      setCooldownSeconds(response.resend_available_in_seconds);
      toast.success(verifyEmailPendingMessages.resendToast(response.email));
    } catch (error) {
      setStatusError(formatResendError(error, verifyEmailPendingMessages.resendError));
      void syncVerificationStatus();
    } finally {
      setIsResending(false);
    }
  };

  const hasActiveSession = Boolean(user);

  return (
    <div className="page-centered-with-navbar-offset flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl rounded-3xl border border-gray-100 bg-white p-8 shadow-sm md:p-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-700">
          <Mail className="h-8 w-8" />
        </div>

        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-serif text-gray-900">{verifyEmailPendingMessages.title}</h1>
          <p className="text-gray-600">{verifyEmailPendingMessages.subtitle}</p>
        </div>

        <div className="mb-4 rounded-2xl border border-[#EAE6EF] bg-gray-50 p-4">
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-gray-500">{verifyEmailPendingMessages.emailLabel}</p>
          <p className="break-all text-base font-semibold text-gray-900">
            {email || verifyEmailPendingMessages.emailUnavailable}
          </p>
        </div>

        {statusError ? (
          <div className="mb-4">
            <AlertBanner variant="warning" message={statusError} />
          </div>
        ) : null}

        <AlertBanner variant={isStatusLoading ? 'info' : 'warning'} message={statusMessage} />

        <div className="mt-6 rounded-2xl border border-[#EAE6EF] bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Clock3 className="h-4 w-4 text-gray-500" />
            {verifyEmailPendingMessages.resendTitle}
          </div>
          <p className="mb-4 text-sm text-gray-600">
            {cooldownSeconds > 0
              ? verifyEmailPendingMessages.resendCooldown(cooldownSeconds)
              : verifyEmailPendingMessages.resendAvailable}
          </p>
          <button
            type="button"
            onClick={() => void handleResend()}
            disabled={!hasActiveSession || cooldownSeconds > 0 || isResending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-pink-500 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-brand-pink-600 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
            {isResending ? verifyEmailPendingMessages.resending : verifyEmailPendingMessages.resend}
          </button>
        </div>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void syncVerificationStatus()}
            className="inline-flex items-center justify-center rounded-full border border-[#EAE6EF] bg-white/80 px-6 py-3 text-sm font-medium text-gray-800 transition-all duration-200 hover:border-[#FF4DB8]/20 hover:bg-white hover:shadow-md hover:shadow-[#FF4DB8]/10 active:scale-[0.98]"
          >
            {verifyEmailPendingMessages.checkStatus}
          </button>
          {!hasActiveSession ? (
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full bg-brand-pink-500 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-brand-pink-600 hover:shadow-lg active:scale-[0.98]"
            >
              {verifyEmailPendingMessages.signInAgain}
            </Link>
          ) : (
            <button
              type="button"
              onClick={async () => {
                clearPendingVerificationState();
                await logout();
                navigate('/login', { replace: true });
              }}
              className="inline-flex items-center justify-center rounded-full border border-[#EAE6EF] bg-white/80 px-6 py-3 text-sm font-medium text-gray-800 transition-all duration-200 hover:border-[#FF4DB8]/20 hover:bg-white hover:shadow-md hover:shadow-[#FF4DB8]/10 active:scale-[0.98]"
            >
              {verifyEmailPendingMessages.signOut}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
