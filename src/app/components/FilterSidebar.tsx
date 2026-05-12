import { useEffect, useState } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Slider from '@radix-ui/react-slider';
import { Check, ChevronDown, X } from 'lucide-react';

import { useI18n } from '../../shared/i18n/LanguageContext';
import { Button } from './Button';

interface FilterOption {
  id: string;
  label: string;
  count?: number | string;
}

interface FilterGroup {
  id: string;
  title: string;
  options: FilterOption[];
  type?: 'checkbox' | 'range';
}

interface FilterSidebarProps {
  filters: FilterGroup[];
  onFilterChange?: (filterId: string, value: string[] | [number, number]) => void;
  onReset?: () => void;
  className?: string;
  selectedFilters?: Record<string, string[]>;
  priceRange?: [number, number];
  initialPriceRange?: [number, number];
  minPrice?: number;
  maxPrice?: number;
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

const filterSidebarCopy = {
  ru: {
    title: 'Фильтры',
    reset: (count: number) => `Сбросить (${count})`,
    minPriceLabel: 'Минимальная цена',
    maxPriceLabel: 'Максимальная цена',
    showProducts: 'Показать товары',
  },
  kk: {
    title: 'Сүзгілер',
    reset: (count: number) => `Тазарту (${count})`,
    minPriceLabel: 'Ең төменгі баға',
    maxPriceLabel: 'Ең жоғары баға',
    showProducts: 'Тауарларды көрсету',
  },
  en: {
    title: 'Filters',
    reset: (count: number) => `Reset (${count})`,
    minPriceLabel: 'Minimum price',
    maxPriceLabel: 'Maximum price',
    showProducts: 'Show products',
  },
} as const;

export function FilterSidebar({
  filters,
  onFilterChange,
  onReset,
  className = '',
  selectedFilters: selectedFiltersProp,
  priceRange: priceRangeProp,
  initialPriceRange = [0, 10000],
  minPrice = 0,
  maxPrice = 10000,
}: FilterSidebarProps) {
  const { language } = useI18n();
  const copy = filterSidebarCopy[language];
  const [selectedFiltersState, setSelectedFiltersState] = useState<Record<string, string[]>>(selectedFiltersProp ?? {});
  const [priceRangeState, setPriceRangeState] = useState<[number, number]>(priceRangeProp ?? initialPriceRange);

  useEffect(() => {
    if (selectedFiltersProp) {
      setSelectedFiltersState(selectedFiltersProp);
    }
  }, [selectedFiltersProp]);

  useEffect(() => {
    if (priceRangeProp) {
      setPriceRangeState(priceRangeProp);
    }
  }, [priceRangeProp]);

  useEffect(() => {
    if (!priceRangeProp) {
      setPriceRangeState(initialPriceRange);
    }
  }, [initialPriceRange, priceRangeProp]);

  const selectedFilters = selectedFiltersProp ?? selectedFiltersState;
  const priceRange = priceRangeProp ?? priceRangeState;

  const handleCheckboxChange = (groupId: string, optionId: string, checked: boolean) => {
    const current = selectedFilters[groupId] || [];
    const updated = checked ? [...current, optionId] : current.filter((id) => id !== optionId);

    setSelectedFiltersState((prev) => ({ ...prev, [groupId]: updated }));
    onFilterChange?.(groupId, updated);
  };

  const handleReset = () => {
    setSelectedFiltersState({});
    setPriceRangeState(initialPriceRange);
    onReset?.();
  };

  const activeFilterCount =
    Object.values(selectedFilters).flat().length +
    (priceRange[0] !== initialPriceRange[0] || priceRange[1] !== initialPriceRange[1] ? 1 : 0);

  return (
    <div className={`sticky top-24 ${className}`}>
      <div className="space-y-4 rounded-2xl border border-[#EAE6EF] bg-white p-6">
        <div className="flex items-center justify-between border-b border-[#EAE6EF] pb-4">
          <h2 className="text-base font-semibold text-[#111827]">{copy.title}</h2>
          {activeFilterCount > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-[#6B7280] transition-colors hover:text-[#FF4DB8]"
            >
              <X className="h-3.5 w-3.5" />
              {copy.reset(activeFilterCount)}
            </button>
          )}
        </div>

        <Accordion.Root type="multiple" defaultValue={filters.map((f) => f.id)}>
          {filters.map((group) => (
            <Accordion.Item key={group.id} value={group.id} className="border-b border-[#EAE6EF] last:border-0">
              <Accordion.Trigger className="group flex w-full items-center justify-between py-3 text-sm font-medium text-[#111827] transition-colors hover:text-[#FF4DB8]">
                {group.title}
                <ChevronDown className="h-4 w-4 text-[#6B7280] transition-transform group-data-[state=open]:rotate-180 group-hover:text-[#FF4DB8]" />
              </Accordion.Trigger>

              <Accordion.Content className="space-y-2 pb-3">
                {group.type === 'range' ? (
                  <div className="space-y-4 pt-2">
                    <Slider.Root
                      className="relative flex h-5 w-full touch-none select-none items-center"
                      value={priceRange}
                      onValueChange={([min, max]) => {
                        const next: [number, number] = [min, max];
                        setPriceRangeState(next);
                        onFilterChange?.(group.id, next);
                      }}
                      max={maxPrice}
                      min={minPrice}
                      step={100}
                    >
                      <Slider.Track className="relative h-1 grow rounded-full bg-[#EAE6EF]">
                        <Slider.Range className="absolute h-full rounded-full bg-[#FF4DB8]" />
                      </Slider.Track>
                      <Slider.Thumb
                        className="block h-4 w-4 rounded-full border-2 border-[#FF4DB8] bg-white transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20"
                        aria-label={copy.minPriceLabel}
                      />
                      <Slider.Thumb
                        className="block h-4 w-4 rounded-full border-2 border-[#FF4DB8] bg-white transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20"
                        aria-label={copy.maxPriceLabel}
                      />
                    </Slider.Root>
                    <div className="flex items-center justify-between text-xs text-[#6B7280]">
                      <span>{priceRange[0]} ₸</span>
                      <span>{priceRange[1]} ₸</span>
                    </div>
                  </div>
                ) : (
                  group.options.map((option) => {
                    const count = normalizeCount(option.count);

                    return (
                      <label
                        key={option.id}
                        className="group flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50"
                      >
                        <div className="flex flex-1 items-center gap-2">
                          <Checkbox.Root
                            className="flex h-4 w-4 items-center justify-center rounded border border-[#D1D5DB] transition-colors data-[state=checked]:border-brand-pink-500 data-[state=checked]:bg-brand-pink-500"
                            checked={selectedFilters[group.id]?.includes(option.id)}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(group.id, option.id, checked as boolean)
                            }
                          >
                            <Checkbox.Indicator>
                              <Check className="h-3 w-3 text-white" />
                            </Checkbox.Indicator>
                          </Checkbox.Root>
                          <span className="text-sm text-[#111827]">{option.label}</span>
                        </div>
                        {count !== undefined && <span className="text-xs text-[#6B7280]">{count}</span>}
                      </label>
                    );
                  })
                )}
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>

        {activeFilterCount > 0 && (
          <Button variant="primary" className="mt-4 w-full">
            {copy.showProducts}
          </Button>
        )}
      </div>
    </div>
  );
}
