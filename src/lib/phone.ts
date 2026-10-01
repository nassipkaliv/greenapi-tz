export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) {
    return `7${digits.slice(1)}`;
  }
  return digits;
}

export function isValidPhone(digits: string): boolean {
  return digits.length >= 10 && digits.length <= 15;
}

export function phoneToChatId(digits: string): string {
  return `${digits}@c.us`;
}

export function formatPhone(digits: string): string {
  const match = digits.match(/^7(\d{3})(\d{3})(\d{2})(\d{2})$/);
  if (match) {
    return `+7 ${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
  }
  return `+${digits}`;
}
