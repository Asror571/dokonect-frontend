import api from './api';

export interface UpdateInventoryPayload {
  quantity?: number;
  reserved?: number;
  minThreshold?: number;
}

export interface TransferInventoryPayload {
  sourceWarehouseId: string;
  destWarehouseId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  note?: string;
}

// GET /api/inventory?warehouseId=xxx
export const getInventoryFn = async (warehouseId?: string) => {
  const res = await api.get('/api/inventory', { params: { warehouseId } });
  return res.data;
};

// PATCH /api/inventory/:inventoryId
export const updateInventoryFn = async ({
  inventoryId,
  data,
}: {
  inventoryId: string;
  data: UpdateInventoryPayload;
}) => {
  const res = await api.patch(`/api/inventory/${inventoryId}`, data);
  return res.data;
};

// GET /api/inventory/low-stock
export const getLowStockInventoryFn = async () => {
  const res = await api.get('/api/inventory/low-stock');
  return res.data;
};

// POST /api/inventory/transfer — omborlar orasida o'tkazma
export const transferInventoryFn = async (data: TransferInventoryPayload) => {
  const res = await api.post('/api/inventory/transfer', data);
  return res.data;
};

// PATCH /api/inventory/transfer/:transferId/complete
export const completeTransferFn = async (transferId: string) => {
  const res = await api.patch(`/api/inventory/transfer/${transferId}/complete`);
  return res.data;
};

// GET /api/inventory/transfers
export const getInventoryTransfersFn = async () => {
  const res = await api.get('/api/inventory/transfers');
  return res.data;
};