import api from './api';

// POST /api/upload/single — bitta fayl
export const uploadSingleFileFn = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/api/upload/single', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data?.url || res.data?.data?.url || '';
};

// POST /api/upload/multiple — bir nechta fayl
export const uploadMultipleFilesFn = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  const res = await api.post('/api/upload/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data?.urls || res.data?.data?.urls || [];
};

// DELETE /api/upload — faylni o'chirish
export const deleteFileFn = async (url: string) => {
  const res = await api.delete('/api/upload', { data: { url } });
  return res.data;
};

// ─── Bulk Upload ──────────────────────────────────────────────────────────────

// POST /api/bulk-upload/products — Excel dan mahsulotlarni yuklash
export const bulkUploadProductsFn = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/api/bulk-upload/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// POST /api/bulk-upload/inventory — Excel dan inventarni yuklash
export const bulkUploadInventoryFn = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/api/bulk-upload/inventory', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};