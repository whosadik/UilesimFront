import { Search, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useI18n } from '../../shared/i18n/LanguageContext';

export type FilterCategoryOption = {
  id: string;
  label: string;
};

export type FilterSortOption = {
  value: string;
  label: string;
};

interface FilterBarProps {
  onSortChange?: (sort: string) => void;
  onCategoryChange?: (category: string) => void;
  onInStockChange?: (inStock: boolean) => void;
  onSearchChange?: (search: string) => void;
  categories?: FilterCategoryOption[];
  sortOptions?: FilterSortOption[];
  activeCategory?: string;
  inStock?: boolean;
  searchValue?: string;
}

export function FilterBar({
  onSortChange,
  onCategoryChange,
  onInStockChange,
  onSearchChange,
  categories,
  sortOptions,
  activeCategory,
  inStock,
  searchValue,
}: FilterBarProps) {
  const { messages } = useI18n();

  const defaultCategories: FilterCategoryOption[] = useMemo(
    () => [
      { id: 'all', label: messages.filterBar.categories.all },
      { id: 'skincare', label: messages.filterBar.categories.skincare },
      { id: 'haircare', label: messages.filterBar.categories.haircare },
      { id: 'makeup', label: messages.filterBar.categories.makeup },
      { id: 'fragrance', label: messages.filterBar.categories.fragrance },
    ],
    [messages.filterBar.categories],
  );

  const defaultSortOptions: FilterSortOption[] = useMemo(
    () => [
      { value: 'popular', label: messages.filterBar.sort.popular },
      { value: 'new', label: messages.filterBar.sort.new },
      { value: 'price_asc', label: messages.filterBar.sort.priceAsc },
      { value: 'price_desc', label: messages.filterBar.sort.priceDesc },
    ],
    [messages.filterBar.sort],
  );

  const categoryOptions = useMemo(
    () => (Array.isArray(categories) && categories.length > 0 ? categories : defaultCategories),
    [categories, defaultCategories],
  );

  const availableSortOptions = useMemo(
    () => (Array.isArray(sortOptions) && sortOptions.length > 0 ? sortOptions : defaultSortOptions),
    [defaultSortOptions, sortOptions],
  );

  const [internalCategory, setInternalCategory] = useState('all');
  const [internalInStock, setInternalInStock] = useState(false);
  const [internalSearch, setInternalSearch] = useState('');

  const selectedCategory = activeCategory !== undefined ? activeCategory : internalCategory;
  const selectedInStock = inStock !== undefined ? inStock : internalInStock;
  const selectedSearch = searchValue !== undefined ? searchValue : internalSearch;

  return (
    <div className="mb-8 rounded-2xl border border-[#EAE6EF] bg-white p-4">
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="relative">
          <select
            onChange={(event) => onSortChange?.(event.target.value)}
            className="w-full cursor-pointer appearance-none rounded-xl border border-[#EAE6EF] bg-white px-4 py-2.5 pr-10 text-sm text-[#111827] transition-colors hover:border-[#FF4DB8]/20 focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20 lg:w-auto"
          >
            {availableSortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        </div>

        <div className="scrollbar-hide flex flex-1 items-center gap-2 overflow-x-auto">
          {categoryOptions.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                if (activeCategory === undefined) {
                  setInternalCategory(category.id);
                }
                onCategoryChange?.(category.id);
              }}
              className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-brand-pink-500 text-white shadow-md'
                  : 'border border-[#EAE6EF] bg-gray-50 text-[#6B7280] hover:bg-gray-100'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={selectedInStock}
              onChange={(event) => {
                if (inStock === undefined) {
                  setInternalInStock(event.target.checked);
                }
                onInStockChange?.(event.target.checked);
              }}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#FF4DB8]/20 peer-checked:bg-[#FF4DB8] peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-['']" />
          </label>
          <span className="whitespace-nowrap text-sm text-[#6B7280]">{messages.filterBar.inStock}</span>
        </div>

        <div className="relative w-full shrink-0 lg:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={messages.filterBar.searchPlaceholder}
            value={selectedSearch}
            onChange={(event) => {
              if (searchValue === undefined) {
                setInternalSearch(event.target.value);
              }
              onSearchChange?.(event.target.value);
            }}
            className="w-full rounded-xl border border-[#EAE6EF] py-2.5 pr-4 pl-10 text-sm text-[#111827] transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20"
          />
        </div>
      </div>
    </div>
  );
}
