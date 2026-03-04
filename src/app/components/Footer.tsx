import { MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-white to-gray-50 border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF4DB8] to-[#FF2AA8] flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">Ü</span>
              </div>
              <span className="text-[#111827] font-semibold text-lg tracking-tight">Uilesim</span>
            </div>
            <p className="text-sm text-[#6B7280] leading-relaxed mb-4">
              Премиум e-commerce для косметики, ухода и ароматов
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white border border-[#EAE6EF] flex items-center justify-center text-[#6B7280] hover:bg-gray-50 hover:text-[#FF4DB8] hover:border-[#FF4DB8]/20 transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white border border-[#EAE6EF] flex items-center justify-center text-[#6B7280] hover:bg-gray-50 hover:text-[#FF4DB8] hover:border-[#FF4DB8]/20 transition-all"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white border border-[#EAE6EF] flex items-center justify-center text-[#6B7280] hover:bg-gray-50 hover:text-[#FF4DB8] hover:border-[#FF4DB8]/20 transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Catalog Column */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Каталог</h4>
            <ul className="space-y-2.5">
              {['Уход за кожей', 'Макияж', 'Волосы', 'Ароматы', 'Товары для дома', 'Бренды'].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-gray-600 hover:text-pink-500 transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Info Column */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Информация</h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="/about"
                  className="text-sm text-gray-600 hover:text-pink-500 transition-colors"
                >
                  О нас
                </a>
              </li>
              <li>
                <a
                  href="/delivery-returns"
                  className="text-sm text-gray-600 hover:text-pink-500 transition-colors"
                >
                  Доставка и возврат
                </a>
              </li>
              <li>
                <a
                  href="/help"
                  className="text-sm text-gray-600 hover:text-pink-500 transition-colors"
                >
                  Помощь
                </a>
              </li>
              <li>
                <a
                  href="/for-you"
                  className="text-sm text-gray-600 hover:text-pink-500 transition-colors"
                >
                  Программа лояльности
                </a>
              </li>
              <li>
                <a
                  href="/stores"
                  className="text-sm text-gray-600 hover:text-pink-500 transition-colors"
                >
                  Магазины
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Контакты</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  Астана, пр. Мангилик Ел, 53/1
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-pink-500 flex-shrink-0" />
                <a href="tel:+77172000000" className="text-sm text-gray-600 hover:text-pink-500">
                  +7 (717) 200-00-00
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-pink-500 flex-shrink-0" />
                <a
                  href="mailto:hello@uilesim.kz"
                  className="text-sm text-gray-600 hover:text-pink-500"
                >
                  hello@uilesim.kz
                </a>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Новости и акции</h5>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  className="flex-1 px-3 py-2 rounded-lg border border-[#EAE6EF] text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20"
                />
                <button className="px-4 py-2 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#0B1220] hover:shadow-md transition-all">
                  →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © 2026 Uilesim. Все права защищены.
          </p>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="text-xs text-gray-500 hover:text-pink-500 transition-colors">
              Политика конфиденциальности
            </a>
            <a href="/terms" className="text-xs text-gray-500 hover:text-pink-500 transition-colors">
              Условия использования
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}