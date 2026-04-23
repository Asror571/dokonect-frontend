import api from './api';

// GET /api/debts/client — mijoz qarzdorliklarini ko'rish
export const getClientDebtsFn = async () => {
  const res = await api.get('/api/debts/client');
  return res.data;
};

// GET /api/debts/distributor — distribyutor qarzdorliklarini ko'rish
export const getDistributorDebtsFn = async () => {
  const res = await api.get('/api/debts/distributor');
  return res.data;
};

// POST /api/debts/:debtId/pay — qarzni to'lash
export const payDebtFn = async ({
  debtId,
  amount,
}: {
  debtId: string;
  amount: number;
}) => {
  const res = await api.post(`/api/debts/${debtId}/pay`, { amount });
  return res.data;
};

// GET /api/debts/summary — umumiy xulosa
export const getDebtsSummaryFn = async () => {
  const res = await api.get('/api/debts/summary');
  return res.data;
};