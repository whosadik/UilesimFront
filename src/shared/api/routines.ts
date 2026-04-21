import { apiFetch } from "./httpClient";

export type RoutineProductApi = {
  id?: number | string;
  name?: string;
  brand?: string;
  category?: string;
  product_type?: string;
  image_url?: string | null;
  image_urls?: string[] | null;
  description?: string;
  application_text?: string;
  [k: string]: unknown;
};

export type RoutineStepApi = {
  step?: string;
  status?: string;
  source?: string;
  product?: RoutineProductApi | null;
  why?: unknown[];
  suggestions?: unknown[];
  display_step?: string;
  duration_label?: string;
  note?: string;
  [k: string]: unknown;
};

export type RoutineGenerateResponseApi = {
  am?: RoutineStepApi[];
  pm?: RoutineStepApi[];
  notes?: string[];
  [k: string]: unknown;
};

export type RoutineValidateSuggestionApi = {
  step?: string;
  display_step?: string;
  current_product_id?: number | string;
  current_product?: RoutineProductApi | null;
  alternatives?: Array<number | string>;
  alternative_products?: RoutineProductApi[];
  [k: string]: unknown;
};

export type RoutineValidateConflictApi =
  | string
  | {
      message?: string;
      [k: string]: unknown;
    };

export type RoutineValidateResponseApi = {
  conflicts?: RoutineValidateConflictApi[];
  suggestions?: RoutineValidateSuggestionApi[];
  is_valid?: boolean;
  [k: string]: unknown;
};

export type GenerateRoutinePayload = {
  use_owned?: boolean;
};

export type RoutineValidateItemPayload = {
  step: string;
  product_id?: number;
};

export type ValidateRoutinePayload = {
  am: RoutineValidateItemPayload[];
  pm: RoutineValidateItemPayload[];
};

export function generateRoutine(payload: GenerateRoutinePayload = {}): Promise<RoutineGenerateResponseApi> {
  return apiFetch<RoutineGenerateResponseApi>("/api/routine/generate", {
    method: "POST",
    body: JSON.stringify({
      use_owned: payload.use_owned ?? true,
    }),
  });
}

export function validateRoutine(payload: ValidateRoutinePayload): Promise<RoutineValidateResponseApi> {
  return apiFetch<RoutineValidateResponseApi>("/api/routine/validate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type SavedRoutineResponseApi = {
  routine: RoutineGenerateResponseApi | null;
  updated_at: string | null;
};

export function getSavedRoutine(): Promise<SavedRoutineResponseApi> {
  return apiFetch<SavedRoutineResponseApi>("/api/routine/saved", { method: "GET" });
}

export type SaveRoutineItemPayload = {
  step: string;
  product_id?: number | null;
};

export type SaveRoutinePayload = {
  am: SaveRoutineItemPayload[];
  pm: SaveRoutineItemPayload[];
  notes?: string[];
};

export function saveRoutine(payload: SaveRoutinePayload): Promise<SavedRoutineResponseApi> {
  return apiFetch<SavedRoutineResponseApi>("/api/routine/saved", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteSavedRoutine(): Promise<void> {
  return apiFetch<void>("/api/routine/saved", { method: "DELETE" });
}

export type RoutineHistoryItemApi = {
  id: number;
  created_at: string;
  missing_steps: string[];
  profile_skin_type: string;
  routine: RoutineGenerateResponseApi | null;
};

export type RoutineHistoryResponseApi = {
  items: RoutineHistoryItemApi[];
};

export function getRoutineHistory(): Promise<RoutineHistoryResponseApi> {
  return apiFetch<RoutineHistoryResponseApi>("/api/routine/history", { method: "GET" });
}
