import { Breadcrumbs } from '../components/Breadcrumbs';
import { MapPin, Clock, Phone } from 'lucide-react';

const stores = [
  {
    id: '1',
    name: 'Uilesim Mega Silkway',
    address: 'пр. Кабанбай Батыра, 62, ТРЦ Mega Silkway',
    city: 'Астана',
    hours: '10:00 - 22:00',
    phone: '8 705 318 7996',
    mapQuery: 'MEGA Silk Way, 62 Qabanbay Batyr Ave, Astana, Kazakhstan',
  },
];

export default function StoresPage() {
  return (
    <div className="page-with-navbar-offset min-h-screen">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Магазины' }]} />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#111827] mb-3">Наши магазины</h1>
          <p className="text-base text-[#6B7280]">Найдите ближайший магазин Uilesim</p>
        </div>

        {/* Store Map */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-[#EAE6EF] bg-white">
          <iframe
            title="Uilesim Mega Silkway map"
            src={`https://www.google.com/maps?q=${encodeURIComponent(stores[0].mapQuery)}&z=16&output=embed`}
            className="h-72 w-full md:h-96"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="flex flex-col gap-3 border-t border-[#EAE6EF] px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#111827]">Карта магазина</p>
              <p className="text-sm text-[#6B7280]">{stores[0].address}, {stores[0].city}</p>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stores[0].mapQuery)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-[#111827] px-4 py-2 text-sm font-semibold text-[#111827] transition-colors hover:bg-[#111827] hover:text-white"
            >
              Открыть в Maps
            </a>
          </div>
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
                  <a
                    href={`tel:${store.phone.replace(/\s+/g, '')}`}
                    className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
                  >
                    {store.phone}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
