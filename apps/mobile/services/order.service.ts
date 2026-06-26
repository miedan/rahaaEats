import type { CreateOrderRequest, Order, OrderDetail } from '@rahaa/shared';
import { apiRequest } from './api';

export function createOrder(payload: CreateOrderRequest) {
  return apiRequest<Order>('/orders', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export function getOrders() {
  return apiRequest<OrderDetail[]>('/orders', { auth: true });
}

export function getOrder(id: string) {
  return apiRequest<OrderDetail>(`/orders/${id}`, { auth: true });
}
