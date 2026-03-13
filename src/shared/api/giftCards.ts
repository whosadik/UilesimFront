import { apiFetch } from './httpClient';

export type GiftCardSnapshot = {
  id: number;
  masked_code: string;
  recipient_email: string;
  amount: string | number;
  remaining_amount: string | number;
  applied_amount?: string | number;
  balance_before?: string | number;
  balance_after?: string | number;
  currency?: string;
  status?: string;
  expires_at?: string | null;
  sent_at?: string | null;
  [k: string]: unknown;
};

export type PurchaseGiftCardRequest = {
  amount: number;
  recipient_email: string;
  message?: string;
  idempotency_key: string;
  channel?: string;
};

export type PurchaseGiftCardResponse = {
  ok: boolean;
  idempotent_replay?: boolean;
  transaction_id: number;
  gross_total: string | number;
  discount_amount: string | number;
  net_total: string | number;
  gift_card: GiftCardSnapshot;
  email_sent: boolean;
  new_balance?: number;
  [k: string]: unknown;
};

export type SentGiftCardItem = {
  id: number;
  recipient_email: string;
  message?: string;
  status?: string;
  created_at?: string;
  snapshot: GiftCardSnapshot;
  [k: string]: unknown;
};

export type SentGiftCardsResponse = {
  ok: boolean;
  count: number;
  items: SentGiftCardItem[];
};

export type ReceivedGiftCardItem = {
  id: number;
  message?: string;
  status?: string;
  created_at?: string;
  sender_name?: string;
  sender_email?: string;
  code?: string;
  snapshot: GiftCardSnapshot;
  [k: string]: unknown;
};

export type ReceivedGiftCardsResponse = {
  ok: boolean;
  count: number;
  items: ReceivedGiftCardItem[];
};

export function purchaseGiftCard(payload: PurchaseGiftCardRequest) {
  return apiFetch<PurchaseGiftCardResponse>('/api/gift-cards/purchase', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function listSentGiftCards() {
  return apiFetch<SentGiftCardsResponse>('/api/me/gift-cards/sent', {
    method: 'GET',
    skipCsrf: true,
  });
}

export function listReceivedGiftCards() {
  return apiFetch<ReceivedGiftCardsResponse>('/api/me/gift-cards/received', {
    method: 'GET',
    skipCsrf: true,
  });
}
