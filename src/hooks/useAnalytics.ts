import { useQuery } from '@tanstack/react-query';
import api from '../api/api';  // ← services/api emas, api/api

// ─── Distributor ──────────────────────────────────────────────────────────────

export function useDistributorOverview() {
  return useQuery({
    queryKey: ['analytics', 'distributor', 'overview'],
    queryFn: async () => {
      const res = await api.get('/api/distributor/analytics/dashboard');
      const data = res.data?.data || {};
      return {
        totalOrders:   data.orders?.total      || 0,
        totalRevenue:  data.todaySales?.amount  || 0,
        totalProducts: data.topProducts?.length || 0,
        pendingOrders: data.orders?.inProgress  || 0,
        lowStockCount: data.lowStockAlerts      || 0,
      };
    },
    staleTime: 30_000,
  });
}

export function useDistributorSales(period: string = '7d') {
  return useQuery({
    queryKey: ['analytics', 'distributor', 'sales', period],
    queryFn: async () => {
      const res = await api.get('/api/distributor/analytics/dashboard');
      return (res.data?.data?.salesTrend || []).map((item: any) => ({
        sana:  item.date,
        sotuv: item.sales,
      }));
    },
    staleTime: 30_000,
  });
}

export function useDistributorTopProducts(limit = 5) {
  return useQuery({
    queryKey: ['analytics', 'distributor', 'top-products', limit],
    queryFn: async () => {
      const res = await api.get('/api/distributor/analytics/dashboard');
      return (res.data?.data?.topProducts || [])
        .slice(0, limit)
        .map((item: any) => ({
          name:  item.product?.name || 'Noma\'lum',
          value: item.quantity,
        }));
    },
    staleTime: 30_000,
  });
}

export function useDistributorTopStores(limit = 5) {
  return useQuery({
    queryKey: ['analytics', 'distributor', 'top-stores', limit],
    queryFn: async () => {
      const res = await api.get('/api/distributor/analytics/sales');
      return (res.data?.data?.topClients || [])
        .slice(0, limit)
        .map((item: any) => ({
          id:           item.client?.id,
          storeName:    item.client?.user?.name || item.client?.storeName || 'Noma\'lum',
          orderCount:   item.orderCount,
          totalRevenue: item.totalAmount,
        }));
    },
    staleTime: 30_000,
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useAdminOverview() {
  return useQuery({
    queryKey: ['analytics', 'admin', 'overview'],
    queryFn: async () => {
      const res = await api.get('/api/admin/analytics/overview');
      return res.data?.data || {};
    },
    staleTime: 30_000,
  });
}

export function useAdminRevenue(period: string = '30d') {
  return useQuery({
    queryKey: ['analytics', 'admin', 'revenue', period],
    queryFn: async () => {
      const res = await api.get(`/api/admin/analytics/revenue?period=${period}`);
      return res.data?.data || {};
    },
    staleTime: 30_000,
  });
}

export function useAdminOrders(period: string = '30d') {
  return useQuery({
    queryKey: ['analytics', 'admin', 'orders', period],
    queryFn: async () => {
      const res = await api.get(`/api/admin/analytics/orders?period=${period}`);
      return res.data?.data || {};
    },
    staleTime: 30_000,
  });
}