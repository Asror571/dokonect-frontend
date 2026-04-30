import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DistributorOrdersParams {
  status?: string;
  page?: number;
  limit?: number;
}

export interface StockUpdatePayload {
  quantity: number;
  type?: 'ADD' | 'SUBTRACT' | 'SET';
  note?: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

// GET /api/distributor/dashboard
export const getDistributorDashboardFn = async () => {
  const response = await api.get('/api/distributor/dashboard');
  return response.data;
};

// GET /api/distributor/products-dashboard
export const getDistributorProductsDashboardFn = async () => {
  const response = await api.get('/api/distributor/products-dashboard');
  return response.data;
};

// ─── Orders ───────────────────────────────────────────────────────────────────

// GET /api/distributor/orders?status=xxx
export const getDistributorOrdersFn = async (params?: DistributorOrdersParams) => {
  const response = await api.get('/api/distributor/orders', { params });
  return response.data;
};

// POST /api/distributor/orders/:orderId/accept
export const acceptDistributorOrderFn = async (orderId: string) => {
  const response = await api.post(`/api/distributor/orders/${orderId}/accept`);
  return response.data;
};

// POST /api/distributor/orders/:orderId/reject
export const rejectDistributorOrderFn = async ({
  orderId,
  reason,
}: {
  orderId: string;
  reason?: string;
}) => {
  const response = await api.post(`/api/distributor/orders/${orderId}/reject`, { reason });
  return response.data;
};

// ─── Stock ────────────────────────────────────────────────────────────────────

// GET /api/distributor/stock-logs
export const getDistributorStockLogsFn = async () => {
  const response = await api.get('/api/distributor/stock-logs');
  return response.data;
};

// ─── Connection Requests ──────────────────────────────────────────────────────

// GET /api/distributor/connections
export const getConnectionRequestsFn = async () => {
  const response = await api.get('/api/distributor/connections');
  return response.data;
};

// PATCH /api/distributor/connections/:linkId  { action: 'APPROVED' | 'REJECTED' }
export const respondToConnectionFn = async ({
  linkId,
  action,
}: {
  linkId: string;
  action: 'APPROVED' | 'REJECTED';
}) => {
  const response = await api.patch(`/api/distributor/connections/${linkId}`, { action });
  return response.data;
};

// ─── Stock ────────────────────────────────────────────────────────────────────

// PATCH /api/distributor/products/:productId/stock
export const updateDistributorProductStockFn = async ({
  productId,
  data,
}: {
  productId: string;
  data: StockUpdatePayload;
}) => {
  const response = await api.patch(`/api/distributor/products/${productId}/stock`, data);
  return response.data;
};