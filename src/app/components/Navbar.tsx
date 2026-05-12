import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu as MenuIcon,
  AlignJustify,
  Percent,
  LogOut,
  Package,
  Receipt,
  Map,
  Clock,
  Shield,
  Gift,
} from 'lucide-react';

import { IconButton } from './IconButton';
import { MegaMenu, type MegaMenuCategory, type MegaMenuQuickLink } from './MegaMenu';
import { MobileMenu, type MobileMenuCategory, type MobileMenuItem } from './MobileMenu';
import logoImage from '@/assets/UylesimLogo.png';
import { useAuth } from '../../shared/auth/AuthContext';
import { useI18n } from '../../shared/i18n/LanguageContext';

type MainMenuItem = {
  label: string;
  href: string;
  hasIcon?: boolean;
  trigger?: boolean;
};

interface NavbarProps {
  wishlistCount?: number;
  cartCount?: number;
  mainMenu?: MainMenuItem[];
  profileMenuItems?: MobileMenuItem[];
  megaMenuCategories?: MegaMenuCategory[];
  megaMenuQuickLinks?: MegaMenuQuickLink[];
  mobileMenuCategories?: MobileMenuCategory[];
}

export function Navbar({
  wishlistCount,
  cartCount,
  mainMenu,
  profileMenuItems,
  megaMenuCategories,
  megaMenuQuickLinks,
  mobileMenuCategories,
}: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const { language, setLanguage, messages, supportedLanguages } = useI18n();
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const defaultMainMenu: MainMenuItem[] = [
    {
      label: messages.navbar.mainMenu.catalog,
      hasIcon: true,
      trigger: true,
      href: '/catalog',
    },
    { label: messages.navbar.mainMenu.brands, href: '/brands' },
    { label: messages.navbar.mainMenu.new, href: '/new' },
    { label: messages.navbar.mainMenu.promotions, href: '/promotions' },
    { label: messages.navbar.mainMenu.forYou, href: '/for-you' },
  ];

  const defaultProfileMenu: MobileMenuItem[] = [
    { label: messages.navbar.profileMenu.myProfile, href: '/me', icon: <User className="w-4 h-4" /> },
    {
      label: messages.navbar.profileMenu.myProducts,
      href: '/me/owned',
      icon: <Package className="w-4 h-4" />,
    },
    { label: messages.navbar.profileMenu.roadmap, href: '/me/roadmap', icon: <Map className="w-4 h-4" /> },
    {
      label: messages.navbar.profileMenu.myRoutine,
      href: '/me/routine',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      label: messages.navbar.profileMenu.transactions,
      href: '/me/transactions',
      icon: <Receipt className="w-4 h-4" />,
    },
    {
      label: messages.navbar.mainMenu.giftCards,
      href: '/gift-cards',
      icon: <Gift className="w-4 h-4" />,
    },
  ];

  const defaultMobileCategories: MobileMenuCategory[] = [
    { label: messages.catalog.categories.skincare, href: '/catalog?category=skincare' },
    { label: messages.catalog.categories.makeup, href: '/catalog?category=makeup' },
    { label: messages.catalog.categories.haircare, href: '/catalog?category=haircare' },
    { label: messages.catalog.categories.fragrance, href: '/catalog?category=fragrance' },
    { label: messages.catalog.categories.sets, href: '/catalog?product_type=set' },
  ];

  const menuItems = Array.isArray(mainMenu) && mainMenu.length > 0 ? mainMenu : defaultMainMenu;
  const profileItems =
    Array.isArray(profileMenuItems) && profileMenuItems.length > 0
      ? profileMenuItems
      : defaultProfileMenu;
  const guestProfileItems: MobileMenuItem[] = [
    { label: messages.navbar.guestMenu.signIn, href: '/login', icon: <User className="w-4 h-4" /> },
    {
      label: messages.navbar.guestMenu.createAccount,
      href: '/register',
      icon: <Shield className="w-4 h-4" />,
    },
  ];
  const accountItems = user ? profileItems : guestProfileItems;
  const mobileMenuItems: MobileMenuItem[] = menuItems.map((item) => ({
    label: item.label,
    href: item.href,
    hasSubmenu: item.trigger,
  }));
  const mobileCategories =
    Array.isArray(mobileMenuCategories) && mobileMenuCategories.length > 0
      ? mobileMenuCategories
      : defaultMobileCategories;

  const isPathActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const languageSwitcher = (
    <div
      className="flex items-center gap-1 rounded-full border border-[#EAE6EF] bg-white/70 p-1"
      role="group"
      aria-label={messages.languageSwitcher.label}
    >
      {supportedLanguages.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLanguage(lang)}
          className={`rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-[0.08em] transition-all ${
            language === lang
              ? 'bg-brand-pink-500 text-white shadow-sm'
              : 'text-[#6B7280] hover:bg-white hover:text-[#111827]'
          }`}
        >
          {messages.languageSwitcher.languages[lang]}
        </button>
      ))}
    </div>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-[#EAE6EF]">
      <div className="border-b border-[#EAE6EF]/50 hidden md:block">
        <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center gap-6 text-xs text-[#6B7280]">
              <Link to="/delivery-returns" className="hover:text-[#FF4DB8] transition-colors">
                {messages.navbar.topLinks.deliveryReturns}
              </Link>
              <Link to="/stores" className="hover:text-[#FF4DB8] transition-colors">
                {messages.navbar.mainMenu.stores}
              </Link>
              <Link to="/about" className="hover:text-[#FF4DB8] transition-colors">
                {messages.navbar.topLinks.about}
              </Link>
              {isAdmin ? (
                <Link
                  to="/admin"
                  className="flex items-center gap-1 hover:text-[#FF4DB8] transition-colors font-medium text-[#111827]"
                >
                  <Shield className="w-3 h-3" />
                  {messages.navbar.topLinks.admin}
                </Link>
              ) : null}
            </div>

            <div className="flex items-center gap-4 text-xs text-[#6B7280]">
              <Link to="/help" className="hover:text-[#FF4DB8] transition-colors">
                {messages.navbar.topLinks.help}
              </Link>
              <Link to="/terms" className="hover:text-[#FF4DB8] transition-colors">
                {messages.navbar.topLinks.loyaltyProgram}
              </Link>
              {languageSwitcher}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <img
              src={logoImage}
              alt="Uylesim"
              className="w-9 h-9 lg:w-10 lg:h-10 object-contain transition-transform group-hover:scale-105 br-2 border-transparent group-hover:border-[#FF4DB8] rounded-full"
            />
            <span className="text-[#111827] font-semibold text-base lg:text-lg tracking-tight">
              Uylesim
            </span>
          </Link>

          <div className="hidden xl:flex items-center gap-1 flex-1 justify-center px-8">
            {menuItems.map((item) => {
              const isActive = isPathActive(item.href);

              return item.trigger ? (
                <button
                  key={item.label}
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    setMegaMenuOpen((prev) => !prev);
                  }}
                  aria-haspopup="dialog"
                  aria-expanded={megaMenuOpen}
                  aria-label={messages.navbar.openCatalogMenu}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all relative group ${
                    isActive ? 'text-[#111827]' : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  {item.hasIcon && <AlignJustify className="w-4 h-4" />}
                  <span>{item.label}</span>
                  {isActive ? (
                    <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#FF4DB8]" />
                  ) : (
                    <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#FF4DB8] scale-x-0 group-hover:scale-x-100 transition-transform" />
                  )}
                </button>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all relative group ${
                    isActive ? 'text-[#111827]' : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive ? (
                    <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#FF4DB8]" />
                  ) : (
                    <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#FF4DB8] scale-x-0 group-hover:scale-x-100 transition-transform" />
                  )}
                </Link>
              );
            })}

            <Link
              to="/sale"
              className="flex items-center gap-1.5 px-3 py-1.5 ml-2 rounded-full bg-[#FFE1F2] border border-[#FF4DB8] text-[#FF4DB8] text-sm font-medium hover:bg-[#FF4DB8] hover:text-white transition-all group"
            >
              <Percent className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">{messages.navbar.saleBadge}</span>
            </Link>
          </div>

          <div className="hidden lg:flex xl:hidden items-center gap-1 flex-1 justify-center px-4">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                setMegaMenuOpen((prev) => !prev);
              }}
              aria-haspopup="dialog"
              aria-expanded={megaMenuOpen}
              aria-label={messages.navbar.openCatalogMenu}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors relative ${
                isPathActive('/catalog') ? 'text-[#111827]' : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <AlignJustify className="w-4 h-4" />
              <span>{messages.navbar.mainMenu.catalog}</span>
              {isPathActive('/catalog') && (
                <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#FF4DB8]" />
              )}
            </button>
            <Link
              to="/brands"
              className={`px-3 py-2 text-sm font-medium transition-colors relative ${
                isPathActive('/brands') ? 'text-[#111827]' : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              {messages.navbar.mainMenu.brands}
              {isPathActive('/brands') && (
                <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#FF4DB8]" />
              )}
            </Link>
            <Link
              to="/new"
              className={`px-3 py-2 text-sm font-medium transition-colors relative ${
                isPathActive('/new') ? 'text-[#111827]' : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              {messages.navbar.mainMenu.new}
              {isPathActive('/new') && (
                <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#FF4DB8]" />
              )}
            </Link>
            <Link
              to="/promotions"
              className={`px-3 py-2 text-sm font-medium transition-colors relative ${
                isPathActive('/promotions')
                  ? 'text-[#111827]'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              {messages.navbar.mainMenu.promotions}
              {isPathActive('/promotions') && (
                <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#FF4DB8]" />
              )}
            </Link>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:flex md:hidden">{languageSwitcher}</div>

            <Link to="/search">
              <IconButton icon={<Search className="w-5 h-5" />} />
            </Link>
            <Link to="/wishlist">
              <IconButton icon={<Heart className="w-5 h-5" />} badge={wishlistCount} />
            </Link>
            <Link to="/cart">
              <IconButton icon={<ShoppingCart className="w-5 h-5" />} badge={cartCount} />
            </Link>

            <div className="hidden md:block relative">
              <button
                onClick={() => {
                  if (!user) {
                    navigate('/login', { state: { from: location.pathname } });
                    return;
                  }

                  setProfileMenuOpen((prev) => !prev);
                }}
                onBlur={() => setTimeout(() => setProfileMenuOpen(false), 200)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 border border-[#EAE6EF] text-[#111827] hover:bg-white hover:shadow-md transition-all"
              >
                <User className="w-5 h-5" />
              </button>

              {user && profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  {accountItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {item.icon}
                      <span>{item.href === '/me' && user ? user.username : item.label}</span>
                    </Link>
                  ))}

                  <div className="border-t border-gray-100 my-2" />

                  <button
                    onClick={async () => {
                      try {
                        await logout();
                      } finally {
                        setProfileMenuOpen(false);
                        navigate('/login', { replace: true });
                      }
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{messages.navbar.signOut}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="xl:hidden ml-1">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 border border-[#EAE6EF] text-[#111827] hover:bg-white hover:shadow-md transition-all"
              >
                <MenuIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <MegaMenu
        isOpen={megaMenuOpen}
        onClose={() => setMegaMenuOpen(false)}
        categories={megaMenuCategories}
        quickLinks={megaMenuQuickLinks}
      />

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        menuItems={mobileMenuItems}
        profileItems={accountItems}
        categories={mobileCategories}
        showLoginButton={!user}
      />
    </nav>
  );
}
