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
import { useI18n } from '../../shared/i18n/LanguageContext';

const GIFT_CARD_OPTIONS = [
  { value: 1000, label: '1 000 ₸' },
  { value: 3000, label: '3 000 ₸' },
  { value: 5000, label: '5 000 ₸' },
  { value: 10000, label: '10 000 ₸' },
];

const EMAIL_PATTERN = /\S+@\S+\.\S+/;

const giftCardsPageCopy = {
  ru: {
    invalidEmail: 'Введите корректный email получателя.',
    success: 'Подарочная карта успешно оформлена.',
    purchaseError: 'Не удалось купить подарочную карту.',
    title: 'Подарочные карты',
    subtitle: 'Цифровые сертификаты Uilesim с мгновенной отправкой на email и возможностью частичного списания при оформлении заказа.',
    amount: 'Номинал',
    recipientEmail: 'Email получателя',
    message: 'Сообщение',
    messagePlaceholder: 'Необязательное сообщение для получателя',
    submitting: 'Оформляем...',
    buy: 'Купить подарочную карту',
    loginRequired: 'Покупка доступна после входа в аккаунт. Страница остаётся публичной.',
    howItWorks: 'Как это работает',
    steps: [
      '1. Выберите номинал и email получателя.',
      '2. Система выпустит уникальный код подарочной карты и создаст отдельную транзакцию.',
      '3. Получатель применит код в корзине при оформлении заказа.',
      '4. Код можно использовать частями, пока баланс карты не станет нулевым.',
    ],
    currentChoice: 'Текущий выбор',
    choiceDescription: 'Эта покупка не добавляет товары в раздел приобретённых, не продвигает roadmap и не начисляет баллы лояльности.',
    lastPurchase: 'Последняя покупка',
    transaction: 'Транзакция',
    recipient: 'Получатель',
    code: 'Код',
    balance: 'Баланс',
    emailStatus: 'Отправка на email',
    sent: 'Отправлено',
    queued: 'В очереди',
    transactions: 'Транзакции',
    cart: 'Корзина',
  },
  kk: {
    invalidEmail: 'Алушының email мекенжайын дұрыс енгізіңіз.',
    success: 'Сыйлық картасы сәтті рәсімделді.',
    purchaseError: 'Сыйлық картасын сатып алу мүмкін болмады.',
    title: 'Сыйлық карталары',
    subtitle: 'Email-ге бірден жіберілетін және тапсырыс кезінде бөліп қолдануға болатын Uilesim цифрлық сертификаттары.',
    amount: 'Номинал',
    recipientEmail: 'Алушының email-і',
    message: 'Хабарлама',
    messagePlaceholder: 'Алушыға арналған міндетті емес хабарлама',
    submitting: 'Рәсімдеп жатырмыз...',
    buy: 'Сыйлық картасын сатып алу',
    loginRequired: 'Сатып алу аккаунтқа кіргеннен кейін қолжетімді. Бет ашық күйінде қалады.',
    howItWorks: 'Қалай жұмыс істейді',
    steps: [
      '1. Номинал мен алушының email адресін таңдаңыз.',
      '2. Жүйе сыйлық картасының бірегей кодын жасап, бөлек транзакция құрады.',
      '3. Алушы кодты тапсырыс рәсімдеу кезінде себетте қолданады.',
      '4. Карта балансы нөлге жеткенше кодты бөліп пайдалануға болады.',
    ],
    currentChoice: 'Ағымдағы таңдау',
    choiceDescription: 'Бұл сатып алу алынған тауарлар бөліміне қоспайды, roadmap-ты жылжытпайды және лоялдылық ұпайларын қоспайды.',
    lastPurchase: 'Соңғы сатып алу',
    transaction: 'Транзакция',
    recipient: 'Алушы',
    code: 'Код',
    balance: 'Баланс',
    emailStatus: 'Email-ге жіберу',
    sent: 'Жіберілді',
    queued: 'Кезекте',
    transactions: 'Транзакциялар',
    cart: 'Себет',
  },
  en: {
    invalidEmail: 'Enter a valid recipient email.',
    success: 'Gift card purchased successfully.',
    purchaseError: 'Could not purchase the gift card.',
    title: 'Gift cards',
    subtitle: 'Uilesim digital certificates with instant email delivery and partial redemption during checkout.',
    amount: 'Amount',
    recipientEmail: 'Recipient email',
    message: 'Message',
    messagePlaceholder: 'Optional message for the recipient',
    submitting: 'Processing...',
    buy: 'Buy gift card',
    loginRequired: 'Purchase is available after sign in. The page remains public.',
    howItWorks: 'How it works',
    steps: [
      '1. Choose an amount and the recipient email.',
      '2. The system issues a unique gift card code and creates a separate transaction.',
      '3. The recipient applies the code in the cart during checkout.',
      '4. The code can be used in parts until the card balance reaches zero.',
    ],
    currentChoice: 'Current choice',
    choiceDescription: 'This purchase does not add products to owned items, does not advance the roadmap, and does not grant loyalty points.',
    lastPurchase: 'Latest purchase',
    transaction: 'Transaction',
    recipient: 'Recipient',
    code: 'Code',
    balance: 'Balance',
    emailStatus: 'Email delivery',
    sent: 'Sent',
    queued: 'Queued',
    transactions: 'Transactions',
    cart: 'Cart',
  },
} as const;

