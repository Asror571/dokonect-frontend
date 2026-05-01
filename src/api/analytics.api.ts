import api from './api';

// GET /api/analytics/distributor?from=xxx&to=xxx
export const getDistributorAnalyticsFn = async (params: { from?: string; to?: string; period?: string }) => {
  const res = await api.get('/api/analytics/distributor', { params });
  return res.data;
};

// GET /api/analytics/payments?from=xxx&to=xxx
export const getPaymentsAnalyticsFn = async (params: { from?: string; to?: string; period?: string }) => {
  const res = await api.get('/api/analytics/payments', { params });
  return res.data;
};

// GET /api/analytics/client?period=xxx
export const getClientAnalyticsFn = async (period: string) => {
  const res = await api.get('/api/analytics/client', { params: { period } });
  return res.data;
};