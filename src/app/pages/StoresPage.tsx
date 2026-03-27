import { Clock, MapPin, Phone } from 'lucide-react';

import { useI18n } from '../../shared/i18n/LanguageContext';
import { Breadcrumbs } from '../components/Breadcrumbs';

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
  const { messages } = useI18n();
  const storesMessages = messages.pages.stores;

  return (
    <div className="page-with-navbar-offset min-h-screen">
      <div className="mx-auto max-w-[1160px] px-6 py-8 lg:px-[140px] lg:py-12">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: messages.common.home, href: '/' }, { label: storesMessages.breadcrumb }]} />
        </div>

        <div className="mb-8">
          <h1 className="mb-3 text-3xl font-bold text-[#111827] lg:text-4xl">{storesMessages.title}</h1>
          <p className="text-base text-[#6B7280]">{storesMessages.subtitle}</p>
        </div>

        <div className="mb-8 overflow-hidden rounded-2xl border border-[#EAE6EF] bg-white">
          <iframe
            title={storesMessages.mapFrameTitle}
            src={`https://www.google.com/maps?q=${encodeURIComponent(stores[0].mapQuery)}&z=16&output=embed`}
            className="h-72 w-full md:h-96"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="flex flex-col gap-3 border-t border-[#EAE6EF] px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#111827]">{storesMessages.mapTitle}</p>
              <p className="text-sm text-[#6B7280]">
                {stores[0].address}, {stores[0].city}
              </p>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stores[0].mapQuery)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-[#111827] px-4 py-2 text-sm font-semibold text-[#111827] transition-colors hover:bg-[#111827] hover:text-white"
            >
              {storesMessages.openInMaps}
            </a>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {stores.map((store) => (
            <div
              key={store.id}
              className="rounded-2xl border border-[#EAE6EF] bg-white p-6 transition-shadow hover:shadow-lg"
            >
              <h3 className="mb-4 text-lg font-bold text-[#111827]">{store.name}</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#FF4DB8]" />
                  <div className="text-sm text-[#6B7280]">
                    {store.address}, {store.city}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#FF4DB8]" />
                  <div className="text-sm text-[#6B7280]">{store.hours}</div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#FF4DB8]" />
                  <a
                    href={`tel:${store.phone.replace(/\s+/g, '')}`}
                    className="text-sm text-[#6B7280] transition-colors hover:text-[#111827]"
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
