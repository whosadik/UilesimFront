import { Breadcrumbs } from '../components/Breadcrumbs';
import { Button } from '../components/Button';
import { Gift } from 'lucide-react';
import { useState } from 'react';

const giftCardOptions = [
  { value: 1000, label: '1 000 ₸' },
  { value: 3000, label: '3 000 ₸' },
  { value: 5000, label: '5 000 ₸' },
  { value: 10000, label: '10 000 ₸' },
];

export default function GiftCardsPage() {
  const [selectedValue, setSelectedValue] = useState(3000);
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');

  return (
    <div className="pt-20 lg:pt-28 min-h-screen">
      <div className="max-w-[900px] mx-auto px-6 py-8 lg:py-12">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Подарочные карты' }]} />
        </div>

        <div className="mb-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#FFE1F2] to-pink-50 flex items-center justify-center">
            <Gift className="w-8 h-8 text-[#FF4DB8]" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#111827] mb-3">Подарочные карты</h1>
          <p className="text-base text-[#6B7280]">Идеальный подарок для ценителей красоты</p>
        </div>

        <div className="p-8 rounded-2xl bg-white border border-[#EAE6EF] space-y-6">
          {/* Amount Selection */}
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-3">Номинал</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {giftCardOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedValue(option.value)}
                  className={`p-4 rounded-xl border-2 font-semibold transition-all ${
                    selectedValue === option.value
                      ? 'border-[#FF4DB8] bg-[#FFE1F2] text-[#FF4DB8]'
                      : 'border-[#EAE6EF] bg-white text-[#6B7280] hover:border-[#FF4DB8]/30'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2">Email получателя</label>
            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="example@email.com"
              className="w-full px-4 py-3 rounded-xl border border-[#EAE6EF] bg-white text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20 focus:border-[#FF4DB8]"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2">Сообщение (опционально)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ваше поздравление..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[#EAE6EF] bg-white text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20 focus:border-[#FF4DB8] resize-none"
            />
          </div>

          {/* CTA */}
          <Button variant="primary" className="w-full">
            Купить подарочную карту
          </Button>
        </div>
      </div>
    </div>
  );
}
