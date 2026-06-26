import type { UpdateProfileRequest, User } from '@rahaa/shared';
import { apiRequest } from './api';

export function getProfile() {
  return apiRequest<User>('/profile', { auth: true });
}

export function updateProfile(payload: UpdateProfileRequest) {
  return apiRequest<User>('/profile', { method: 'PATCH', body: payload, auth: true });
}
