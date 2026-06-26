import type { Address, CreateAddressRequest } from '@rahaa/shared';
import { apiRequest } from './api';

export function getAddresses() {
  return apiRequest<Address[]>('/addresses', { auth: true });
}

export function createAddress(payload: CreateAddressRequest) {
  return apiRequest<Address>('/addresses', { method: 'POST', body: payload, auth: true });
}

export function updateAddress(id: string, payload: Partial<CreateAddressRequest>) {
  return apiRequest<Address>(`/addresses/${id}`, { method: 'PATCH', body: payload, auth: true });
}

export function deleteAddress(id: string) {
  return apiRequest<{ message: string }>(`/addresses/${id}`, { method: 'DELETE', auth: true });
}

export function setDefaultAddress(id: string) {
  return apiRequest<Address>(`/addresses/${id}/set-default`, { method: 'PATCH', auth: true });
}
