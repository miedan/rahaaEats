export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('250')) return `+${digits}`;
  if (digits.startsWith('07') || digits.startsWith('7')) {
    const local = digits.startsWith('07') ? digits.slice(1) : digits;
    return `+250${local}`;
  }
  return `+${digits}`;
}

export function isValidRwandaPhone(phone: string): boolean {
  return /^\+2507[23890]\d{7}$/.test(phone);
}
