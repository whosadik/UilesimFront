import { useEffect, useRef } from 'react';
import { ChevronRight, Sparkles, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';

import { Button } from './Button';
import { useI18n } from '../../shared/i18n/LanguageContext';

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

export function MegaMenu({
  isOpen,
  onClose,
  categories,
  quickLinks,
  catalogHref = '/catalog',
}: MegaMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { messages } = useI18n();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastLocationRef = useRef(`${location.pathname}${location.search}`);

  const defaultCategories: MegaMenuCategory[] = [
    {
      title: messages.catalog.categories.skincare,
      items: [
        { label: messages.catalog.items.cleansers, href: '/catalog?product_type=cleanser' },
        { label: messages.catalog.items.toners, href: '/catalog?product_type=toner' },
        { label: messages.catalog.items.serums, href: '/catalog?product_type=serum' },
        { label: messages.catalog.items.moisturizers, href: '/catalog?product_type=moisturizer' },
        { label: messages.catalog.items.masks, href: '/catalog?product_type=mask' },
        { label: messages.catalog.items.spf, href: '/catalog?product_type=spf' },
      ],
    },
    {
      title: messages.catalog.categories.makeup,
      items: [
        { label: messages.catalog.items.face, href: '/catalog?category=makeup' },
        { label: messages.catalog.items.eyes, href: '/catalog?product_type=eyeshadow' },
        { label: messages.catalog.items.lips, href: '/catalog?product_type=lipstick' },
        { label: messages.catalog.items.brows, href: '/catalog?product_type=brow' },
        { label: messages.catalog.items.brushes, href: '/catalog?product_type=brush' },
        { label: messages.catalog.categories.sets, href: '/catalog?product_type=set' },
      ],
    },
    {
      title: messages.catalog.categories.haircare,
      items: [
        { label: messages.catalog.items.shampoos, href: '/catalog?product_type=shampoo' },
        { label: messages.catalog.items.conditioners, href: '/catalog?product_type=conditioner' },
        { label: messages.catalog.items.hairMasks, href: '/catalog?product_type=hair_mask' },
        { label: messages.catalog.items.styling, href: '/catalog?product_type=styling' },
        { label: messages.catalog.items.treatments, href: '/catalog?category=haircare' },
      ],
    },
    {
      title: messages.catalog.categories.fragrance,
      items: [
        { label: messages.catalog.items.perfume, href: '/catalog?category=fragrance' },
        { label: messages.catalog.items.eauDeToilette, href: '/catalog?product_type=edt' },
        { label: messages.catalog.items.travelSizes, href: '/catalog?product_type=travel' },
        { label: messages.catalog.categories.sets, href: '/catalog?product_type=set' },
        { label: messages.catalog.items.candles, href: '/catalog?product_type=candle' },
      ],
    },
  ];

  const defaultQuickLinks: MegaMenuQuickLink[] = [
    { label: messages.catalog.quickLinks.inStock, href: '/catalog?in_stock=true' },
    { label: messages.catalog.quickLinks.travelSizes, href: '/catalog?product_type=travel' },
    { label: messages.catalog.quickLinks.sets, href: '/catalog?product_type=set' },
    { label: messages.catalog.quickLinks.gifts, href: '/gift-cards' },
    { label: messages.catalog.quickLinks.bestsellers, href: '/for-you' },
    { label: messages.catalog.quickLinks.thisMonthNew, href: '/new' },
  ];

  const categorySections =
    Array.isArray(categories) && categories.length > 0 ? categories : defaultCategories;
  const links = Array.isArray(quickLinks) && quickLinks.length > 0 ? quickLinks : defaultQuickLinks;

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

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div
        className="absolute left-0 right-0 top-full mt-0 bg-white border-t border-[#EAE6EF] shadow-2xl z-50 animate-in slide-in-from-top-4 duration-300"
        role="dialog"
        aria-label={messages.megaMenu.ariaLabel}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8">
          <div className="mb-8 flex flex-col gap-4 border-b border-[#EAE6EF] pb-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FF4DB8]">
                {messages.megaMenu.eyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[#111827]">{messages.megaMenu.title}</h2>
              <p className="mt-2 text-sm text-[#6B7280]">{messages.megaMenu.description}</p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={catalogHref}
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-full border border-[#111827] px-4 py-2 text-sm font-semibold text-[#111827] transition-colors hover:bg-[#111827] hover:text-white"
              >
                {messages.megaMenu.shopAll}
                <ChevronRight className="h-4 w-4" />
              </Link>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#EAE6EF] text-[#111827] transition-colors hover:bg-gray-50"
                aria-label={messages.megaMenu.close}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="grid grid-cols-2 gap-6 md:col-span-2">
              {categorySections.map((category) => (
                <div key={category.title}>
                  <h3 className="mb-3 text-sm font-semibold text-[#111827]">{category.title}</h3>
                  <ul className="space-y-2">
                    {category.items.map((item) => (
                      <li key={`${category.title}-${item.label}`}>
                        <Link
                          to={item.href}
                          onClick={onClose}
                          className="text-sm text-[#6B7280] transition-colors hover:text-[#FF4DB8]"
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
                <h3 className="mb-3 text-sm font-semibold text-[#111827]">
                  {messages.megaMenu.quickLinksTitle}
                </h3>
                <ul className="space-y-2">
                  {links.map((item) => (
                    <li key={item.label}>
                      <Link
                        to={item.href}
                        onClick={onClose}
                        className="text-sm text-[#6B7280] transition-colors hover:text-[#FF4DB8]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-[#FF4DB8]/20 bg-gradient-to-br from-[#FFE1F2] to-pink-50 p-5">
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#FF4DB8]/10 blur-2xl" />

                <div className="relative z-10">
                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#FF4DB8] px-2.5 py-1">
                    <Sparkles className="h-3 w-3 text-white" />
                    <span className="text-xs font-medium text-white">{messages.megaMenu.personalBadge}</span>
                  </div>

                  <h4 className="mb-2 text-base font-bold text-[#111827]">{messages.megaMenu.personalTitle}</h4>
                  <p className="mb-3 text-xs leading-relaxed text-[#6B7280]">
                    {messages.megaMenu.personalDescription}
                  </p>

                  <Button
                    variant="primary"
                    className="w-full py-2 text-xs"
                    onClick={() => {
                      onClose();
                      navigate('/for-you');
                    }}
                  >
                    {messages.megaMenu.personalButton}
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
