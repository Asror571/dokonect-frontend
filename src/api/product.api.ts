import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductVariant {
  color?: string;
  size?: string;
  model?: string;
  skuVariant?: string;
  priceOverride?: number;
}

export interface ProductPayload {
  name: string;
  sku: string;
  description?: string;
  wholesalePrice: number;
  retailPrice: number;
  costPrice?: number;
  unit?: string;
  categoryId?: string;
  brandId?: string;
  status?: 'ACTIVE' | 'DRAFT' | 'OUT_OF_STOCK';
  discountType?: 'PERCENT' | 'FIXED';
  discountValue?: number;
  youtubeUrl?: string;
  images?: string[];
  variants?: ProductVariant[];
}

export interface ProductsParams {
  search?: string;
  category?: string;
  distributorId?: string;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
  velocityStatus?: 'fast' | 'medium' | 'slow' | 'dead';
  sortBy?: 'createdAt' | 'price' | 'stock' | 'sales';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductsResponse {
  products: any[];
  pagination: ProductsPagination;
}

// ─── API Functions ────────────────────────────────────────────────────────────

// GET /api/products — barcha mahsulotlar (filter, sort, pagination)
export const getProductsFn = async (params?: ProductsParams): Promise<ProductsResponse> => {
  const response = await api.get('/api/products', { params });
  return response.data;
};

// POST /api/products?distributorId=xxx — yangi mahsulot qo'shish
export const createProductFn = async ({
  distributorId,
  data,
}: {
  distributorId: string;
  data: ProductPayload;
}) => {
  const response = await api.post('/api/products', data, {
    params: { distributorId },
  });
  return response.data;
};

// GET /api/products/categories?distributorId=xxx — kategoriyalar
export const getProductCategoriesFn = async (distributorId: string) => {
  const response = await api.get('/api/products/categories', {
    params: { distributorId },
  });
  return response.data;
};

// GET /api/products/:id — bitta mahsulot
export const getProductByIdFn = async (id: string) => {
  const response = await api.get(`/api/products/${id}`);
  return response.data;
};

// PUT /api/products/:id — mahsulotni yangilash
export const updateProductFn = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<ProductPayload>;
}) => {
  const response = await api.put(`/api/products/${id}`, data);
  return response.data;
};

// DELETE /api/products/:id — mahsulotni o'chirish
export const deleteProductFn = async (id: string) => {
  const response = await api.delete(`/api/products/${id}`);
  return response.data;
};

// GET /api/products/:id/analytics?period=xxx — mahsulot analitikasi
export const getProductAnalyticsFn = async ({
  id,
  period,
}: {
  id: string;
  period: string;
}) => {
  const response = await api.get(`/api/products/${id}/analytics`, {
    params: { period },
  });
  return response.data;
};

// GET /api/products/:id/history — mahsulot tarixi
export const getProductHistoryFn = async (id: string) => {
  const response = await api.get(`/api/products/${id}/history`);
  return response.data;
};

// POST /api/products/:id/calculate-velocity — tezlikni hisoblash
export const calculateProductVelocityFn = async (id: string) => {
  const response = await api.post(`/api/products/${id}/calculate-velocity`);
  return response.data;
};