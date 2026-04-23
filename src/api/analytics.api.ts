import api from './api';

// GET /api/analytics/distributor?period=xxx
export const getDistributorAnalyticsFn = async (period: string) => {
  const res = await api.get('/api/analytics/distributor', { params: { period } });
  return res.data;
};

// GET /api/analytics/client?period=xxx
export const getClientAnalyticsFn = async (period: string) => {
  const res = await api.get('/api/analytics/client', { params: { period } });
  return res.data;
};