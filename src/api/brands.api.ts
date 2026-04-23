import api from './api';

export interface BrandPayload {
  name: string;
  slug: string;
  distributorId: string;
  logo?: string;
}

// GET /api/brands?distributorId=xxx
export const getBrandsFn = async (distributorId: string) => {
  const res = await api.get('/api/brands', { params: { distributorId } });
  return res.data;
};

// POST /api/brands
export const createBrandFn = async (data: BrandPayload) => {
  const res = await api.post('/api/brands', data);
  return res.data;
};

// GET /api/brands/:id
export const getBrandByIdFn = async (id: string) => {
  const res = await api.get(`/api/brands/${id}`);
  return res.data;
};

// PUT /api/brands/:id
export const updateBrandFn = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<BrandPayload>;
}) => {
  const res = await api.put(`/api/brands/${id}`, data);
  return res.data;
};

// DELETE /api/brands/:id
export const deleteBrandFn = async (id: string) => {
  const res = await api.delete(`/api/brands/${id}`);
  return res.data;
};