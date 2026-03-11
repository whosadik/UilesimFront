const PENDING_EMAIL_KEY = 'pending_verification_email';
const RESEND_AVAILABLE_AT_KEY = 'pending_verification_resend_available_at';

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function savePendingVerificationEmail(email: string, cooldownSeconds = 0): void {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(PENDING_EMAIL_KEY, email);
  if (cooldownSeconds > 0) {
    const availableAt = Date.now() + cooldownSeconds * 1000;
    window.localStorage.setItem(RESEND_AVAILABLE_AT_KEY, String(availableAt));
  }
}

export function readPendingVerificationEmail(): string | null {
  if (!hasStorage()) {
    return null;
  }
  return window.localStorage.getItem(PENDING_EMAIL_KEY);
}

export function readPendingVerificationCooldownSeconds(): number {
  if (!hasStorage()) {
    return 0;
  }

  const rawValue = window.localStorage.getItem(RESEND_AVAILABLE_AT_KEY);
  if (!rawValue) {
    return 0;
  }

  const availableAt = Number(rawValue);
  if (!Number.isFinite(availableAt)) {
    return 0;
  }

  return Math.max(0, Math.ceil((availableAt - Date.now()) / 1000));
}

export function updatePendingVerificationCooldownSeconds(cooldownSeconds: number): void {
  if (!hasStorage()) {
    return;
  }

  if (cooldownSeconds <= 0) {
    window.localStorage.removeItem(RESEND_AVAILABLE_AT_KEY);
    return;
  }

  const availableAt = Date.now() + cooldownSeconds * 1000;
  window.localStorage.setItem(RESEND_AVAILABLE_AT_KEY, String(availableAt));
}

export function clearPendingVerificationState(): void {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.removeItem(PENDING_EMAIL_KEY);
  window.localStorage.removeItem(RESEND_AVAILABLE_AT_KEY);
}
