import type { SavedMomoNumber } from '@rahaa/shared';
import { apiRequest } from './api';

export function getMomoNumbers() {
  return apiRequest<SavedMomoNumber[]>('/momo', { auth: true });
}

export function addMomoNumber(phoneNumber: string, provider: 'MTN' | 'AIRTEL', isDefault?: boolean) {
  return apiRequest<SavedMomoNumber>('/momo', {
    method: 'POST',
    body: { phoneNumber, provider, isDefault },
    auth: true,
  });
}

export function setDefaultMomoNumber(id: string) {
  return apiRequest<SavedMomoNumber>(`/momo/${id}/set-default`, {
    method: 'PATCH',
    auth: true,
  });
}
