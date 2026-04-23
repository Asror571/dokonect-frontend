import api from './api';

export interface RegisterPayload {
  name: string;
  phone: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'DISTRIBUTOR' | 'STORE' | 'DRIVER';
  storeName?: string;
  region?: string;
  companyName?: string;
  address?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  licenseNumber?: string;
}

export interface LoginPayload {
  phone?: string;
  email?: string;
  password: string;
}

// LOGIN
export const loginFn = async (data: LoginPayload) => {
  const response = await api.post('/api/auth/login', data);
  return response.data;
};

// REGISTER
export const registerFn = async (data: RegisterPayload) => {
  const response = await api.post('/api/auth/register', data);
  return response.data;
};

// GET PROFILE
export const getMeFn = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};