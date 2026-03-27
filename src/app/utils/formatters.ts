type SupportedLocale = 'ru-RU' | 'kk-KZ' | 'en-US';

const localeCopy = {
  ru: {
    prefixUntil: 'до',
    expiresIn: 'истекает через',
    expired: 'истекло',
  },
  kk: {
    prefixUntil: 'дейін',
    expiresIn: 'мерзімі',
    expired: 'мерзімі өтті',
  },
  en: {
    prefixUntil: 'until',
    expiresIn: 'expires in',
    expired: 'expired',
  },
} as const;

function resolveLocale(locale?: string): SupportedLocale {
  if (locale === 'kk-KZ' || locale === 'en-US') {
    return locale;
  }
  return 'ru-RU';
}

function resolveLanguage(locale?: string): keyof typeof localeCopy {
  const normalized = resolveLocale(locale);
  if (normalized === 'kk-KZ') return 'kk';
  if (normalized === 'en-US') return 'en';
  return 'ru';
}

function toDate(value: Date | string): Date {
  return typeof value === 'string' ? new Date(value) : value;
}

function formatUnit(locale: SupportedLocale, value: number, unit: Intl.RelativeTimeFormatUnit): string {
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'always' });
  return formatter.format(value, unit).replace(/^[+-]\s?/, '');
}

export function formatMoney(amount: number | string, locale: string = 'ru-RU'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (!Number.isFinite(numAmount)) {
    return `0 ₸`;
  }

  return `${Math.round(numAmount).toLocaleString(resolveLocale(locale))} ₸`;
}

export function formatDiscount(percent: number): string {
  return `−${percent}%`;
}

export function formatShortDate(date: Date | string, locale: string = 'ru-RU'): string {
  const d = toDate(date);
  return new Intl.DateTimeFormat(resolveLocale(locale), {
    day: 'numeric',
    month: 'short',
  }).format(d).replace(/\.$/, '');
}

export function formatDateWithTime(
  date: Date | string,
  prefix = 'до',
  locale: string = 'ru-RU',
): string {
  const d = toDate(date);
  const shortDate = formatShortDate(d, locale);
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');

  return `${prefix} ${shortDate}, ${hours}:${minutes}`;
}

export function formatCountdown(expiryDate: Date | string, locale: string = 'ru-RU'): string {
  const expiry = toDate(expiryDate);
  const diff = expiry.getTime() - Date.now();
  const copy = localeCopy[resolveLanguage(locale)];
  const safeLocale = resolveLocale(locale);

  if (diff <= 0) {
    return copy.expired;
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours === 0) {
    return `${copy.expiresIn} ${formatUnit(safeLocale, minutes, 'minute')}`;
  }

  if (hours < 24) {
    return `${copy.expiresIn} ${formatUnit(safeLocale, hours, 'hour')} ${formatUnit(safeLocale, minutes, 'minute')}`;
  }

  const days = Math.floor(hours / 24);
  return `${copy.expiresIn} ${formatUnit(safeLocale, days, 'day')}`;
}

export function getTimeRemaining(expiryDate: Date | string): {
  hours: number;
  minutes: number;
  totalHours: number;
  isWarning: boolean;
} {
  const expiry = toDate(expiryDate);
  const diff = Math.max(0, expiry.getTime() - Date.now());

  const totalHours = diff / (1000 * 60 * 60);
  const hours = Math.floor(totalHours);
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return {
    hours,
    minutes,
    totalHours,
    isWarning: totalHours < 1,
  };
}

export function formatFullDate(date: Date | string, locale: string = 'ru-RU'): string {
  const d = toDate(date);
  return new Intl.DateTimeFormat(resolveLocale(locale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatRelativeDate(date: Date | string, locale: string = 'ru-RU'): string {
  const d = toDate(date);
  const safeLocale = resolveLocale(locale);
  const formatter = new Intl.RelativeTimeFormat(safeLocale, { numeric: 'auto' });
  const diffSeconds = Math.round((d.getTime() - Date.now()) / 1000);
  const absSeconds = Math.abs(diffSeconds);

  if (absSeconds < 60) {
    return formatter.format(diffSeconds, 'second');
  }

  const diffMinutes = Math.round(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, 'minute');
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, 'hour');
  }

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 30) {
    return formatter.format(diffDays, 'day');
  }

  const diffMonths = Math.round(diffDays / 30);
  if (Math.abs(diffMonths) < 12) {
    return formatter.format(diffMonths, 'month');
  }

  const diffYears = Math.round(diffDays / 365);
  return formatter.format(diffYears, 'year');
}
