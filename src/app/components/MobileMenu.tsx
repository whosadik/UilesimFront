import { X, ChevronRight, Percent, User, Package, Map, Clock, Receipt, Heart, Search } from 'lucide-react';
import { Link } from 'react-router';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null;

  const menuItems = [
    { label: 'Каталог', hasSubmenu: true, href: '/catalog' },
    { label: 'Бренды', href: '/brands' },
    { label: 'Новинки', href: '/new' },
    { label: 'Акции', href: '/promotions' },
    { label: 'Для вас', href: '/for-you' },
    { label: 'Магазины', href: '/stores' },
    { label: 'Подарочные карты', href: '/gift-cards' },
  ];

  const quickActions = [
    { label: 'Поиск', href: '/search', icon: <Search className="w-4 h-4" /> },
    { label: 'Избранное', href: '/wishlist', icon: <Heart className="w-4 h-4" /> },
  ];

  const profileItems = [
    { label: 'Мой профиль', href: '/me', icon: <User className="w-4 h-4" /> },
    { label: 'Мои товары', href: '/me/owned', icon: <Package className="w-4 h-4" /> },
    { label: 'Roadmap', href: '/me/roadmap', icon: <Map className="w-4 h-4" /> },
    { label: 'Моя рутина', href: '/me/routine', icon: <Clock className="w-4 h-4" /> },
    { label: 'Транзакции', href: '/me/transactions', icon: <Receipt className="w-4 h-4" /> },
  ];

  const categories = [
    { label: 'Skincare', count: 247, href: '/catalog?category=skincare' },
    { label: 'Makeup', count: 189, href: '/catalog?category=makeup' },
    { label: 'Haircare', count: 156, href: '/catalog?category=haircare' },
    { label: 'Fragrance', count: 98, href: '/catalog?category=fragrance' },
    { label: 'Наборы', count: 45, href: '/catalog?category=sets' },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-50 lg:hidden animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white z-50 shadow-2xl overflow-y-auto lg:hidden animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#EAE6EF] px-6 py-4 flex items-center justify-between z-10">
          <span className="text-lg font-bold text-[#111827]">Меню</span>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-[#111827]" />
          </button>
        </div>

        {/* Special Offer - Pinned at top */}
        <div className="mx-6 mt-4">
          <Link
            to="/sale"
            onClick={onClose}
            className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#FFE1F2] border border-[#FF4DB8] text-[#FF4DB8] font-medium text-sm hover:bg-[#FF4DB8] hover:text-white transition-all group"
          >
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4" />
              <span>Скидки до −50%</span>
            </div>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.href}
                onClick={onClose}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gray-50 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                {action.icon}
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="px-6 py-6">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.href || '#'}
                  onClick={onClose}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-[#111827] font-medium text-sm hover:bg-gray-50 transition-colors group"
                >
                  <span>{item.label}</span>
                  {item.hasSubmenu && (
                    <ChevronRight className="w-4 h-4 text-[#6B7280] group-hover:text-[#FF4DB8] group-hover:translate-x-0.5 transition-all" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Profile Section */}
        <div className="px-6 pb-6 border-t border-[#EAE6EF] pt-6">
          <h3 className="text-xs font-semibold text-[#6B7280] uppercase mb-3 px-4">
            Профиль
          </h3>
          <ul className="space-y-1">
            {profileItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[#111827] text-sm hover:bg-gray-50 transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div className="px-6 pb-6 border-t border-[#EAE6EF] pt-6">
          <h3 className="text-xs font-semibold text-[#6B7280] uppercase mb-3 px-4">
            Популярные категории
          </h3>
          <ul className="space-y-1">
            {categories.map((category) => (
              <li key={category.label}>
                <Link
                  to={category.href}
                  onClick={onClose}
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl text-[#111827] text-sm hover:bg-gray-50 transition-colors"
                >
                  <span>{category.label}</span>
                  <span className="text-xs text-[#6B7280]">{category.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Actions */}
        <div className="sticky bottom-0 bg-white border-t border-[#EAE6EF] px-6 py-4 space-y-3">
          <Link
            to="/login"
            onClick={onClose}
            className="block text-center px-4 py-3 rounded-xl bg-[#111827] text-white font-medium text-sm hover:bg-[#0B1220] transition-colors"
          >
            Войти в аккаунт
          </Link>
          <div className="flex items-center justify-center gap-4 text-xs text-[#6B7280]">
            <a href="#" className="hover:text-[#FF4DB8] transition-colors">Помощь</a>
            <span>·</span>
            <a href="#" className="hover:text-[#FF4DB8] transition-colors">Контакты</a>
          </div>
        </div>
      </div>
    </>
  );
}