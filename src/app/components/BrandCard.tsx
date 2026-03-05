import { ChevronRight } from 'lucide-react';

interface BrandCardProps {
  name?: string;
  logo?: string;
  logoUrl?: string;
  logo_url?: string;
  productCount?: number | string;
  product_count?: number | string;
  onClick?: () => void;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

export function BrandCard({
  name,
  logo,
  logoUrl,
  logo_url,
  productCount,
  product_count,
  onClick,
}: BrandCardProps) {
  const brandName = typeof name === 'string' && name.trim() ? name.trim() : 'Бренд';
  const logoSrc =
    (typeof logo === 'string' && logo.trim() && logo.trim()) ||
    (typeof logoUrl === 'string' && logoUrl.trim() && logoUrl.trim()) ||
    (typeof logo_url === 'string' && logo_url.trim() && logo_url.trim()) ||
    undefined;

  const countRaw = toNumber(productCount ?? product_count);
  const count = countRaw !== undefined ? Math.max(0, Math.round(countRaw)) : undefined;

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center p-6 lg:p-8 rounded-2xl bg-white border border-[#EAE6EF] hover:border-[#FF4DB8]/30 hover:shadow-lg transition-all overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10 w-full text-center space-y-3">
        {logoSrc ? (
          <div className="w-20 h-20 mx-auto rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
            <img src={logoSrc} alt={brandName} className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="w-20 h-20 mx-auto rounded-xl bg-gradient-to-br from-[#FFE1F2] to-pink-50 flex items-center justify-center text-2xl font-bold text-[#FF4DB8]">
            {brandName.charAt(0)}
          </div>
        )}

        <h3 className="text-sm font-semibold text-[#111827] group-hover:text-[#FF4DB8] transition-colors">
          {brandName}
        </h3>

        {count !== undefined && (
          <p className="text-xs text-[#6B7280]">{count} товаров</p>
        )}

        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-4 h-4 text-[#FF4DB8]" />
        </div>
      </div>
    </button>
  );
}
