import api from './api';

export interface PriceRulePayload {
  productId: string;
  variantId?: string;
  clientId?: string;
  price: number;
  validFrom?: string;
  validTo?: string;
}

export interface BulkRulePayload {
  productId: string;
  minQuantity: number;
  maxQuantity?: number;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
}

// ─── Price Rules ──────────────────────────────────────────────────────────────

// GET /api/pricing/price-rules?productId=xxx
export const getPriceRulesFn = async (productId: string) => {
  const res = await api.get('/api/pricing/price-rules', { params: { productId } });
  return res.data;
};

// POST /api/pricing/price-rules
export const createPriceRuleFn = async (data: PriceRulePayload) => {
  const res = await api.post('/api/pricing/price-rules', data);
  return res.data;
};

// PUT /api/pricing/price-rules/:id
export const updatePriceRuleFn = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<PriceRulePayload>;
}) => {
  const res = await api.put(`/api/pricing/price-rules/${id}`, data);
  return res.data;
};

// DELETE /api/pricing/price-rules/:id
export const deletePriceRuleFn = async (id: string) => {
  const res = await api.delete(`/api/pricing/price-rules/${id}`);
  return res.data;
};

// ─── Bulk Rules ───────────────────────────────────────────────────────────────

// GET /api/pricing/bulk-rules?productId=xxx
export const getBulkRulesFn = async (productId: string) => {
  const res = await api.get('/api/pricing/bulk-rules', { params: { productId } });
  return res.data;
};

// POST /api/pricing/bulk-rules
export const createBulkRuleFn = async (data: BulkRulePayload) => {
  const res = await api.post('/api/pricing/bulk-rules', data);
  return res.data;
};

// PUT /api/pricing/bulk-rules/:id
export const updateBulkRuleFn = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<BulkRulePayload>;
}) => {
  const res = await api.put(`/api/pricing/bulk-rules/${id}`, data);
  return res.data;
};

// DELETE /api/pricing/bulk-rules/:id
export const deleteBulkRuleFn = async (id: string) => {
  const res = await api.delete(`/api/pricing/bulk-rules/${id}`);
  return res.data;
};

// ─── Calculate ────────────────────────────────────────────────────────────────

// GET /api/pricing/calculate?productId=&clientId=&quantity=
export const calculatePriceFn = async (params: {
  productId: string;
  clientId: string;
  quantity: number;
}) => {
  const res = await api.get('/api/pricing/calculate', { params });
  return res.data;
};