export default function GiftCardsPage() {
  const { language, messages } = useI18n();
  const copy = giftCardsPageCopy[language];
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
      setSubmitError(copy.invalidEmail);
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
      toast.success(copy.success);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        navigate('/login', { state: { from: '/gift-cards' } });
        return;
      }

      if (error instanceof ApiError && error.code === 'email_not_verified') {
        navigate('/verify-email-pending', { state: { from: '/gift-cards' } });
        return;
      }

      setSubmitError(error instanceof Error ? error.message : copy.purchaseError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const snapshot = purchaseResult?.gift_card;

  return (
    <div className="page-with-navbar-offset min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[920px] px-6 py-8 lg:py-12">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: messages.common.home, href: '/' }, { label: copy.title }]} />
        </div>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFE1F2] to-pink-50">
            <Gift className="h-8 w-8 text-[#FF4DB8]" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-[#111827] lg:text-4xl">{copy.title}</h1>
          <p className="mx-auto max-w-[560px] text-base text-[#6B7280]">
            {copy.subtitle}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6 rounded-2xl border border-[#EAE6EF] bg-white p-8">
            <div>
              <label className="mb-3 block text-sm font-semibold text-[#111827]">{copy.amount}</label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {GIFT_CARD_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedValue(option.value)}
                    className={`rounded-xl border-2 p-4 font-semibold transition-all ${
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
              <label className="mb-2 block text-sm font-semibold text-[#111827]">{copy.recipientEmail}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(event) => setRecipientEmail(event.target.value)}
                  placeholder="friend@example.com"
                  className="w-full rounded-xl border border-[#EAE6EF] bg-white py-3 pl-11 pr-4 text-sm text-[#111827] placeholder:text-[#6B7280] focus:border-[#FF4DB8] focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#111827]">{copy.message}</label>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={copy.messagePlaceholder}
                rows={4}
                className="w-full resize-none rounded-xl border border-[#EAE6EF] bg-white px-4 py-3 text-sm text-[#111827] placeholder:text-[#6B7280] focus:border-[#FF4DB8] focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20"
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
              className="flex w-full items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? copy.submitting : copy.buy}
            </Button>

            {!user && !isAuthLoading && (
              <p className="text-xs text-[#6B7280]">{copy.loginRequired}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-[#EAE6EF] bg-white p-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">{copy.howItWorks}</p>
              <div className="space-y-3 text-sm text-[#4B5563]">
                {copy.steps.map((step) => (
                  <p key={step}>{step}</p>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[#111827] p-6 text-white">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/60">{copy.currentChoice}</p>
              <p className="mb-2 text-4xl font-bold">{selectedValue.toLocaleString('ru-RU')} ₸</p>
              <p className="text-sm text-white/70">
                {copy.choiceDescription}
              </p>
            </div>

            {snapshot && (
              <div className="rounded-2xl border border-[#EAE6EF] bg-white p-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">{copy.lastPurchase}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6B7280]">{copy.transaction}</span>
                    <span className="font-semibold text-[#111827]">
                      TXN-{String(purchaseResult?.transaction_id ?? '').padStart(8, '0')}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6B7280]">{copy.recipient}</span>
                    <span className="font-semibold text-[#111827]">{snapshot.recipient_email}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6B7280]">{copy.code}</span>
                    <span className="font-semibold text-[#111827]">{snapshot.masked_code}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6B7280]">{copy.balance}</span>
                    <span className="font-semibold text-[#111827]">
                      {Number(snapshot.remaining_amount).toLocaleString('ru-RU')} ₸
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6B7280]">{copy.emailStatus}</span>
                    <span className={`font-semibold ${purchaseResult?.email_sent ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {purchaseResult?.email_sent ? copy.sent : copy.queued}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <Button variant="ghost" onClick={() => navigate('/me/transactions')} className="flex-1">
                    {copy.transactions}
                  </Button>
                  <Button variant="primary" onClick={() => navigate('/cart')} className="flex-1">
                    {copy.cart}
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
