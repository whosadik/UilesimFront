import { useState } from 'react';
import { Link } from 'react-router';
import { Search, Heart, ShoppingCart, User, Menu as MenuIcon, AlignJustify, Percent, LogOut, Settings, Package, Receipt, Map, Clock, Shield } from 'lucide-react';
import { IconButton } from './IconButton';
import { MegaMenu } from './MegaMenu';
import { MobileMenu } from './MobileMenu';
import logoImage from '@/assets/UylesimLogo.png';

export function Navbar() {
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const mainMenu = [
    { label: 'Каталог', hasIcon: true, trigger: true, href: '/catalog' },
    { label: 'Бренды', href: '/brands' },
    { label: 'Новинки', isActive: true, href: '/new' },
    { label: 'Акции', href: '/promotions' },
    { label: 'Для вас', href: '/for-you' },
    { label: 'Магазины', href: '/stores' },
    { label: 'Подарочные карты', href: '/gift-cards' },
  ];

  const profileMenuItems = [
    { label: 'Мой профиль', href: '/me', icon: <User className="w-4 h-4" /> },
    { label: 'Мои товары', href: '/me/owned', icon: <Package className="w-4 h-4" /> },
    { label: 'Roadmap', href: '/me/roadmap', icon: <Map className="w-4 h-4" /> },
    { label: 'Моя рутина', href: '/me/routine', icon: <Clock className="w-4 h-4" /> },
    { label: 'Транзакции', href: '/me/transactions', icon: <Receipt className="w-4 h-4" /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-[#EAE6EF]">
      {/* Topbar - Info Links */}
      <div className="border-b border-[#EAE6EF]/50 hidden md:block">
        <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center gap-6 text-xs text-[#6B7280]">
              <a href="#" className="hover:text-[#FF4DB8] transition-colors">
                Доставка и оплата
              </a>
              <a href="#" className="hover:text-[#FF4DB8] transition-colors">
                Контакты
              </a>
              <a href="#" className="hover:text-[#FF4DB8] transition-colors">
                О нас
              </a>
              <Link
                to="/admin"
                className="flex items-center gap-1 hover:text-[#FF4DB8] transition-colors font-medium text-[#111827]"
              >
                <Shield className="w-3 h-3" />
                Админ
              </Link>
            </div>
            <div className="flex items-center gap-6 text-xs text-[#6B7280]">
              <a href="#" className="hover:text-[#FF4DB8] transition-colors">
                Помощь
              </a>
              <a href="#" className="hover:text-[#FF4DB8] transition-colors">
                Программа лояльности
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <img 
              src={logoImage} 
              alt="Üilesim" 
              className="w-9 h-9 lg:w-10 lg:h-10 object-contain transition-transform group-hover:scale-105"
            />
            <span className="text-[#111827] font-semibold text-base lg:text-lg tracking-tight">
              Üilesim
            </span>
          </Link>

          {/* Desktop Main Menu */}
          <div className="hidden xl:flex items-center gap-1 flex-1 justify-center px-8">
            {mainMenu.map((item) => (
              item.trigger ? (
                <button
                  key={item.label}
                  onClick={(e) => {
                    e.preventDefault();
                    setMegaMenuOpen(!megaMenuOpen);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all relative group ${
                    item.isActive
                      ? 'text-[#111827]'
                      : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  {item.hasIcon && <AlignJustify className="w-4 h-4" />}
                  <span>{item.label}</span>
                  
                  {/* Active underline */}
                  {item.isActive && (
                    <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#FF4DB8]"></span>
                  )}
                  
                  {/* Hover underline */}
                  {!item.isActive && (
                    <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#FF4DB8] scale-x-0 group-hover:scale-x-100 transition-transform"></span>
                  )}
                </button>
              ) : (
                <Link
                  key={item.label}
                  to={item.href || '#'}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all relative group ${
                    item.isActive
                      ? 'text-[#111827]'
                      : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  <span>{item.label}</span>
                  
                  {/* Active underline */}
                  {item.isActive && (
                    <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#FF4DB8]"></span>
                  )}
                  
                  {/* Hover underline */}
                  {!item.isActive && (
                    <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#FF4DB8] scale-x-0 group-hover:scale-x-100 transition-transform"></span>
                  )}
                </Link>
              )
            ))}

            {/* Special Promo Pill */}
            <Link
              to="/sale"
              className="flex items-center gap-1.5 px-3 py-1.5 ml-2 rounded-full bg-[#FFE1F2] border border-[#FF4DB8] text-[#FF4DB8] text-sm font-medium hover:bg-[#FF4DB8] hover:text-white transition-all group"
            >
              <Percent className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">Скидки до −50%</span>
            </Link>
          </div>

          {/* Tablet Menu (simplified) */}
          <div className="hidden lg:flex xl:hidden items-center gap-1 flex-1 justify-center px-4">
            <button
              onClick={(e) => {
                e.preventDefault();
                setMegaMenuOpen(!megaMenuOpen);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
            >
              <AlignJustify className="w-4 h-4" />
              <span>Каталог</span>
            </button>
            <Link to="/brands" className="px-3 py-2 text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors">
              Бренды
            </Link>
            <Link to="/new" className="px-3 py-2 text-sm font-medium text-[#111827] hover:text-[#111827] transition-colors relative">
              Новинки
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#FF4DB8]"></span>
            </Link>
            <Link to="/promotions" className="px-3 py-2 text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors">
              Акции
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link to="/search">
              <IconButton icon={<Search className="w-5 h-5" />} />
            </Link>
            <Link to="/wishlist">
              <IconButton icon={<Heart className="w-5 h-5" />} badge={2} />
            </Link>
            <Link to="/cart">
              <IconButton icon={<ShoppingCart className="w-5 h-5" />} badge={3} />
            </Link>
            
            {/* Profile Menu (Desktop) */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                onBlur={() => setTimeout(() => setProfileMenuOpen(false), 200)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 border border-[#EAE6EF] text-[#111827] hover:bg-white hover:shadow-md transition-all"
              >
                <User className="w-5 h-5" />
              </button>

              {/* Dropdown */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  {profileMenuItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 my-2" />
                  <button
                    onClick={() => {
                      localStorage.removeItem('isAuthenticated');
                      window.location.href = '/login';
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Выйти</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Mobile Menu Trigger */}
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

      {/* Mega Menu */}
      <MegaMenu isOpen={megaMenuOpen} onClose={() => setMegaMenuOpen(false)} />

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </nav>
  );
}
