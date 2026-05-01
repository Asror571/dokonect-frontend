import api from './api';

export interface CategoryCreatePayload {
  name: string;
  parentId?: string;
  icon?: string;
  image?: string;
  order?: number;
}

export interface CategoryUpdatePayload {
  name?: string;
  parentId?: string;
  icon?: string;
  image?: string;
  order?: number;
}

// GET /api/categories?distributorId=xxx
export const getCategoriesFn = async (distributorId: string) => {
  const res = await api.get('/api/categories', { params: { distributorId } });
  return res.data;
};

// POST /api/categories  (distributorId auth orqali backend o'zi qo'yadi)
export const createCategoryFn = async (data: CategoryCreatePayload) => {
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
  data: CategoryUpdatePayload;
}) => {
  const res = await api.put(`/api/categories/${id}`, data);
  return res.data;
};

// DELETE /api/categories/:id
export const deleteCategoryFn = async (id: string) => {
  const res = await api.delete(`/api/categories/${id}`);
  return res.data;
};
