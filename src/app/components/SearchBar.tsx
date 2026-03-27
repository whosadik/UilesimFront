import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "../../shared/i18n/LanguageContext";

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onDebouncedSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  loading?: boolean;
  disabled?: boolean;
}

export function SearchBar({
  value: controlledValue,
  onChange,
  onSearch,
  onDebouncedSearch,
  placeholder,
  className = "",
  debounceMs = 350,
  loading = false,
  disabled = false,
}: SearchBarProps) {
  const { language } = useI18n();
  const resolvedPlaceholder =
    placeholder ??
    (language === "kk" ? "Іздеу..." : language === "en" ? "Search..." : "Поиск...");
  const [internalValue, setInternalValue] = useState("");
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  useEffect(() => {
    if (!onDebouncedSearch) {
      return;
    }

    const timer = window.setTimeout(() => {
      onDebouncedSearch(value);
    }, Math.max(0, debounceMs));

    return () => window.clearTimeout(timer);
  }, [debounceMs, onDebouncedSearch, value]);

  const handleChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const handleClear = () => {
    handleChange("");
    onSearch?.("");
    onDebouncedSearch?.("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(value);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] pointer-events-none" />
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={resolvedPlaceholder}
        className="w-full pl-12 pr-12 py-3 rounded-xl border border-[#EAE6EF] bg-white text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20 focus:border-[#FF4DB8] transition-all disabled:bg-gray-100 disabled:text-[#6B7280] disabled:cursor-not-allowed"
      />
      {value && !loading && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-[#6B7280] hover:text-[#FF4DB8] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      {loading && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#EAE6EF] border-t-[#FF4DB8] rounded-full animate-spin" />
      )}
    </form>
  );
}
