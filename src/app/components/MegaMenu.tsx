import { useEffect, useRef } from 'react';
import { ChevronRight, Sparkles, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
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
  catalogHref?: string;
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

const LABEL_OVERRIDES: Record<string, string> = {
  spf: 'SPF',
};

function formatMenuLabel(label: string): string {
  return label
    .split(' ')
    .map((chunk) =>
      chunk
        .split('_')
        .map((part) => {
          const normalized = part.trim().toLowerCase();
          if (!normalized) {
            return '';
          }
          if (LABEL_OVERRIDES[normalized]) {
            return LABEL_OVERRIDES[normalized];
          }
          return normalized.charAt(0).toUpperCase() + normalized.slice(1);
        })
        .join(' '),
    )
    .join(' ')
    .trim();
}

export function MegaMenu({ isOpen, onClose, categories, quickLinks, catalogHref = '/catalog' }: MegaMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastLocationRef = useRef(`${location.pathname}${location.search}`);

  const categorySections =
    Array.isArray(categories) && categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const links = Array.isArray(quickLinks) && quickLinks.length > 0 ? quickLinks : DEFAULT_QUICK_LINKS;

  useEffect(() => {
    const currentLocation = `${location.pathname}${location.search}`;
    if (isOpen && lastLocationRef.current !== currentLocation) {
      onClose();
    }
    lastLocationRef.current = currentLocation;
  }, [isOpen, location.pathname, location.search, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div
        className="absolute left-0 right-0 top-full mt-0 bg-white border-t border-[#EAE6EF] shadow-2xl z-50 animate-in slide-in-from-top-4 duration-300"
        role="dialog"
        aria-label="Catalog menu"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8">
          <div className="mb-8 flex flex-col gap-4 border-b border-[#EAE6EF] pb-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FF4DB8]">Catalog</p>
              <h2 className="mt-2 text-2xl font-bold text-[#111827]">Browse the catalog by category</h2>
              <p className="mt-2 text-sm text-[#6B7280]">
                Open the full catalog or jump straight into the section you need.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={catalogHref}
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-full border border-[#111827] px-4 py-2 text-sm font-semibold text-[#111827] transition-colors hover:bg-[#111827] hover:text-white"
              >
                Shop all catalog
                <ChevronRight className="h-4 w-4" />
              </Link>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#EAE6EF] text-[#111827] transition-colors hover:bg-gray-50"
                aria-label="Close catalog menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

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
                          {formatMenuLabel(item.label)}
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
                        {formatMenuLabel(item.label)}
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
