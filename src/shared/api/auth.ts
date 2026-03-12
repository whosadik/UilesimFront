import { apiFetch } from './httpClient';

export interface AuthUser {
  id: number;
  username: string;
  email?: string | null;
  email_verified?: boolean;
  role?: string | null;
  staff_role?: string | null;
  roles?: string[] | null;
  is_admin?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export interface AuthRegisterResponse {
  ok: boolean;
  user: AuthUser;
  verification_email: string;
  verification_email_sent: boolean;
  resend_available_in_seconds: number;
}

export interface AuthVerifyEmailResponse {
  ok: boolean;
  email: string;
  email_verified: boolean;
  already_verified: boolean;
  message: string;
}

export interface AuthResendVerificationResponse {
  ok: boolean;
  email: string;
  sent: boolean;
  already_verified: boolean;
  message: string;
  resend_available_in_seconds: number;
}

export interface AuthVerificationStatusResponse {
  ok: boolean;
  email: string;
  email_verified: boolean;
  resend_available_in_seconds: number;
}

export interface AuthPasswordResetRequestResponse {
  ok: boolean;
  email: string;
  sent: boolean;
  message: string;
}

export interface AuthPasswordResetValidateResponse {
  ok: boolean;
  valid: boolean;
  message: string;
}

export interface AuthPasswordResetConfirmResponse {
  ok: boolean;
  message: string;
}

export function csrf(): Promise<{ ok: boolean; csrfToken: string }> {
  return apiFetch('/api/auth/csrf', {
    method: 'GET',
    skipCsrf: true,
  });
}

export function login(
  email: string,
  password: string,
): Promise<{ ok: boolean; user: AuthUser }> {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function register(
  email: string,
  password: string,
  passwordConfirm: string,
): Promise<AuthRegisterResponse> {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      password_confirm: passwordConfirm,
    }),
  });
}

export function verifyEmail(token: string): Promise<AuthVerifyEmailResponse> {
  return apiFetch('/api/auth/verify-email', {
    method: 'POST',
    skipCsrf: true,
    body: JSON.stringify({ token }),
  });
}

export function resendVerificationEmail(): Promise<AuthResendVerificationResponse> {
  return apiFetch('/api/auth/verify-email/resend', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function getVerificationStatus(): Promise<AuthVerificationStatusResponse> {
  return apiFetch('/api/auth/verification-status', {
    method: 'GET',
    skipCsrf: true,
  });
}

export function requestPasswordReset(email: string): Promise<AuthPasswordResetRequestResponse> {
  return apiFetch('/api/auth/password-reset/request', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function validatePasswordResetLink(
  uid: string,
  token: string,
): Promise<AuthPasswordResetValidateResponse> {
  return apiFetch('/api/auth/password-reset/validate', {
    method: 'POST',
    skipCsrf: true,
    body: JSON.stringify({ uid, token }),
  });
}

export function confirmPasswordReset(
  uid: string,
  token: string,
  password: string,
  passwordConfirm: string,
): Promise<AuthPasswordResetConfirmResponse> {
  return apiFetch('/api/auth/password-reset/confirm', {
    method: 'POST',
    skipCsrf: true,
    body: JSON.stringify({
      uid,
      token,
      password,
      password_confirm: passwordConfirm,
    }),
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
