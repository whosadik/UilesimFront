import { Outlet, useLocation, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Toaster } from 'sonner';
import { useCommerce } from '../shared/commerce/CommerceContext';
import { useAuth } from '../shared/auth/AuthContext';

const UNVERIFIED_ALLOWED_PATHS = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/verify-email-pending',
]);

export default function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { wishlistCount, cartCount } = useCommerce();

  useEffect(() => {
    if (isAuthLoading || !user || !user.email || user.email_verified !== false) {
      return;
    }

    if (UNVERIFIED_ALLOWED_PATHS.has(location.pathname)) {
      return;
    }

    navigate('/verify-email-pending', {
      replace: true,
      state: {
        email: user.email ?? '',
        from: location.pathname,
      },
    });
  }, [isAuthLoading, location.pathname, navigate, user]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar wishlistCount={wishlistCount} cartCount={cartCount} />
      <main>
        <Outlet />
      </main>
      <Footer />
      <Toaster position="top-right" richColors />
    </div>
  );
}
