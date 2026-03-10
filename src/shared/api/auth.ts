import { apiFetch } from './httpClient';

export interface AuthUser {
  id: number;
  username: string;
  role?: string | null;
  staff_role?: string | null;
  roles?: string[] | null;
  is_admin?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export function csrf(): Promise<{ ok: boolean; csrfToken: string }> {
  return apiFetch('/api/auth/csrf', {
    method: 'GET',
    skipCsrf: true,
  });
}

export function login(
  username: string,
  password: string,
): Promise<{ ok: boolean; user: AuthUser }> {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function me(): Promise<{ ok: boolean; user: AuthUser }> {
  return apiFetch('/api/auth/me', {
    method: 'GET',
    skipCsrf: true,
  });
}

export function logout(): Promise<{ ok: boolean }> {
  return apiFetch('/api/auth/logout', {
    method: 'POST',
  });
}
