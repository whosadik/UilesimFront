import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../shared/auth/AuthContext";
import { savePendingVerificationEmail } from "../../shared/auth/emailVerificationStorage";
import { AlertBanner } from "../components/AlertBanner";
import { Button } from "../components/Button";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Fill in both fields.");
      return;
    }

    setIsLoading(true);

    try {
      const { isAdmin, user } = await login(email.trim(), password);
      const state = location.state as { from?: string } | null;
      const returnPath = typeof state?.from === "string" ? state.from : null;

      if (user.email && user.email_verified === false) {
        if (typeof user.email === "string" && user.email.trim()) {
          savePendingVerificationEmail(user.email);
        }

        toast.info("Confirm your email before entering the account.");
        navigate("/verify-email-pending", {
          replace: true,
          state: { email: user.email ?? "", from: returnPath ?? "/for-you" },
        });
        return;
      }

      const targetPath = isAdmin
        ? returnPath && returnPath.startsWith("/admin")
          ? returnPath
          : "/admin"
        : returnPath && !returnPath.startsWith("/admin")
          ? returnPath
          : "/for-you";

      toast.success("Welcome back.");
      navigate(targetPath, { replace: true });
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError("Invalid email or password.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-centered-with-navbar-offset flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Uilesim</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? <AlertBanner variant="error" message={error} dismissible /> : null}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  id="email"
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  autoComplete="current-password"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="w-4 h-4 border-gray-300 rounded text-gray-900 focus:ring-2 focus:ring-gray-900"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-700">Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 text-center">
                Use the email you registered with and your current password.
              </p>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          No account yet?{" "}
          <Link to="/register" className="text-gray-900 font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

