import { ChevronRight } from 'lucide-react';

interface BrandCardProps {
  name: string;
  logo?: string;
  productCount?: number;
  onClick?: () => void;
}

export function BrandCard({ name, logo, productCount, onClick }: BrandCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center p-6 lg:p-8 rounded-2xl bg-white border border-[#EAE6EF] hover:border-[#FF4DB8]/30 hover:shadow-lg transition-all overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="relative z-10 w-full text-center space-y-3">
        {/* Logo */}
        {logo ? (
          <div className="w-20 h-20 mx-auto rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
            <img src={logo} alt={name} className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="w-20 h-20 mx-auto rounded-xl bg-gradient-to-br from-[#FFE1F2] to-pink-50 flex items-center justify-center text-2xl font-bold text-[#FF4DB8]">
            {name.charAt(0)}
          </div>
        )}
        
        {/* Brand Name */}
        <h3 className="text-sm font-semibold text-[#111827] group-hover:text-[#FF4DB8] transition-colors">
          {name}
        </h3>
        
        {/* Product Count */}
        {productCount !== undefined && (
          <p className="text-xs text-[#6B7280]">
            {productCount} товаров
          </p>
        )}
        
        {/* Hover Arrow */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-4 h-4 text-[#FF4DB8]" />
        </div>
      </div>
    </button>
  );
}
