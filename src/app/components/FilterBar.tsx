import { Search, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';

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

const DEFAULT_CATEGORIES: FilterCategoryOption[] = [
  { id: 'all', label: 'Все' },
  { id: 'skincare', label: 'Skincare' },
  { id: 'haircare', label: 'Haircare' },
  { id: 'makeup', label: 'Makeup' },
  { id: 'fragrance', label: 'Fragrance' },
];

const DEFAULT_SORT_OPTIONS: FilterSortOption[] = [
  { value: 'popular', label: 'Популярные' },
  { value: 'new', label: 'Новые' },
  { value: 'price_asc', label: 'Цена: по возрастанию' },
  { value: 'price_desc', label: 'Цена: по убыванию' },
];

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
  const categoryOptions = useMemo(
    () => (Array.isArray(categories) && categories.length > 0 ? categories : DEFAULT_CATEGORIES),
    [categories],
  );
  const availableSortOptions = useMemo(
    () => (Array.isArray(sortOptions) && sortOptions.length > 0 ? sortOptions : DEFAULT_SORT_OPTIONS),
    [sortOptions],
  );

  const [internalCategory, setInternalCategory] = useState('all');
  const [internalInStock, setInternalInStock] = useState(false);
  const [internalSearch, setInternalSearch] = useState('');

  const selectedCategory = activeCategory !== undefined ? activeCategory : internalCategory;
  const selectedInStock = inStock !== undefined ? inStock : internalInStock;
  const selectedSearch = searchValue !== undefined ? searchValue : internalSearch;

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#EAE6EF] mb-8">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative">
          <select
            onChange={(e) => onSortChange?.(e.target.value)}
            className="appearance-none w-full lg:w-auto px-4 py-2.5 pr-10 rounded-xl border border-[#EAE6EF] text-sm text-[#111827] bg-white hover:border-[#FF4DB8]/20 focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20 transition-colors cursor-pointer"
          >
            {availableSortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>

        <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {categoryOptions.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                if (activeCategory === undefined) {
                  setInternalCategory(category.id);
                }
                onCategoryChange?.(category.id);
              }}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-[#111827] text-white shadow-md'
                  : 'bg-gray-50 text-[#6B7280] hover:bg-gray-100 border border-[#EAE6EF]'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={selectedInStock}
              onChange={(e) => {
                if (inStock === undefined) {
                  setInternalInStock(e.target.checked);
                }
                onInStockChange?.(e.target.checked);
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#FF4DB8]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4DB8]" />
          </label>
          <span className="text-sm text-[#6B7280] whitespace-nowrap">В наличии</span>
        </div>

        <div className="relative flex-shrink-0 w-full lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск"
            value={selectedSearch}
            onChange={(e) => {
              if (searchValue === undefined) {
                setInternalSearch(e.target.value);
              }
              onSearchChange?.(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EAE6EF] text-sm text-[#111827] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20 transition-all"
          />
        </div>
      </div>
    </div>
  );
}
