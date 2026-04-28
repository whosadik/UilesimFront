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
    <div className="relative min-h-screen bg-[#FBF8FB]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.6]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 12% -10%, rgba(255,77,184,0.10), transparent 40%), radial-gradient(circle at 88% 10%, rgba(168,114,255,0.08), transparent 40%), radial-gradient(circle at 50% 100%, rgba(255,213,232,0.18), transparent 50%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.05]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(17,24,39,0.7) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      <Navbar wishlistCount={wishlistCount} cartCount={cartCount} />
      <main>
        <Outlet />
      </main>
      <Footer />
      <Toaster position="top-right" richColors />
    </div>
  );
}
