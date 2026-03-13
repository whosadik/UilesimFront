import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Gift, Mail, Send } from 'lucide-react';
import { toast } from 'sonner';

import { Breadcrumbs } from '../components/Breadcrumbs';
import { Button } from '../components/Button';
import { ApiError } from '../../shared/api/ApiError';
import { createRequestId } from '../../shared/api/httpClient';
import { purchaseGiftCard, type PurchaseGiftCardResponse } from '../../shared/api/giftCards';
import { useAuth } from '../../shared/auth/AuthContext';

const GIFT_CARD_OPTIONS = [
  { value: 1000, label: '1 000 KZT' },
  { value: 3000, label: '3 000 KZT' },
  { value: 5000, label: '5 000 KZT' },
  { value: 10000, label: '10 000 KZT' },
];

const EMAIL_PATTERN = /\S+@\S+\.\S+/;

export default function GiftCardsPage() {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [selectedValue, setSelectedValue] = useState(3000);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [purchaseResult, setPurchaseResult] = useState<PurchaseGiftCardResponse | null>(null);

  const handleSubmit = async () => {
    if (isAuthLoading || isSubmitting) {
      return;
    }

    if (!user) {
      navigate('/login', { state: { from: '/gift-cards' } });
      return;
    }

    const normalizedEmail = recipientEmail.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setSubmitError('Введите корректный email получателя.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await purchaseGiftCard({
        amount: selectedValue,
        recipient_email: normalizedEmail,
        message: message.trim() || undefined,
        idempotency_key: createRequestId(),
        channel: 'online',
      });
      setPurchaseResult(response);
      toast.success('Gift card purchase saved.');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        navigate('/login', { state: { from: '/gift-cards' } });
        return;
      }

      if (error instanceof ApiError && error.code === 'email_not_verified') {
        navigate('/verify-email-pending', { state: { from: '/gift-cards' } });
        return;
      }

      setSubmitError(error instanceof Error ? error.message : 'Failed to purchase gift card.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const snapshot = purchaseResult?.gift_card;

  return (
    <div className="page-with-navbar-offset min-h-screen bg-gray-50">
      <div className="max-w-[920px] mx-auto px-6 py-8 lg:py-12">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Gift cards' }]} />
        </div>

        <div className="mb-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#FFE1F2] to-pink-50 flex items-center justify-center">
            <Gift className="w-8 h-8 text-[#FF4DB8]" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#111827] mb-3">Gift cards</h1>
          <p className="text-base text-[#6B7280] max-w-[560px] mx-auto">
            Digital Uilesim certificates with instant email delivery and partial redemption during checkout.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-8 rounded-2xl bg-white border border-[#EAE6EF] space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-3">Amount</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {GIFT_CARD_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
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

            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-2">Recipient email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6B7280] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(event) => setRecipientEmail(event.target.value)}
                  placeholder="friend@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#EAE6EF] bg-white text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20 focus:border-[#FF4DB8]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-2">Message</label>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Optional note for the recipient"
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-[#EAE6EF] bg-white text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20 focus:border-[#FF4DB8] resize-none"
              />
            </div>

            {submitError && (
              <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B42318]">
                {submitError}
              </div>
            )}

            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Processing...' : 'Buy gift card'}
            </Button>

            {!user && !isAuthLoading && (
              <p className="text-xs text-[#6B7280]">
                Purchase is available after sign in. The page itself stays public.
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-white border border-[#EAE6EF]">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280] mb-3">How it works</p>
              <div className="space-y-3 text-sm text-[#4B5563]">
                <p>1. Choose a fixed amount and the recipient email.</p>
                <p>2. Backend issues a unique gift card code and records a dedicated transaction.</p>
                <p>3. The recipient applies the code in cart during checkout.</p>
                <p>4. The code can be used partially until the balance reaches zero.</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#111827] text-white">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/60 mb-2">Current selection</p>
              <p className="text-4xl font-bold mb-2">{selectedValue.toLocaleString('ru-RU')} KZT</p>
              <p className="text-sm text-white/70">
                This purchase does not create owned products, roadmap progress, or loyalty earnings.
              </p>
            </div>

            {snapshot && (
              <div className="p-6 rounded-2xl bg-white border border-[#EAE6EF]">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280] mb-3">Last purchase</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6B7280]">Transaction</span>
                    <span className="font-semibold text-[#111827]">
                      TXN-{String(purchaseResult?.transaction_id ?? '').padStart(8, '0')}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6B7280]">Recipient</span>
                    <span className="font-semibold text-[#111827]">{snapshot.recipient_email}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6B7280]">Code</span>
                    <span className="font-semibold text-[#111827]">{snapshot.masked_code}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6B7280]">Balance</span>
                    <span className="font-semibold text-[#111827]">
                      {Number(snapshot.remaining_amount).toLocaleString('ru-RU')} KZT
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6B7280]">Email delivery</span>
                    <span className={`font-semibold ${purchaseResult?.email_sent ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {purchaseResult?.email_sent ? 'Sent' : 'Queued'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <Button variant="ghost" onClick={() => navigate('/me/transactions')} className="flex-1">
                    Transactions
                  </Button>
                  <Button variant="primary" onClick={() => navigate('/cart')} className="flex-1">
                    Cart
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
