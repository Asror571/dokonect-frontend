import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductAlert {
  id: string;
  productId: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
}

export interface ProductAlertsResponse {
  alerts: ProductAlert[];
  total?: number;
}

// ─── API Functions ────────────────────────────────────────────────────────────

// GET /api/product-alerts?isRead=true/false — ogohlantirishlar ro'yxati
export const getProductAlertsFn = async (isRead?: boolean | string) => {
  const response = await api.get('/api/product-alerts', {
    params: { isRead },
  });
  return response.data;
};

// POST /api/product-alerts/check — ogohlantirishlarni tekshirish
export const checkProductAlertsFn = async () => {
  const response = await api.post('/api/product-alerts/check');
  return response.data;
};

// PATCH /api/product-alerts/:id/read — bitta ogohlantirishni o'qilgan deb belgilash
export const markAlertAsReadFn = async (id: string) => {
  const response = await api.patch(`/api/product-alerts/${id}/read`);
  return response.data;
};

// POST /api/product-alerts/update-velocities — barcha mahsulot tezliklarini yangilash
export const updateProductVelocitiesFn = async () => {
  const response = await api.post('/api/product-alerts/update-velocities');
  return response.data;
};