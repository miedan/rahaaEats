import type { PromoCode, PromoValidationResult } from '@rahaa/shared';
import { apiRequest } from './api';

export function getPromoCodes() {
  return apiRequest<PromoCode[]>('/promo', { auth: true });
}

export function validatePromo(code: string, subtotalRwf: number) {
  return apiRequest<PromoValidationResult>('/promo/validate', {
    method: 'POST',
    body: { code, subtotalRwf },
    auth: true,
  });
}
