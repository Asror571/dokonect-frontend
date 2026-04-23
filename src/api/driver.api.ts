import api from './api';

// GET /api/driver/dashboard
export const getDriverDashboardFn = async () => {
  const res = await api.get('/api/driver/dashboard');
  return res.data;
};

// POST /api/driver/location — joylashuvni yuborish
export const updateDriverLocationFn = async (data: { lat: number; lng: number }) => {
  const res = await api.post('/api/driver/location', data);
  return res.data;
};

// PATCH /api/driver/status — online/offline
export const updateDriverStatusFn = async (data: { isOnline: boolean }) => {
  const res = await api.patch('/api/driver/status', data);
  return res.data;
};

// POST /api/driver/orders/:orderId/accept
export const acceptDriverOrderFn = async (orderId: string) => {
  const res = await api.post(`/api/driver/orders/${orderId}/accept`);
  return res.data;
};

// PATCH /api/driver/orders/:orderId/status
export const updateDriverOrderStatusFn = async ({
  orderId,
  status,
  note,
}: {
  orderId: string;
  status: 'PICKED' | 'IN_TRANSIT' | 'DELIVERED' | 'RETURNED';
  note?: string;
}) => {
  const res = await api.patch(`/api/driver/orders/${orderId}/status`, { status, note });
  return res.data;
};

// GET /api/driver/earnings?period=xxx
export const getDriverEarningsFn = async (period: string) => {
  const res = await api.get('/api/driver/earnings', { params: { period } });
  return res.data;
};