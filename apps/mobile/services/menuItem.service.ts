import type { MenuItemDetail } from '@rahaa/shared';
import { apiRequest } from './api';

export function getMenuItem(id: string) {
  return apiRequest<MenuItemDetail>(`/menu-items/${id}`);
}
