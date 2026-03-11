import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { CheckCircle2, LoaderCircle, MailWarning } from "lucide-react";
import { ApiError } from "../../shared/api/ApiError";
import { verifyEmail } from "../../shared/api/auth";
import { useAuth } from "../../shared/auth/AuthContext";
import { clearPendingVerificationState } from "../../shared/auth/emailVerificationStorage";
import { AlertBanner } from "../components/AlertBanner";

function formatVerifyError(error: unknown): string {
  if (error instanceof ApiError) {
    const details = error.details;
    if (details && typeof details === "object" && !Array.isArray(details)) {
      const tokenErrors = (details as { token?: unknown }).token;
      if (Array.isArray(tokenErrors) && tokenErrors.length > 0 && typeof tokenErrors[0] === "string") {
        return tokenErrors[0];
      }
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to confirm email";
}

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const { user, refresh } = useAuth();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("Checking your confirmation link...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const response = await verifyEmail(token);
        if (cancelled) {
          return;
        }
        clearPendingVerificationState();
        setStatus("success");
        setMessage(response.message);
        await refresh().catch(() => undefined);
      } catch (error) {
        if (cancelled) {
          return;
        }
        setStatus("error");
        setMessage(formatVerifyError(error));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refresh, searchParams]);

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10">
        <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-5 bg-gray-50">
          {status === "verifying" ? (
            <LoaderCircle className="w-8 h-8 text-gray-700 animate-spin" />
          ) : status === "success" ? (
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          ) : (
            <MailWarning className="w-8 h-8 text-amber-600" />
          )}
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Email verification</h1>
          <p className="text-gray-600">
            {status === "verifying"
              ? "We are checking your email confirmation link."
              : status === "success"
                ? "Your email is ready to use."
                : "We could not confirm this email link."}
          </p>
        </div>

        <AlertBanner
          variant={status === "success" ? "success" : status === "error" ? "warning" : "info"}
          message={message}
        />

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          {status === "success" ? (
            <Link
              to={user ? "/for-you" : "/login"}
              className="inline-flex items-center justify-center rounded-full bg-[#111827] px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-[#0B1220] hover:shadow-lg active:scale-[0.98]"
            >
              {user ? "Go to For You" : "Go to login"}
            </Link>
          ) : null}

          {status !== "verifying" ? (
            <Link
              to={user ? "/for-you" : "/register"}
              className="inline-flex items-center justify-center rounded-full border border-[#EAE6EF] bg-white/80 px-6 py-3 text-sm font-medium text-gray-800 transition-all duration-200 hover:border-[#FF4DB8]/20 hover:bg-white hover:shadow-md hover:shadow-[#FF4DB8]/10 active:scale-[0.98]"
            >
              {user ? "Back to For You" : "Back to registration"}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
