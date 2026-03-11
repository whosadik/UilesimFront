import { apiFetch } from './httpClient';
import type { Transaction } from './transactions';

export type CheckoutItem = { product: number; quantity: number };

export type CheckoutBase = {
  channel?: string;
  items: CheckoutItem[];
  apply_assignment_id?: number;
  redeem_points?: number;
};

export type CheckoutPreviewRequest = CheckoutBase;

export type CheckoutCommitRequest = CheckoutBase & { idempotency_key: string };
export type CheckoutSnapshot = Transaction & {
  ok?: boolean;
  next_offer?: unknown;
};

type LastCheckoutResponse =
  | CheckoutSnapshot
  | {
      ok?: boolean;
      checkout?: CheckoutSnapshot | null;
      [k: string]: unknown;
    };

export function preview(req: CheckoutPreviewRequest) {
  return apiFetch('/api/checkout/preview', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export function commit(req: CheckoutCommitRequest) {
  return apiFetch('/api/checkout', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function getLastCheckout(): Promise<CheckoutSnapshot | null> {
  const response = await apiFetch<LastCheckoutResponse>('/api/checkout/last', {
    method: 'GET',
    skipCsrf: true,
  });

  if (response && typeof response === 'object' && 'checkout' in response) {
    return response.checkout ?? null;
  }

  return response ?? null;
}
