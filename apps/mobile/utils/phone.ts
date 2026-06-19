export function toE164(localDigits: string): string {
  const digits = localDigits.replace(/\D/g, '');
  return `+250${digits}`;
}

export function stripCountryCode(phoneNumber: string): string {
  return phoneNumber.replace(/^\+?250/, '');
}

export function maskPhone(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, '');
  return `***${digits.slice(-4)}`;
}
