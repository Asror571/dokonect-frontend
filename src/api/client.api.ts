import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClientDistributorsParams {
  region?: string;
  search?: string;
}

export interface RateOrderPayload {
  rating: number;      // 1-5
  comment?: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

// GET /api/client/dashboard
export const getClientDashboardFn = async () => {
  const response = await api.get('/api/client/dashboard');
  return response.data;
};

// ─── Products ────────────────────────────────────────────────────────────────

// GET /api/client/products
export const getClientProductsFn = async (params?: {
  search?: string;
  category?: string;
  distributorId?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/api/client/products', { params });
  return response.data;
};

// ─── Distributors ─────────────────────────────────────────────────────────────

// GET /api/client/distributors?region=xxx&search=xxx
export const getClientDistributorsFn = async (params: ClientDistributorsParams) => {
  const response = await api.get('/api/client/distributors', { params });
  return response.data;
};

// GET /api/client/distributors/:distributorId
export const getClientDistributorByIdFn = async (distributorId: string) => {
  const response = await api.get(`/api/client/distributors/${distributorId}`);
  return response.data;
};

// POST /api/client/distributors/:distributorId/connect
export const connectDistributorFn = async (distributorId: string) => {
  const response = await api.post(`/api/client/distributors/${distributorId}/connect`);
  return response.data;
};

// ─── Finance ──────────────────────────────────────────────────────────────────

// GET /api/client/finance
export const getClientFinanceFn = async () => {
  const response = await api.get('/api/client/finance');
  return response.data;
};

// ─── Orders ───────────────────────────────────────────────────────────────────

// GET /api/client/orders/stats
export const getClientOrderStatsFn = async () => {
  const response = await api.get('/api/client/orders/stats');
  return response.data;
};

// GET /api/client/orders/tracking/:orderId
export const getClientOrderTrackingFn = async (orderId: string) => {
  const response = await api.get(`/api/client/orders/tracking/${orderId}`);
  return response.data;
};

// POST /api/client/orders/:orderId/rate
export const rateClientOrderFn = async ({
  orderId,
  data,
}: {
  orderId: string;
  data: RateOrderPayload;
}) => {
  const response = await api.post(`/api/client/orders/${orderId}/rate`, data);
  return response.data;
};