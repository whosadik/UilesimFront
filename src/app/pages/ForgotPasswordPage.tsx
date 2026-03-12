import { useState } from "react";
import { Link } from "react-router";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "../../shared/api/ApiError";
import { requestPasswordReset } from "../../shared/api/auth";
import { AlertBanner } from "../components/AlertBanner";
import { Button } from "../components/Button";

function formatResetRequestError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to request a password reset.";
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Enter your email.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await requestPasswordReset(email.trim());
      setSuccessMessage(response.message);
      toast.success("If the account exists, the reset link has been sent.");
    } catch (requestError) {
      setError(formatResetRequestError(requestError));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Reset password</h1>
          <p className="text-gray-600">We will send you a link to set a new password.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? <AlertBanner variant="error" message={error} dismissible /> : null}
            {successMessage ? <AlertBanner variant="success" message={successMessage} /> : null}

            <div>
              <label htmlFor="forgot-password-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  id="forgot-password-email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="name@example.com"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Remembered your password?{" "}
          <Link to="/login" className="text-gray-900 font-medium hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
