import { X, ChevronRight, Percent, Search, Heart } from 'lucide-react';
import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router';

import { useI18n } from '../../shared/i18n/LanguageContext';

export type MobileMenuItem = {
  label: string;
  href: string;
  hasSubmenu?: boolean;
  icon?: ReactNode;
};

export type MobileMenuCategory = {
  label: string;
  href: string;
  count?: number | string;
};

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems?: MobileMenuItem[];
  quickActions?: MobileMenuItem[];
  profileItems?: MobileMenuItem[];
  categories?: MobileMenuCategory[];
  showLoginButton?: boolean;
}

function normalizeCount(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.round(value));
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.round(parsed));
    }
  }
  return undefined;
}

export function MobileMenu({
  isOpen,
  onClose,
  menuItems,
  quickActions,
  profileItems,
  categories,
  showLoginButton = true,
}: MobileMenuProps) {
  const location = useLocation();
  const { language, setLanguage, messages, supportedLanguages } = useI18n();

  if (!isOpen) {
    return null;
  }

  const defaultMenuItems: MobileMenuItem[] = [
    { label: messages.navbar.mainMenu.catalog, hasSubmenu: true, href: '/catalog' },
    { label: messages.navbar.mainMenu.brands, href: '/brands' },
    { label: messages.navbar.mainMenu.new, href: '/new' },
    { label: messages.navbar.mainMenu.promotions, href: '/promotions' },
    { label: messages.navbar.mainMenu.forYou, href: '/for-you' },
    { label: messages.navbar.mainMenu.stores, href: '/stores' },
    { label: messages.navbar.mainMenu.giftCards, href: '/gift-cards' },
  ];

  const defaultQuickActions: MobileMenuItem[] = [
    { label: messages.common.search, href: '/search', icon: <Search className="h-4 w-4" /> },
    { label: messages.common.wishlist, href: '/wishlist', icon: <Heart className="h-4 w-4" /> },
  ];

  const defaultProfileItems: MobileMenuItem[] = [
    { label: messages.navbar.profileMenu.myProfile, href: '/me' },
    { label: messages.navbar.profileMenu.myProducts, href: '/me/owned' },
    { label: messages.navbar.profileMenu.roadmap, href: '/me/roadmap' },
    { label: messages.navbar.profileMenu.myRoutine, href: '/me/routine' },
    { label: messages.navbar.profileMenu.transactions, href: '/me/transactions' },
  ];

  const defaultCategories: MobileMenuCategory[] = [
    { label: messages.catalog.categories.skincare, href: '/catalog?category=skincare' },
    { label: messages.catalog.categories.makeup, href: '/catalog?category=makeup' },
    { label: messages.catalog.categories.haircare, href: '/catalog?category=haircare' },
    { label: messages.catalog.categories.fragrance, href: '/catalog?category=fragrance' },
    { label: messages.catalog.categories.sets, href: '/catalog?product_type=set' },
  ];

  const menu = Array.isArray(menuItems) && menuItems.length > 0 ? menuItems : defaultMenuItems;
  const actions = Array.isArray(quickActions) && quickActions.length > 0 ? quickActions : defaultQuickActions;
  const profile = Array.isArray(profileItems) ? profileItems : defaultProfileItems;
  const categoryItems = Array.isArray(categories) && categories.length > 0 ? categories : defaultCategories;

  const isPathActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <>
      <div
        className="fixed inset-0 z-50 animate-in fade-in duration-200 bg-black/40 lg:hidden"
        onClick={onClose}
      />

      <div className="fixed top-0 left-0 bottom-0 z-50 w-[85%] max-w-sm overflow-y-auto bg-white shadow-2xl animate-in slide-in-from-left duration-300 lg:hidden">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#EAE6EF] bg-white px-6 py-4">
          <span className="text-lg font-bold text-[#111827]">{messages.mobileMenu.title}</span>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-[#111827]" />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div
            className="inline-flex items-center gap-1 rounded-full border border-[#EAE6EF] bg-gray-50 p-1"
            role="group"
            aria-label={messages.languageSwitcher.label}
          >
            {supportedLanguages.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-[0.08em] transition-all ${
                  language === lang ? 'bg-brand-pink-500 text-white' : 'text-[#6B7280]'
                }`}
              >
                {messages.languageSwitcher.languages[lang]}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-6 mt-4">
          <Link
            to="/sale"
            onClick={onClose}
            className="group flex items-center justify-between rounded-xl border border-[#FF4DB8] bg-[#FFE1F2] px-4 py-3 text-sm font-medium text-[#FF4DB8] transition-all hover:bg-[#FF4DB8] hover:text-white"
          >
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              <span>{messages.navbar.saleBadge}</span>
            </div>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 gap-2">
            {actions.map((action) => (
              <Link
                key={action.label}
                to={action.href}
                onClick={onClose}
                className="flex items-center justify-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                {action.icon}
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <nav className="px-6 py-6">
          <ul className="space-y-1">
            {menu.map((item) => {
              const active = isPathActive(item.href);

              return (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className={`group flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-colors ${
                      active ? 'bg-[#FFE1F2]/40 text-[#111827]' : 'text-[#111827] hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium">{item.label}</span>
                    {item.hasSubmenu ? (
                      <ChevronRight className="h-4 w-4 text-[#6B7280] transition-all group-hover:translate-x-0.5 group-hover:text-[#FF4DB8]" />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {profile.length > 0 ? (
          <div className="border-t border-[#EAE6EF] px-6 pb-6 pt-6">
            <h3 className="mb-3 px-4 text-xs font-semibold uppercase text-[#6B7280]">
              {messages.mobileMenu.accountTitle}
            </h3>
            <ul className="space-y-1">
              {profile.map((item) => {
                const active = isPathActive(item.href);

                return (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors ${
                        active ? 'bg-[#FFE1F2]/40 text-[#111827]' : 'text-[#111827] hover:bg-gray-50'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        <div className="border-t border-[#EAE6EF] px-6 pb-6 pt-6">
          <h3 className="mb-3 px-4 text-xs font-semibold uppercase text-[#6B7280]">
            {messages.mobileMenu.popularCategoriesTitle}
          </h3>
          <ul className="space-y-1">
            {categoryItems.map((category) => {
              const count = normalizeCount(category.count);
              const active =
                isPathActive('/catalog') && location.search.includes(category.href.split('?')[1] ?? '');

              return (
                <li key={category.label}>
                  <Link
                    to={category.href}
                    onClick={onClose}
                    className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm transition-colors ${
                      active ? 'bg-[#FFE1F2]/40 text-[#111827]' : 'text-[#111827] hover:bg-gray-50'
                    }`}
                  >
                    <span>{category.label}</span>
                    {count !== undefined ? <span className="text-xs text-[#6B7280]">{count}</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="sticky bottom-0 space-y-3 border-t border-[#EAE6EF] bg-white px-6 py-4">
          {showLoginButton ? (
            <Link
              to="/login"
              onClick={onClose}
              className="block rounded-xl bg-brand-pink-500 px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-brand-pink-600"
            >
              {messages.navbar.guestMenu.signIn}
            </Link>
          ) : null}

          <div className="flex items-center justify-center gap-4 text-xs text-[#6B7280]">
            <Link to="/help" onClick={onClose} className="transition-colors hover:text-[#FF4DB8]">
              {messages.mobileMenu.help}
            </Link>
            <span>&bull;</span>
            <Link to="/help" onClick={onClose} className="transition-colors hover:text-[#FF4DB8]">
              {messages.mobileMenu.contacts}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
