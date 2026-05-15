import { apiFetch } from './httpClient';

export type Profile = Record<string, unknown> & {
  id?: number;
  first_name?: string;
  last_name?: string;
  phone?: string;
  city?: string;
};

export type ProfileTaxonomyOption = {
  value: string;
  label: string;
  aliases?: string[];
};

export type ProfileTaxonomyBudgetOption = ProfileTaxonomyOption & {
  min?: number | null;
  max?: number | null;
  currency?: string | null;
};

export type ProfileTaxonomyStep = {
  id: number;
  key: string;
  title: string;
  description: string;
  optional?: boolean;
};

export type ProfileTaxonomy = {
  steps: ProfileTaxonomyStep[];
  skin_types: ProfileTaxonomyOption[];
  goals: ProfileTaxonomyOption[];
  avoid_flags: ProfileTaxonomyOption[];
  budget_options: ProfileTaxonomyBudgetOption[];
  hair_types: ProfileTaxonomyOption[];
  hair_concerns: ProfileTaxonomyOption[];
  coverage_options: ProfileTaxonomyOption[];
  fragrance_notes: ProfileTaxonomyOption[];
  intensity_options: ProfileTaxonomyOption[];
};

export type Loyalty = {
  tier: string | null;
  points_balance: number;
  spend_90d: number;
  next_tier: string | null;
  next_tier_threshold: number | null;
};

export type FavoriteCategoryExplain = {
  window_start?: string | null;
  window_end?: string | null;
  history_items_considered?: number | string | null;
  picked_by?: string | null;
  signals?: unknown;
};

export type FavoriteCategory = {
  ok?: boolean;
  favorite_category?: string | null;
  window_days?: number | string | null;
  products_bought?: number | string | null;
  total_spent?: number | string | null;
  currency?: string | null;
  profile_complete?: boolean;
  explain?: FavoriteCategoryExplain | null;
  [key: string]: unknown;
};

type UpdateProfileResponse =
  | Profile
  | {
      ok?: boolean;
      profile?: Profile;
      profile_completion_bonus?: unknown;
    };

export function getProfile(): Promise<Profile> {
  return apiFetch<Profile>('/api/me/profile', {
    method: 'GET',
    skipCsrf: true,
  });
}

export async function updateProfile(payload: Profile): Promise<UpdateProfileResponse> {
  return apiFetch<UpdateProfileResponse>('/api/me/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function getLoyalty(): Promise<Loyalty> {
  return apiFetch<Loyalty>('/api/me/loyalty', {
    method: 'GET',
    skipCsrf: true,
  });
}

export function getFavoriteCategory(): Promise<FavoriteCategory> {
  return apiFetch<FavoriteCategory>('/api/me/favorite-category', {
    method: 'GET',
    skipCsrf: true,
  });
}

type ProfileTaxonomyResponse =
  | ProfileTaxonomy
  | {
      ok?: boolean;
      taxonomy?: ProfileTaxonomy;
    };

export async function getProfileTaxonomy(): Promise<ProfileTaxonomy> {
  const response = await apiFetch<ProfileTaxonomyResponse>('/api/me/profile-taxonomy', {
    method: 'GET',
    skipCsrf: true,
  });

  if (response && typeof response === 'object' && 'taxonomy' in response && response.taxonomy) {
    return response.taxonomy;
  }

  return response as ProfileTaxonomy;
}
