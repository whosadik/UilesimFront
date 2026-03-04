import { Search, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface FilterBarProps {
  onSortChange?: (sort: string) => void;
  onCategoryChange?: (category: string) => void;
  onInStockChange?: (inStock: boolean) => void;
  onSearchChange?: (search: string) => void;
}

export function FilterBar({
  onSortChange,
  onCategoryChange,
  onInStockChange,
  onSearchChange,
}: FilterBarProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [inStock, setInStock] = useState(false);

  const categories = [
    { id: 'all', label: 'Все' },
    { id: 'skincare', label: 'Skincare' },
    { id: 'haircare', label: 'Haircare' },
    { id: 'makeup', label: 'Makeup' },
    { id: 'fragrance', label: 'Fragrance' },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#EAE6EF] mb-8">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sort Dropdown */}
        <div className="relative">
          <select
            onChange={(e) => onSortChange?.(e.target.value)}
            className="appearance-none w-full lg:w-auto px-4 py-2.5 pr-10 rounded-xl border border-[#EAE6EF] text-sm text-[#111827] bg-white hover:border-[#FF4DB8]/20 focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20 transition-colors cursor-pointer"
          >
            <option value="popular">Популярные</option>
            <option value="new">Новые</option>
            <option value="price-asc">Цена: по возрастанию</option>
            <option value="price-desc">Цена: по убыванию</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>

        {/* Category Chips */}
        <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id);
                onCategoryChange?.(category.id);
              }}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeCategory === category.id
                  ? 'bg-[#111827] text-white shadow-md'
                  : 'bg-gray-50 text-[#6B7280] hover:bg-gray-100 border border-[#EAE6EF]'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* In Stock Toggle */}
        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => {
                setInStock(e.target.checked);
                onInStockChange?.(e.target.checked);
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#FF4DB8]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4DB8]"></div>
          </label>
          <span className="text-sm text-[#6B7280] whitespace-nowrap">В наличии</span>
        </div>

        {/* Search Input */}
        <div className="relative flex-shrink-0 w-full lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск"
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EAE6EF] text-sm text-[#111827] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20 transition-all"
          />
        </div>
      </div>
    </div>
  );
}