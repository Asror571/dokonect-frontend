import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface CreateOrderPayload {
  distributorId: string;
  items: OrderItem[];
  deliveryAddress?: string | Record<string, any>;
  deliveryTimeSlot?: string;
  notes?: string;
  deliveryFee?: number;
  discount?: number;
  paymentMethod?: 'CASH' | 'CARD' | 'BANK_TRANSFER';
  dueDate?: string;
}

export interface UpdateOrderStatusPayload {
  status: 'NEW' | 'ACCEPTED' | 'REJECTED' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'RETURNED' | 'CANCELLED' | 'PAID';
  note?: string;
  rejectionReason?: string;
}

export interface OrdersParams {
  status?: string;
  page?: number;
  limit?: number;
}

// ─── API Functions ────────────────────────────────────────────────────────────

// POST /api/orders — buyurtma yaratish (store tomonidan)
export const createOrderFn = async (data: CreateOrderPayload) => {
  const response = await api.post('/api/orders', data);
  return response.data;
};

// GET /api/orders?status=xxx — buyurtmalar ro'yxati
export const getOrdersFn = async (params?: OrdersParams) => {
  const response = await api.get('/api/orders', { params });
  return response.data;
};

// GET /api/orders/:id — bitta buyurtma
export const getOrderByIdFn = async (id: string) => {
  const response = await api.get(`/api/orders/${id}`);
  return response.data;
};

// PATCH /api/orders/:id/status — holat o'zgartirish
export const updateOrderStatusFn = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateOrderStatusPayload;
}) => {
  const response = await api.patch(`/api/orders/${id}/status`, data);
  return response.data;
};