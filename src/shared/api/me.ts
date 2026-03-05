import { apiFetch } from './httpClient';

export type Profile = Record<string, unknown> & { id?: number };

export type Loyalty = {
  tier: string | null;
  points_balance: number;
};

export type FavoriteCategory = Record<string, unknown>;

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
