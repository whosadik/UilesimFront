import { Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
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
      { label: 'cleansers', href: '/catalog?product_type=cleanser' },
      { label: 'toners', href: '/catalog?product_type=toner' },
      { label: 'serums', href: '/catalog?product_type=serum' },
      { label: 'moisturizers', href: '/catalog?product_type=moisturizer' },
      { label: 'masks', href: '/catalog?product_type=mask' },
      { label: 'spf', href: '/catalog?product_type=spf' },
    ],
  },
  {
    title: 'Makeup',
    items: [
      { label: 'face', href: '/catalog?category=makeup' },
      { label: 'eyes', href: '/catalog?product_type=eyeshadow' },
      { label: 'lips', href: '/catalog?product_type=lipstick' },
      { label: 'brows', href: '/catalog?product_type=brow' },
      { label: 'brushes', href: '/catalog?product_type=brush' },
      { label: 'sets', href: '/catalog?product_type=set' },
    ],
  },
  {
    title: 'Haircare',
    items: [
      { label: 'shampoos', href: '/catalog?product_type=shampoo' },
      { label: 'conditioners', href: '/catalog?product_type=conditioner' },
      { label: 'hair masks', href: '/catalog?product_type=hair_mask' },
      { label: 'styling', href: '/catalog?product_type=styling' },
      { label: 'treatments', href: '/catalog?category=haircare' },
    ],
  },
  {
    title: 'Fragrance',
    items: [
      { label: 'perfume', href: '/catalog?category=fragrance' },
      { label: 'eau de toilette', href: '/catalog?product_type=edt' },
      { label: 'travel sizes', href: '/catalog?product_type=travel' },
      { label: 'sets', href: '/catalog?product_type=set' },
      { label: 'candles', href: '/catalog?product_type=candle' },
    ],
  },
];

const DEFAULT_QUICK_LINKS: MegaMenuQuickLink[] = [
  { label: 'in stock', href: '/catalog?in_stock=true' },
  { label: 'travel sizes', href: '/catalog?product_type=travel' },
  { label: 'sets', href: '/catalog?product_type=set' },
  { label: 'gifts', href: '/gift-cards' },
  { label: 'bestsellers', href: '/for-you' },
  { label: 'this month new', href: '/new' },
];

export function MegaMenu({ isOpen, onClose, categories, quickLinks }: MegaMenuProps) {
  const navigate = useNavigate();

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
                <h3 className="text-sm font-semibold text-[#111827] mb-3">quick links</h3>
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
                    <span className="text-xs font-medium text-white">for you</span>
                  </div>

                  <h4 className="text-base font-bold text-[#111827] mb-2">personal offer</h4>
                  <p className="text-xs text-[#6B7280] mb-3 leading-relaxed">
                    match products to your skin profile and goals
                  </p>

                  <Button
                    variant="primary"
                    className="w-full text-xs py-2"
                    onClick={() => {
                      onClose();
                      navigate('/for-you');
                    }}
                  >
                    take the quiz
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
