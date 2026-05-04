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

export const createAdminUserFn = async (data: {
  name: string;
  phone: string;
  password: string;
  role: string;
}) => {
  const res = await api.post('/api/admin/users', data);
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

export const updateAdminUserRoleFn = async ({
  userId,
  role,
}: {
  userId: string;
  role: string;
}) => {
  const res = await api.patch(`/api/admin/users/${userId}/role`, { role });
  return res.data;
};

export const deleteAdminUserFn = async (userId: string) => {
  const res = await api.delete(`/api/admin/users/${userId}`);
  return res.data;
};

export const getAdminAnalyticsFn = async (period = '30d') => {
  const res = await api.get('/api/admin/analytics', { params: { period } });
  return res.data;
};

// -- Distributors -------------------------------------------------------
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

export const getAdminDistributorStatsFn = async (distributorId: string) => {
  const res = await api.get(`/api/admin/distributors/${distributorId}/stats`);
  return res.data;
};

// -- Stores -------------------------------------------------------------
export const getAdminStorePaymentsFn = async (storeId: string) => {
  const res = await api.get(`/api/admin/stores/${storeId}/payments`);
  return res.data;
};