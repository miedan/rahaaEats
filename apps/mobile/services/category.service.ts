import type { CategorySummary } from '@rahaa/shared';
import { apiRequest } from './api';

export function getCategories() {
  return apiRequest<CategorySummary[]>('/categories');
}
