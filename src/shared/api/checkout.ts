import { apiFetch } from './httpClient';

export type CheckoutItem = { product: number; quantity: number };

export type CheckoutBase = {
  channel?: string;
  items: CheckoutItem[];
  apply_assignment_id?: number;
  redeem_points?: number;
};

export type CheckoutPreviewRequest = CheckoutBase;

export type CheckoutCommitRequest = CheckoutBase & { idempotency_key: string };

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
