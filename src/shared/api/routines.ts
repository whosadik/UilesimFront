import { apiFetch } from "./httpClient";

export type RoutineProductApi = {
  id?: number | string;
  name?: string;
  brand?: string;
  category?: string;
  product_type?: string;
  [k: string]: unknown;
};

export type RoutineStepApi = {
  step?: string;
  status?: string;
  source?: string;
  product?: RoutineProductApi | null;
  why?: unknown[];
  suggestions?: unknown[];
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
  current_product_id?: number | string;
  alternatives?: Array<number | string>;
  [k: string]: unknown;
};

export type RoutineValidateResponseApi = {
  conflicts?: string[];
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
