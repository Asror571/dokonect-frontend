import api from './api';

export interface CategoryPayload {
  name: string;
  slug: string;
  distributorId: string;
  parentId?: string;
  image?: string;
  icon?: string;
  order?: number;
}

// GET /api/categories?distributorId=xxx
export const getCategoriesFn = async (distributorId: string) => {
  const res = await api.get('/api/categories', { params: { distributorId } });
  return res.data;
};

// POST /api/categories
export const createCategoryFn = async (data: CategoryPayload) => {
  const res = await api.post('/api/categories', data);
  return res.data;
};

// GET /api/categories/:id
export const getCategoryByIdFn = async (id: string) => {
  const res = await api.get(`/api/categories/${id}`);
  return res.data;
};

// PUT /api/categories/:id
export const updateCategoryFn = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<CategoryPayload>;
}) => {
  const res = await api.put(`/api/categories/${id}`, data);
  return res.data;
};

// DELETE /api/categories/:id
export const deleteCategoryFn = async (id: string) => {
  const res = await api.delete(`/api/categories/${id}`);
  return res.data;
};