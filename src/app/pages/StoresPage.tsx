import { Breadcrumbs } from '../components/Breadcrumbs';
import { MapPin, Clock, Phone } from 'lucide-react';

const stores = [
  { id: '1', name: 'Uilesim Москва Центр', address: 'ул. Тверская, 12', city: 'Москва', hours: '10:00 - 22:00', phone: '+7 (495) 123-45-67' },
  { id: '2', name: 'Uilesim Санкт-Петербург', address: 'Невский пр., 45', city: 'Санкт-Петербург', hours: '10:00 - 22:00', phone: '+7 (812) 234-56-78' },
];

export default function StoresPage() {
  return (
    <div className="pt-20 lg:pt-28 min-h-screen">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Магазины' }]} />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#111827] mb-3">Наши магазины</h1>
          <p className="text-base text-[#6B7280]">Найдите ближайший магазин Uilesim</p>
        </div>

        {/* Map Placeholder */}
        <div className="mb-8 h-64 rounded-2xl bg-gray-100 border border-[#EAE6EF] flex items-center justify-center">
          <p className="text-[#6B7280]">Карта (placeholder)</p>
        </div>

        {/* Stores List */}
        <div className="grid md:grid-cols-2 gap-6">
          {stores.map((store) => (
            <div key={store.id} className="p-6 rounded-2xl bg-white border border-[#EAE6EF] hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-bold text-[#111827] mb-4">{store.name}</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#FF4DB8] flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-[#6B7280]">{store.address}, {store.city}</div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#FF4DB8] flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-[#6B7280]">{store.hours}</div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#FF4DB8] flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-[#6B7280]">{store.phone}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
