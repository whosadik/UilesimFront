import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Clock3, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "../../shared/api/ApiError";
import { getVerificationStatus } from "../../shared/api/auth";
import { useAuth } from "../../shared/auth/AuthContext";
import {
  clearPendingVerificationState,
  readPendingVerificationCooldownSeconds,
  readPendingVerificationEmail,
  savePendingVerificationEmail,
  updatePendingVerificationCooldownSeconds,
} from "../../shared/auth/emailVerificationStorage";
import { AlertBanner } from "../components/AlertBanner";

function formatStatusError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load verification status.";
}

function formatResendError(error: unknown): string {
  if (error instanceof ApiError) {
    const details = error.details;
    if (details && typeof details === "object" && !Array.isArray(details)) {
      const waitErrors = (details as { resend_available_in_seconds?: unknown }).resend_available_in_seconds;
      if (Array.isArray(waitErrors) && waitErrors.length > 0 && typeof waitErrors[0] === "string") {
        return waitErrors[0];
      }
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to resend the email.";
}

export default function VerifyEmailPendingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading, resendVerificationEmail, refresh, logout } = useAuth();
  const routeState = location.state as
    | { email?: string; from?: string; resendAvailableInSeconds?: number }
    | null;
  const targetPath = useMemo(
    () => (typeof routeState?.from === "string" && routeState.from.trim() ? routeState.from : "/for-you"),
    [routeState],
  );

  const [email, setEmail] = useState(
    () => routeState?.email || readPendingVerificationEmail() || user?.email || "",
  );
  const [cooldownSeconds, setCooldownSeconds] = useState(
    () => Math.max(routeState?.resendAvailableInSeconds ?? 0, readPendingVerificationCooldownSeconds()),
  );
  const [statusMessage, setStatusMessage] = useState(
    "We sent a confirmation link to your email. Open it and return here.",
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
        toast.success("Email confirmed. Access unlocked.");
        navigate(targetPath, { replace: true });
        return;
      }

      setStatusMessage("We are still waiting for email confirmation. The page checks status automatically.");
    } catch (error) {
      setStatusError(formatStatusError(error));
    } finally {
      setIsStatusLoading(false);
    }
  }, [navigate, refresh, targetPath, user]);

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
      setStatusMessage("A new confirmation email has been sent.");
      savePendingVerificationEmail(response.email, response.resend_available_in_seconds);
      updatePendingVerificationCooldownSeconds(response.resend_available_in_seconds);
      setCooldownSeconds(response.resend_available_in_seconds);
      toast.success(`Confirmation email sent to ${response.email}.`);
    } catch (error) {
      setStatusError(formatResendError(error));
      void syncVerificationStatus();
    } finally {
      setIsResending(false);
    }
  };

  const hasActiveSession = Boolean(user);

  return (
    <div className="page-centered-with-navbar-offset flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-5">
          <Mail className="w-8 h-8" />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Confirm your email</h1>
          <p className="text-gray-600">
            Access to the account opens after email verification.
          </p>
        </div>

        <div className="rounded-2xl border border-[#EAE6EF] bg-gray-50 p-4 mb-4">
          <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-2">Email</p>
          <p className="text-base font-semibold text-gray-900 break-all">
            {email || "Email is not available"}
          </p>
        </div>

        {statusError ? (
          <div className="mb-4">
            <AlertBanner variant="warning" message={statusError} />
          </div>
        ) : null}

        <AlertBanner
          variant={isStatusLoading ? "info" : "warning"}
          message={statusMessage}
        />

        <div className="mt-6 rounded-2xl border border-[#EAE6EF] bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
            <Clock3 className="w-4 h-4 text-gray-500" />
            Resend confirmation
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {cooldownSeconds > 0
              ? `You can request a new email in ${cooldownSeconds} seconds.`
              : "You can request a new confirmation email now."}
          </p>
          <button
            type="button"
            onClick={() => void handleResend()}
            disabled={!hasActiveSession || cooldownSeconds > 0 || isResending}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#111827] px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-[#0B1220] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none"
          >
            <RefreshCw className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`} />
            {isResending ? "Sending..." : "Resend confirmation"}
          </button>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => void syncVerificationStatus()}
            className="inline-flex items-center justify-center rounded-full border border-[#EAE6EF] bg-white/80 px-6 py-3 text-sm font-medium text-gray-800 transition-all duration-200 hover:border-[#FF4DB8]/20 hover:bg-white hover:shadow-md hover:shadow-[#FF4DB8]/10 active:scale-[0.98]"
          >
            Check status again
          </button>
          {!hasActiveSession ? (
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full bg-[#111827] px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-[#0B1220] hover:shadow-lg active:scale-[0.98]"
            >
              Sign in again
            </Link>
          ) : (
            <button
              type="button"
              onClick={async () => {
                clearPendingVerificationState();
                await logout();
                navigate("/login", { replace: true });
              }}
              className="inline-flex items-center justify-center rounded-full border border-[#EAE6EF] bg-white/80 px-6 py-3 text-sm font-medium text-gray-800 transition-all duration-200 hover:border-[#FF4DB8]/20 hover:bg-white hover:shadow-md hover:shadow-[#FF4DB8]/10 active:scale-[0.98]"
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

