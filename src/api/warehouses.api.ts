import api from './api';

export interface WarehousePayload {
  name: string;
  address: string;
  region: string;
  managerId?: string;
  isActive?: boolean;
}

// GET /api/warehouses
export const getWarehousesFn = async () => {
  const res = await api.get('/api/warehouses');
  return res.data;
};

// POST /api/warehouses
export const createWarehouseFn = async (data: WarehousePayload) => {
  const res = await api.post('/api/warehouses', data);
  return res.data;
};

// GET /api/warehouses/:id
export const getWarehouseByIdFn = async (id: string) => {
  const res = await api.get(`/api/warehouses/${id}`);
  return res.data;
};

// PUT /api/warehouses/:id
export const updateWarehouseFn = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<WarehousePayload>;
}) => {
  const res = await api.put(`/api/warehouses/${id}`, data);
  return res.data;
};

// DELETE /api/warehouses/:id
export const deleteWarehouseFn = async (id: string) => {
  const res = await api.delete(`/api/warehouses/${id}`);
  return res.data;
};