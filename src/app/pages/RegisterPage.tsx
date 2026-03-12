import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "../../shared/api/ApiError";
import { useAuth } from "../../shared/auth/AuthContext";
import { savePendingVerificationEmail } from "../../shared/auth/emailVerificationStorage";
import { AlertBanner } from "../components/AlertBanner";
import { Button } from "../components/Button";

function formatRegisterError(error: unknown): string {
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

  return "Unable to create account";
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password || !passwordConfirm) {
      setError("Fill in all fields");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Passwords do not match");
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
        toast.success("Account created. Check your email to confirm it.");
      } else {
        toast.warning("Account created, but the email was not sent. You can resend it on the verification page.");
      }
      navigate("/verify-email-pending", {
        replace: true,
        state: {
          email: response.verification_email,
          resendAvailableInSeconds: response.resend_available_in_seconds,
        },
      });
    } catch (requestError) {
      setError(formatRegisterError(requestError));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Uilesim</h1>
          <p className="text-gray-600">Create your account and start personalized onboarding</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? <AlertBanner variant="error" message={error} dismissible /> : null}

            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  id="register-email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="name@example.com"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="register-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="Minimum 8 characters"
                  disabled={isLoading}
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
              <label htmlFor="register-password-confirm" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPasswordConfirm ? "text" : "password"}
                  id="register-password-confirm"
                  value={passwordConfirm}
                  onChange={(event) => setPasswordConfirm(event.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="Repeat the password"
                  disabled={isLoading}
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

            <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              After sign up, we create your account ID automatically, open For You onboarding, and send a confirmation email.
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-gray-900 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
