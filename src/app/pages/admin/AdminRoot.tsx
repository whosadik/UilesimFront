import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { Toaster } from 'sonner';
import {
  LayoutDashboard,
  BarChart3,
  FlaskConical,
  ScrollText,
  Target,
  ShoppingBag,
  HeartPulse,
  ChevronLeft,
  Search,
  Bell,
  LogOut,
  Shield,
  ChevronDown,
  Package,
  Sparkles,
} from 'lucide-react';
import logoImage from '@/assets/UylesimLogo.png';
import { useAuth } from '../../../shared/auth/AuthContext';

const navItems = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Metrics', href: '/admin/metrics', icon: BarChart3 },
  { label: 'Recs Experiments', href: '/admin/experiments', icon: FlaskConical },
  { label: 'Audit', href: '/admin/audit', icon: ScrollText },
  { label: 'Товары', href: '/admin/catalog/products', icon: Package },
  { label: 'Бренды', href: '/admin/catalog/brands', icon: Sparkles },
  { label: 'Персональные кампании', href: '/admin/campaigns/personal', icon: Target },
  { label: 'Акции на каталог', href: '/admin/campaigns/catalog', icon: ShoppingBag },
  { label: 'Health', href: '/admin/health', icon: HeartPulse },
];

export default function AdminRoot() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: isAuthLoading, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userDisplayName = user?.username || 'admin';

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }

    if (user.email && user.email_verified === false) {
      navigate('/verify-email-pending', {
        replace: true,
        state: { email: user.email ?? '', from: location.pathname },
      });
      return;
    }

    if (!isAdmin) {
      navigate('/', { replace: true });
    }
  }, [isAdmin, isAuthLoading, location.pathname, navigate, user]);

  const isActive = (item: { href: string; exact?: boolean }) => {
    if (item.exact) return location.pathname === item.href;
    return location.pathname.startsWith(item.href);
  };

  if (isAuthLoading || !user || (Boolean(user.email) && user.email_verified === false) || !isAdmin) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-16' : 'w-60'
        } flex-shrink-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 fixed left-0 top-0 bottom-0 z-40`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          {!sidebarCollapsed && (
            <Link to="/" className="flex items-center gap-2">
              <img src={logoImage} alt="Uylesim" className="w-7 h-7 object-contain border border-transparent hover:border-[#FF4DB8] rounded-full" />
              <span className="font-semibold text-gray-900 text-sm">Uylesim</span>
              <span className="ml-1 text-[10px] bg-gray-900 text-white px-1.5 py-0.5 rounded font-medium tracking-wide">
                STAFF
              </span>
            </Link>
          )}
          {sidebarCollapsed && (
            <div className="w-full flex justify-center">
              <img src={logoImage} alt="Uylesim" className="w-7 h-7 object-contain border border-transparent hover:border-[#FF4DB8] rounded-full" />
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all flex-shrink-0"
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 flex flex-col gap-0.5 px-2">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                  active
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon
                  className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`}
                />
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {!sidebarCollapsed && active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF4DB8]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-100 p-3">
          <Link
            to="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all`}
            title={sidebarCollapsed ? 'Вернуться в магазин' : undefined}
          >
            <ChevronLeft className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm">Вернуться в магазин</span>}
          </Link>
        </div>
      </aside>

      {/* Main content area */}
      <div className={`flex-1 flex flex-col ${sidebarCollapsed ? 'ml-16' : 'ml-60'} transition-all duration-300`}>
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск..."
                className="pl-9 pr-4 h-9 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Environment Badge */}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              STAGE
            </span>

            {/* Bell */}
            <button className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 relative transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF4DB8] rounded-full" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-medium hidden sm:block">{userDisplayName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-50">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-900">{userDisplayName}</p>
                    <p className="text-xs text-gray-500">Staff · All permissions</p>
                  </div>
                  <button
                    onClick={async () => {
                      await logout();
                      navigate('/login', { replace: true });
                    }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Выйти
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto" data-route-scroll-container>
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}
