/**
 * Formatting utilities for Uilesim platform
 * Standards:
 * - Money: "10 038 ₸" (spaces as thousands separators)
 * - Dates: "до 12 мар, 23:59" or "истекает через 3 ч 12 мин"
 */

/**
 * Format money with ₸ symbol and space separators
 * @param amount - Number or string like "95.00"
 * @returns Formatted string like "10 038 ₸"
 */
export function formatMoney(amount: number | string): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return "0 ₸";
  }

  // Round to avoid floating point issues
  const rounded = Math.round(numAmount);
  
  // Add space separators for thousands
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  
  return `${formatted} ₸`;
}

/**
 * Format discount percentage
 * @param percent - Discount percentage
 * @returns Formatted string like "−30%"
 */
export function formatDiscount(percent: number): string {
  return `−${percent}%`;
}

/**
 * Format date to short format
 * @param date - Date object or ISO string
 * @returns Formatted string like "12 мар" or "3 марта"
 */
export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  
  const months = [
    "янв", "фев", "мар", "апр", "мая", "июн",
    "июл", "авг", "сен", "окт", "ноя", "дек"
  ];
  
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

/**
 * Format date with time
 * @param date - Date object or ISO string
 * @returns Formatted string like "до 12 мар, 23:59"
 */
export function formatDateWithTime(date: Date | string, prefix: string = "до"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const shortDate = formatShortDate(d);
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  
  return `${prefix} ${shortDate}, ${hours}:${minutes}`;
}

/**
 * Format countdown to expiry
 * @param expiryDate - Date object or ISO string
 * @returns Formatted string like "истекает через 3 ч 12 мин"
 */
export function formatCountdown(expiryDate: Date | string): string {
  const expiry = typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate;
  const now = new Date();
  const diff = expiry.getTime() - now.getTime();
  
  if (diff <= 0) {
    return "истекло";
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours === 0) {
    return `истекает через ${minutes} мин`;
  }
  
  if (hours < 24) {
    return `истекает через ${hours} ч ${minutes} мин`;
  }
  
  const days = Math.floor(hours / 24);
  return `истекает через ${days} ${getDaysLabel(days)}`;
}

/**
 * Get time remaining in short format
 * @param expiryDate - Date object or ISO string
 * @returns Object with hours, minutes, isWarning flag
 */
export function getTimeRemaining(expiryDate: Date | string): {
  hours: number;
  minutes: number;
  totalHours: number;
  isWarning: boolean; // true if < 1 hour remaining
} {
  const expiry = typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate;
  const now = new Date();
  const diff = Math.max(0, expiry.getTime() - now.getTime());
  
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

/**
 * Format full date for transactions
 * @param date - Date object or ISO string
 * @returns Formatted string like "3 марта 2026, 14:32"
 */
export function formatFullDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  
  const months = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря"
  ];
  
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${hours}:${minutes}`;
}

/**
 * Format relative date (e.g., "2 дня назад")
 * @param date - Date object or ISO string
 * @returns Formatted string
 */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (seconds < 60) return "только что";
  if (minutes < 60) return `${minutes} ${getMinutesLabel(minutes)} назад`;
  if (hours < 24) return `${hours} ${getHoursLabel(hours)} назад`;
  if (days < 30) return `${days} ${getDaysLabel(days)} назад`;
  if (months < 12) return `${months} ${getMonthsLabel(months)} назад`;
  return `${years} ${getYearsLabel(years)} назад`;
}

// Helper functions for Russian pluralization
function getDaysLabel(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return "день";
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return "дня";
  return "дней";
}

function getHoursLabel(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return "час";
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return "часа";
  return "часов";
}

function getMinutesLabel(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return "минуту";
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return "минуты";
  return "минут";
}

function getMonthsLabel(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return "месяц";
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return "месяца";
  return "месяцев";
}

function getYearsLabel(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return "год";
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return "года";
  return "лет";
}
