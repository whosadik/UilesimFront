import { useState } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import * as Accordion from '@radix-ui/react-accordion';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Slider from '@radix-ui/react-slider';
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

export function FilterSidebar({
  filters,
  onFilterChange,
  onReset,
  className = '',
  initialPriceRange = [0, 10000],
  minPrice = 0,
  maxPrice = 10000,
}: FilterSidebarProps) {
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [priceRange, setPriceRange] = useState<[number, number]>(initialPriceRange);

  const handleCheckboxChange = (groupId: string, optionId: string, checked: boolean) => {
    const current = selectedFilters[groupId] || [];
    const updated = checked ? [...current, optionId] : current.filter((id) => id !== optionId);

    setSelectedFilters((prev) => ({ ...prev, [groupId]: updated }));
    onFilterChange?.(groupId, updated);
  };

  const handleReset = () => {
    setSelectedFilters({});
    setPriceRange(initialPriceRange);
    onReset?.();
  };

  const activeFilterCount = Object.values(selectedFilters).flat().length;

  return (
    <div className={`sticky top-24 ${className}`}>
      <div className="rounded-2xl bg-white border border-[#EAE6EF] p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE6EF]">
          <h2 className="text-base font-semibold text-[#111827]">Фильтры</h2>
          {activeFilterCount > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#FF4DB8] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Сбросить ({activeFilterCount})
            </button>
          )}
        </div>

        <Accordion.Root type="multiple" defaultValue={filters.map((f) => f.id)}>
          {filters.map((group) => (
            <Accordion.Item key={group.id} value={group.id} className="border-b border-[#EAE6EF] last:border-0">
              <Accordion.Trigger className="flex items-center justify-between w-full py-3 text-sm font-medium text-[#111827] hover:text-[#FF4DB8] transition-colors group">
                {group.title}
                <ChevronDown className="w-4 h-4 text-[#6B7280] group-hover:text-[#FF4DB8] transition-transform group-data-[state=open]:rotate-180" />
              </Accordion.Trigger>

              <Accordion.Content className="pb-3 space-y-2">
                {group.type === 'range' ? (
                  <div className="space-y-4 pt-2">
                    <Slider.Root
                      className="relative flex items-center select-none touch-none w-full h-5"
                      value={priceRange}
                      onValueChange={([min, max]) => {
                        const next: [number, number] = [min, max];
                        setPriceRange(next);
                        onFilterChange?.(group.id, next);
                      }}
                      max={maxPrice}
                      min={minPrice}
                      step={100}
                    >
                      <Slider.Track className="bg-[#EAE6EF] relative grow rounded-full h-1">
                        <Slider.Range className="absolute bg-[#FF4DB8] rounded-full h-full" />
                      </Slider.Track>
                      <Slider.Thumb
                        className="block w-4 h-4 bg-white border-2 border-[#FF4DB8] rounded-full hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20 transition-transform"
                        aria-label="Минимальная цена"
                      />
                      <Slider.Thumb
                        className="block w-4 h-4 bg-white border-2 border-[#FF4DB8] rounded-full hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20 transition-transform"
                        aria-label="Максимальная цена"
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
                        className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <Checkbox.Root
                            className="flex h-4 w-4 items-center justify-center rounded border border-[#D1D5DB] data-[state=checked]:bg-[#111827] data-[state=checked]:border-[#111827] transition-colors"
                            checked={selectedFilters[group.id]?.includes(option.id)}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(group.id, option.id, checked as boolean)
                            }
                          >
                            <Checkbox.Indicator>
                              <Check className="w-3 h-3 text-white" />
                            </Checkbox.Indicator>
                          </Checkbox.Root>
                          <span className="text-sm text-[#111827]">{option.label}</span>
                        </div>
                        {count !== undefined && (
                          <span className="text-xs text-[#6B7280]">{count}</span>
                        )}
                      </label>
                    );
                  })
                )}
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>

        {activeFilterCount > 0 && (
          <Button variant="primary" className="w-full mt-4">
            Показать товары
          </Button>
        )}
      </div>
    </div>
  );
}
