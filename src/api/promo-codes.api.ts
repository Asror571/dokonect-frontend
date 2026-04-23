import api from './api';

export interface PromoCodePayload {
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  usesPerClient?: number;
  validFrom?: string;
  validTo?: string;
  applicableTo?: any;
}

// GET /api/promo-codes
export const getPromoCodesFn = async () => {
  const res = await api.get('/api/promo-codes');
  return res.data;
};

// POST /api/promo-codes
export const createPromoCodeFn = async (data: PromoCodePayload) => {
  const res = await api.post('/api/promo-codes', data);
  return res.data;
};

// PUT /api/promo-codes/:id
export const updatePromoCodeFn = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<PromoCodePayload>;
}) => {
  const res = await api.put(`/api/promo-codes/${id}`, data);
  return res.data;
};

// DELETE /api/promo-codes/:id
export const deletePromoCodeFn = async (id: string) => {
  const res = await api.delete(`/api/promo-codes/${id}`);
  return res.data;
};

// POST /api/promo-codes/validate — promokodni tekshirish
export const validatePromoCodeFn = async (data: {
  code: string;
  orderAmount: number;
  distributorId: string;
}) => {
  const res = await api.post('/api/promo-codes/validate', data);
  return res.data;
};