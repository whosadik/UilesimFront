import { Sparkles } from 'lucide-react';
import { Button } from './Button';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  if (!isOpen) return null;

  const categories = [
    {
      title: 'Skincare',
      items: ['Очищение', 'Тонизирование', 'Сыворотки', 'Увлажнение', 'Маски', 'SPF защита'],
    },
    {
      title: 'Makeup',
      items: ['Лицо', 'Глаза', 'Губы', 'Брови', 'Кисти', 'Наборы'],
    },
    {
      title: 'Haircare',
      items: ['Шампуни', 'Кондиционеры', 'Маски для волос', 'Стайлинг', 'Специальный уход'],
    },
    {
      title: 'Fragrance',
      items: ['Парфюм', 'Туалетная вода', 'Дорожные форматы', 'Наборы', 'Свечи'],
    },
  ];

  const quickLinks = [
    'В наличии',
    'Мини-форматы',
    'Наборы',
    'Подарки',
    'Bestsellers',
    'Новинки месяца',
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Mega Menu Content */}
      <div className="absolute left-0 right-0 top-full mt-0 bg-white border-t border-[#EAE6EF] shadow-2xl z-50 animate-in slide-in-from-top-4 duration-300">
        <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Categories Grid */}
            <div className="md:col-span-2 grid grid-cols-2 gap-6">
              {categories.map((category) => (
                <div key={category.title}>
                  <h3 className="text-sm font-semibold text-[#111827] mb-3">
                    {category.title}
                  </h3>
                  <ul className="space-y-2">
                    {category.items.map((item) => (
                      <li key={item}>
                        <a
                          href="#"
                          className="text-sm text-[#6B7280] hover:text-[#FF4DB8] transition-colors"
                        >
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Right Column: Quick Links + Promo */}
            <div className="space-y-6">
              {/* Quick Links */}
              <div>
                <h3 className="text-sm font-semibold text-[#111827] mb-3">
                  Быстрый доступ
                </h3>
                <ul className="space-y-2">
                  {quickLinks.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-[#6B7280] hover:text-[#FF4DB8] transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Compact Promo Tile */}
              <div className="relative rounded-2xl p-5 bg-gradient-to-br from-[#FFE1F2] to-pink-50 border border-[#FF4DB8]/20 overflow-hidden">
                {/* Decorative */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF4DB8]/10 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF4DB8] mb-3">
                    <Sparkles className="w-3 h-3 text-white" />
                    <span className="text-xs font-medium text-white">Для вас</span>
                  </div>
                  
                  <h4 className="text-base font-bold text-[#111827] mb-2">
                    Персональный оффер
                  </h4>
                  <p className="text-xs text-[#6B7280] mb-3 leading-relaxed">
                    Подберём уход под ваш тип кожи
                  </p>
                  
                  <Button variant="primary" className="w-full text-xs py-2">
                    Пройти тест
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}