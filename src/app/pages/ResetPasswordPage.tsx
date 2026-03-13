import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "../../shared/api/ApiError";
import { confirmPasswordReset, validatePasswordResetLink } from "../../shared/api/auth";
import { AlertBanner } from "../components/AlertBanner";
import { Button } from "../components/Button";

function formatResetConfirmError(error: unknown): string {
  if (error instanceof ApiError) {
    const details = error.details;
    if (details && typeof details === "object" && !Array.isArray(details)) {
      for (const value of Object.values(details as Record<string, unknown>)) {
        if (Array.isArray(value) && value.length > 0) {
          const first = value[0];
          if (typeof first === "string" && first.trim()) {
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

  return "Unable to reset the password.";
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid") ?? "";
  const token = searchParams.get("token") ?? "";

  const [isChecking, setIsChecking] = useState(true);
  const [isValidLink, setIsValidLink] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Checking your reset link...");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid || !token) {
      setIsChecking(false);
      setIsValidLink(false);
      setStatusMessage("Password reset link is incomplete.");
      return;
    }

    let cancelled = false;

    (async () => {
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
          validationError instanceof Error ? validationError.message : "Password reset link is invalid.",
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
  }, [token, uid]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!password || !passwordConfirm) {
      setError("Fill in both password fields.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await confirmPasswordReset(uid, token, password, passwordConfirm);
      toast.success(response.message);
      navigate("/login", { replace: true });
    } catch (requestError) {
      setError(formatResetConfirmError(requestError));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-centered-with-navbar-offset flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Set a new password</h1>
          <p className="text-gray-600">Use the link from your email to create a new password.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {isChecking ? (
            <AlertBanner variant="info" message={statusMessage} />
          ) : isValidLink ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error ? <AlertBanner variant="error" message={error} dismissible /> : null}

              <AlertBanner variant="success" message={statusMessage} />

              <div>
                <label htmlFor="reset-password" className="block text-sm font-medium text-gray-700 mb-2">
                  New password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="reset-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="Minimum 8 characters"
                    disabled={isSaving}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="reset-password-confirm" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPasswordConfirm ? "text" : "password"}
                    id="reset-password-confirm"
                    value={passwordConfirm}
                    onChange={(event) => setPasswordConfirm(event.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="Repeat the password"
                    disabled={isSaving}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full" disabled={isSaving}>
                {isSaving ? "Saving..." : "Update password"}
              </Button>
            </form>
          ) : (
            <div className="space-y-5">
              <AlertBanner variant="warning" message={statusMessage} />
              <Link
                to="/forgot-password"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#111827] px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-[#0B1220] hover:shadow-lg active:scale-[0.98]"
              >
                Request a new link
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Back to{" "}
          <Link to="/login" className="text-gray-900 font-medium hover:underline">
            login
          </Link>
        </p>
      </div>
    </div>
  );
}

