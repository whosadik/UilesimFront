import { MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';
import { Link } from 'react-router';

import logoImage from '@/assets/UylesimLogo.png';
import { useI18n } from '../../shared/i18n/LanguageContext';

export function Footer() {
  const { messages } = useI18n();

  return (
    <footer className="border-t border-gray-200 bg-gradient-to-b from-white to-gray-50 pt-16 pb-8">
      <div className="mx-auto max-w-[1160px] px-6 lg:px-[140px]">
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <img src={logoImage} alt="Uilesim" className="h-10 w-10 rounded-full object-contain" />
              <span className="text-lg font-semibold tracking-tight text-[#111827]">Uilesim</span>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-[#6B7280]">{messages.footer.description}</p>

            <div className="flex items-center gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EAE6EF] bg-white text-[#6B7280] transition-all hover:border-[#FF4DB8]/20 hover:bg-gray-50 hover:text-[#FF4DB8]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-900">{messages.footer.catalogTitle}</h4>
            <ul className="space-y-2.5">
              {messages.footer.catalogItems.map((item) => (
                <li key={item}>
                  <Link to="/catalog" className="text-sm text-gray-600 transition-colors hover:text-pink-500">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-900">{messages.footer.infoTitle}</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/about" className="text-sm text-gray-600 transition-colors hover:text-pink-500">
                  {messages.footer.infoLinks.about}
                </Link>
              </li>
              <li>
                <Link
                  to="/delivery-returns"
                  className="text-sm text-gray-600 transition-colors hover:text-pink-500"
                >
                  {messages.footer.infoLinks.deliveryReturns}
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-sm text-gray-600 transition-colors hover:text-pink-500">
                  {messages.footer.infoLinks.help}
                </Link>
              </li>
              <li>
                <Link to="/for-you" className="text-sm text-gray-600 transition-colors hover:text-pink-500">
                  {messages.footer.infoLinks.loyaltyProgram}
                </Link>
              </li>
              <li>
                <Link to="/stores" className="text-sm text-gray-600 transition-colors hover:text-pink-500">
                  {messages.footer.infoLinks.stores}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-900">{messages.footer.contactsTitle}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pink-500" />
                <span className="text-sm text-gray-600">{messages.footer.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-pink-500" />
                <a href="tel:+77172000000" className="text-sm text-gray-600 hover:text-pink-500">
                  +7 (717) 200-00-00
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-pink-500" />
                <a href="mailto:hello@uilesim.kz" className="text-sm text-gray-600 hover:text-pink-500">
                  hello@uilesim.kz
                </a>
              </li>
            </ul>

            <div className="mt-6">
              <h5 className="mb-2 text-sm font-medium text-gray-900">{messages.footer.newsletterTitle}</h5>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder={messages.footer.newsletterPlaceholder}
                  className="flex-1 rounded-lg border border-[#EAE6EF] px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20"
                />
                <button className="rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#0B1220] hover:shadow-md">
                  {messages.footer.newsletterButton}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-8 md:flex-row">
          <p className="text-xs text-gray-500">{messages.footer.copyright}</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-xs text-gray-500 transition-colors hover:text-pink-500">
              {messages.footer.privacy}
            </Link>
            <Link to="/terms" className="text-xs text-gray-500 transition-colors hover:text-pink-500">
              {messages.footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
