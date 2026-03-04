import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { BrandCard } from '../components/BrandCard';

const mockBrands = [
  { id: 'ordinary', name: 'The Ordinary', productCount: 42 },
  { id: 'cerave', name: 'CeraVe', productCount: 38 },
  { id: 'laroche', name: 'La Roche-Posay', productCount: 56 },
  { id: 'cetaphil', name: 'Cetaphil', productCount: 29 },
  { id: 'neutrogena', name: 'Neutrogena', productCount: 33 },
  { id: 'vichy', name: 'Vichy', productCount: 44 },
  { id: 'loreal', name: "L'Oréal", productCount: 67 },
  { id: 'maybelline', name: 'Maybelline', productCount: 52 },
];

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function BrandsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const filteredBrands = mockBrands.filter(brand =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (!selectedLetter || brand.name.startsWith(selectedLetter))
  );

  return (
    <div className="pt-20 lg:pt-28 min-h-screen">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'Главная', href: '/' },
              { label: 'Бренды' },
            ]}
          />
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#111827] mb-3">
            Бренды
          </h1>
          <p className="text-base text-[#6B7280]">
            Более 100 премиум брендов косметики и ухода
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Найти бренд..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#EAE6EF] bg-white text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20 focus:border-[#FF4DB8]"
            />
          </div>
        </div>

        {/* Alphabet Index */}
        <div className="mb-8 pb-6 border-b border-[#EAE6EF]">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedLetter(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedLetter === null
                  ? 'bg-[#111827] text-white'
                  : 'bg-gray-50 text-[#6B7280] hover:bg-gray-100'
              }`}
            >
              Все
            </button>
            {alphabet.map((letter) => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedLetter === letter
                    ? 'bg-[#FF4DB8] text-white'
                    : 'bg-gray-50 text-[#6B7280] hover:bg-gray-100'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Popular Brands Section */}
        {!searchQuery && !selectedLetter && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-[#111827] mb-6">
              Популярные бренды
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {mockBrands.slice(0, 8).map((brand) => (
                <BrandCard
                  key={brand.id}
                  name={brand.name}
                  productCount={brand.productCount}
                  onClick={() => navigate(`/brands/${brand.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Brands Grid */}
        {(searchQuery || selectedLetter) && (
          <>
            <h2 className="text-xl font-bold text-[#111827] mb-6">
              {filteredBrands.length} {filteredBrands.length === 1 ? 'бренд' : 'брендов'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredBrands.map((brand) => (
                <BrandCard
                  key={brand.id}
                  name={brand.name}
                  productCount={brand.productCount}
                  onClick={() => navigate(`/brands/${brand.id}`)}
                />
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {filteredBrands.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#6B7280]">Бренды не найдены</p>
          </div>
        )}
      </div>

      {/* Dev Note */}
      <div className="hidden">
        {/* Temporarily mock filtering by brand, later will use dedicated endpoint */}
      </div>
    </div>
  );
}
