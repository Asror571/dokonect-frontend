import api from './api';

export const getAdminDashboardFn = async () => {
  const res = await api.get('/api/admin/dashboard');
  return res.data;
};

export const getAdminOrdersFn = async (params?: { status?: string; page?: number; limit?: number }) => {
  const res = await api.get('/api/admin/orders', { params });
  return res.data;
};

export const getAdminActiveDriversFn = async () => {
  const res = await api.get('/api/admin/drivers/active');
  return res.data;
};

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

export const getAdminAnalyticsFn = async (period = '30d') => {
  const res = await api.get('/api/admin/analytics', { params: { period } });
  return res.data;
};

// ── Distributors ──────────────────────────────────────────────────────────────
export const getAdminDistributorsFn = async () => {
  const res = await api.get('/api/admin/distributors');
  return res.data;
};

export const createAdminDistributorFn = async (data: any) => {
  const res = await api.post('/api/admin/distributors', data);
  return res.data;
};

export const updateAdminDistributorFn = async ({ id, data }: { id: string; data: any }) => {
  const res = await api.patch(`/api/admin/distributors/${id}`, data);
  return res.data;
};

export const deleteAdminDistributorFn = async (id: string) => {
  const res = await api.delete(`/api/admin/distributors/${id}`);
  return res.data;
};