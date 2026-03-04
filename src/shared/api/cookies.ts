export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const parts = document.cookie.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(`${name}=`)) {
      return decodeURIComponent(trimmed.slice(name.length + 1));
    }
  }

  return null;
}
