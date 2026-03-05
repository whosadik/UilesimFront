import { Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from './Button';

export type MegaMenuCategory = {
  title: string;
  items: Array<{ label: string; href: string }>;
};

export type MegaMenuQuickLink = {
  label: string;
  href: string;
};

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: MegaMenuCategory[];
  quickLinks?: MegaMenuQuickLink[];
}

const DEFAULT_CATEGORIES: MegaMenuCategory[] = [
  {
    title: 'Skincare',
    items: [
      { label: 'Очищение', href: '/catalog?product_type=cleanser' },
      { label: 'Тонизирование', href: '/catalog?product_type=toner' },
      { label: 'Сыворотки', href: '/catalog?product_type=serum' },
      { label: 'Увлажнение', href: '/catalog?product_type=moisturizer' },
      { label: 'Маски', href: '/catalog?product_type=mask' },
      { label: 'SPF защита', href: '/catalog?product_type=spf' },
    ],
  },
  {
    title: 'Makeup',
    items: [
      { label: 'Лицо', href: '/catalog?category=makeup' },
      { label: 'Глаза', href: '/catalog?product_type=eyeshadow' },
      { label: 'Губы', href: '/catalog?product_type=lipstick' },
      { label: 'Брови', href: '/catalog?product_type=brow' },
      { label: 'Кисти', href: '/catalog?product_type=brush' },
      { label: 'Наборы', href: '/catalog?product_type=set' },
    ],
  },
  {
    title: 'Haircare',
    items: [
      { label: 'Шампуни', href: '/catalog?product_type=shampoo' },
      { label: 'Кондиционеры', href: '/catalog?product_type=conditioner' },
      { label: 'Маски для волос', href: '/catalog?product_type=hair_mask' },
      { label: 'Стайлинг', href: '/catalog?product_type=styling' },
      { label: 'Специальный уход', href: '/catalog?category=haircare' },
    ],
  },
  {
    title: 'Fragrance',
    items: [
      { label: 'Парфюм', href: '/catalog?category=fragrance' },
      { label: 'Туалетная вода', href: '/catalog?product_type=edt' },
      { label: 'Дорожные форматы', href: '/catalog?product_type=travel' },
      { label: 'Наборы', href: '/catalog?product_type=set' },
      { label: 'Свечи', href: '/catalog?product_type=candle' },
    ],
  },
];

const DEFAULT_QUICK_LINKS: MegaMenuQuickLink[] = [
  { label: 'В наличии', href: '/catalog?in_stock=true' },
  { label: 'Мини-форматы', href: '/catalog?product_type=travel' },
  { label: 'Наборы', href: '/catalog?product_type=set' },
  { label: 'Подарки', href: '/gift-cards' },
  { label: 'Бестселлеры', href: '/for-you' },
  { label: 'Новинки месяца', href: '/new' },
];

export function MegaMenu({ isOpen, onClose, categories, quickLinks }: MegaMenuProps) {
  if (!isOpen) return null;

  const categorySections =
    Array.isArray(categories) && categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const links = Array.isArray(quickLinks) && quickLinks.length > 0 ? quickLinks : DEFAULT_QUICK_LINKS;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="absolute left-0 right-0 top-full mt-0 bg-white border-t border-[#EAE6EF] shadow-2xl z-50 animate-in slide-in-from-top-4 duration-300">
        <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 grid grid-cols-2 gap-6">
              {categorySections.map((category) => (
                <div key={category.title}>
                  <h3 className="text-sm font-semibold text-[#111827] mb-3">{category.title}</h3>
                  <ul className="space-y-2">
                    {category.items.map((item) => (
                      <li key={`${category.title}-${item.label}`}>
                        <Link
                          to={item.href}
                          onClick={onClose}
                          className="text-sm text-[#6B7280] hover:text-[#FF4DB8] transition-colors"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-[#111827] mb-3">Быстрый доступ</h3>
                <ul className="space-y-2">
                  {links.map((item) => (
                    <li key={item.label}>
                      <Link
                        to={item.href}
                        onClick={onClose}
                        className="text-sm text-[#6B7280] hover:text-[#FF4DB8] transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative rounded-2xl p-5 bg-gradient-to-br from-[#FFE1F2] to-pink-50 border border-[#FF4DB8]/20 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF4DB8]/10 rounded-full blur-2xl" />

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF4DB8] mb-3">
                    <Sparkles className="w-3 h-3 text-white" />
                    <span className="text-xs font-medium text-white">Для вас</span>
                  </div>

                  <h4 className="text-base font-bold text-[#111827] mb-2">Персональный оффер</h4>
                  <p className="text-xs text-[#6B7280] mb-3 leading-relaxed">
                    Подберём уход под ваш тип кожи
                  </p>

                  <Button variant="primary" className="w-full text-xs py-2" onClick={onClose}>
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
