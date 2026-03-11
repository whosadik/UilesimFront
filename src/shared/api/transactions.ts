import { apiFetch } from './httpClient';

const ENDPOINT = '/api/transactions/';

export type TransactionProductSummary = {
  id: number;
  name?: string;
  brand?: string;
  price?: string | number;
  currency?: string;
  category?: string;
  product_type?: string;
  in_stock?: boolean;
  image_url?: string;
  image_urls?: string[];
  points_earned?: number;
  [k: string]: unknown;
};

export type Transaction = {
  id: number;
  created_at?: string;
  total_amount?: string | number;
  gross_total?: string | number;
  discount_amount?: string | number;
  net_total?: string | number;
  amount?: string | number;
  points_earned?: number;
  points_redeemed?: number;
  points_change?: number;
  type?: string;
  transaction_id?: string;
  description?: string;
  status?: string;
  tier_after?: string;
  new_tier?: string;
  tier_upgraded?: boolean;
  new_balance?: number;
  channel?: string;
  offer_applied?: boolean;
  offer_assignment_id?: number | null;
  target?: Record<string, unknown> | null;
  eligible_total?: string | number;
  next_offer?: unknown;
  items?: TransactionItem[];
  [k: string]: unknown;
};

export type TransactionItem = {
  product?: number | string;
  quantity?: number;
  unit_price?: string | number;
  product_summary?: TransactionProductSummary;
  [k: string]: unknown;
};

type ListTransactionsParams = {
  page?: number;
  page_size?: number;
  ordering?: string;
};

type ListTransactionsResponse =
  | Transaction[]
  | {
      ok?: boolean;
      results?: Transaction[];
      transactions?: Transaction[];
      [k: string]: unknown;
    };

export async function listTransactions(params?: ListTransactionsParams): Promise<Transaction[]> {
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

  const response = await apiFetch<ListTransactionsResponse>(path, {
    method: 'GET',
    skipCsrf: true,
  });

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.results)) {
    return response.results;
  }

  if (Array.isArray(response.transactions)) {
    return response.transactions;
  }

  return [];
}

export const listMyTransactions = listTransactions;

export function getTransactionById(id: string | number): Promise<Transaction> {
  return apiFetch<Transaction>(`${ENDPOINT}${id}/`, {
    method: 'GET',
    skipCsrf: true,
  });
}
