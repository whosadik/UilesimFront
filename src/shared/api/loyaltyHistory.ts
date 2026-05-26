import { apiFetch } from './httpClient';

const ENDPOINT = '/api/me/loyalty/history';

export type LoyaltyLedgerEntryType = 'earn' | 'redeem' | 'adjust';

export type LoyaltyLedgerKind =
  | 'profile_completion'
  | 'roadmap_step'
  | 'txn_earn'
  | 'txn_redeem'
  | 'manual_redeem'
  | 'offer'
  | 'gift_card'
  | 'adjust'
  | 'earn'
  | 'redeem';

export type LoyaltyLedgerEntry = {
  id: number;
  entry_type: LoyaltyLedgerEntryType;
  points_delta: number;
  reference: string;
  kind: LoyaltyLedgerKind;
  description: string;
  transaction_id?: number | null;
  meta?: Record<string, unknown> | null;
  created_at: string;
};

type LedgerListParams = {
  page?: number;
  page_size?: number;
  entry_type?: LoyaltyLedgerEntryType;
};

type LedgerListResponse = {
  ok?: boolean;
  points_balance?: number;
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: LoyaltyLedgerEntry[];
};

export type LoyaltyHistoryResult = {
  entries: LoyaltyLedgerEntry[];
  points_balance: number;
  count: number;
  hasNext: boolean;
};

export async function listLoyaltyHistory(params?: LedgerListParams): Promise<LoyaltyHistoryResult> {
  const query = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, String(value));
      }
    }
  }

  const queryString = query.toString();
  const path = queryString ? `${ENDPOINT}?${queryString}` : ENDPOINT;

  const response = await apiFetch<LedgerListResponse>(path, {
    method: 'GET',
    skipCsrf: true,
  });

  const entries = Array.isArray(response?.results) ? response!.results! : [];
  return {
    entries,
    points_balance: typeof response?.points_balance === 'number' ? response.points_balance : 0,
    count: typeof response?.count === 'number' ? response.count : entries.length,
    hasNext: Boolean(response?.next),
  };
}
