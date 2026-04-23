import api from './api';

// GET /api/admin/dashboard
export const getAdminDashboardFn = async () => {
  const res = await api.get('/api/admin/dashboard');
  return res.data;
};

// GET /api/admin/orders?status=xxx
export const getAdminOrdersFn = async (params?: { status?: string; page?: number; limit?: number }) => {
  const res = await api.get('/api/admin/orders', { params });
  return res.data;
};

// GET /api/admin/drivers/active
export const getAdminActiveDriversFn = async () => {
  const res = await api.get('/api/admin/drivers/active');
  return res.data;
};

// GET /api/admin/users
export const getAdminUsersFn = async (params?: {
  role?: 'ADMIN' | 'DISTRIBUTOR' | 'DRIVER' | 'CLIENT';
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const res = await api.get('/api/admin/users', { params });
  return res.data;
};

// PATCH /api/admin/users/:userId/status
export const updateAdminUserStatusFn = async ({
  userId,
  status,
}: {
  userId: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
}) => {
  const res = await api.patch(`/api/admin/users/${userId}/status`, { status });
  return res.data;
};

// GET /api/admin/analytics?period=xxx
export const getAdminAnalyticsFn = async (period: string) => {
  const res = await api.get('/api/admin/analytics', { params: { period } });
  return res.data;
};