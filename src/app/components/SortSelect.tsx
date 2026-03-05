import { ArrowUpDown } from 'lucide-react';

export type SortOption = 'popular' | 'new' | 'price_asc' | 'price_desc' | 'price-asc' | 'price-desc' | 'rating';

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  options?: Array<{ value: SortOption; label: string }>;
}

const defaultOptions = [
  { value: 'popular' as const, label: 'Популярные' },
  { value: 'new' as const, label: 'Новинки' },
  { value: 'price_asc' as const, label: 'Цена: по возрастанию' },
  { value: 'price_desc' as const, label: 'Цена: по убыванию' },
  { value: 'rating' as const, label: 'По рейтингу' },
];

function normalizeSortValue(value: SortOption): SortOption {
  if (value === 'price-asc') return 'price_asc';
  if (value === 'price-desc') return 'price_desc';
  return value;
}

export function SortSelect({ value, onChange, options = defaultOptions }: SortSelectProps) {
  return (
    <div className="relative">
      <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(normalizeSortValue(e.target.value as SortOption))}
        className="pl-10 pr-4 py-2 rounded-xl border border-[#EAE6EF] text-sm text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20 focus:border-[#FF4DB8] transition-all appearance-none cursor-pointer"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
