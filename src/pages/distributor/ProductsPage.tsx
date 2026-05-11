import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, RefreshCw, TrendingUp, Package } from 'lucide-react';
import { ProductCard } from '../../components/ui/ProductCard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProductsFn, deleteProductFn } from '../../api/product.api';
import { getDistributorProductsDashboardFn } from '../../api/distributor.api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import SalesChart from '../../components/analytics/SalesChart';

export const ProductsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'price' | 'stock' | 'sales'>('createdAt');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['distributor-products', searchQuery, stockStatus, sortBy, user?.distributorId],
    queryFn: () =>
      getProductsFn({
        search: searchQuery || undefined,
        stockStatus: (stockStatus as any) || undefined,
        sortBy,
        sortOrder: 'desc',
        distributorId: user?.distributorId,
        page: 1,
        limit: 50,
      }),
  });

  // Products dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery({
    queryKey: ['distributor-products-dashboard'],
    queryFn: getDistributorProductsDashboardFn,
    staleTime: 60_000,
  });

  // Debug: console log
  React.useEffect(() => {
    if (dashboardData) {
      console.log('📊 Dashboard data:', dashboardData);
    }
    if (dashboardError) {
      console.error('❌ Dashboard error:', dashboardError);
    }
  }, [dashboardData, dashboardError]);

  const { mutate: deleteProduct } = useMutation({
    mutationFn: (id: string) => deleteProductFn(id),
    onSuccess: () => {
      toast.success("Mahsulot o'chirildi");
      queryClient.invalidateQueries({ queryKey: ['distributor-products'] });
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || "O'chirishda xatolik yuz berdi");
    },
  });

  const products = data?.products || [];
  const topSellingProducts = dashboardData?.topSellingProducts || [];
  const mostOrderedProducts = dashboardData?.mostOrderedProducts || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Mahsulotlar</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Jami: {data?.pagination?.total ?? 0} ta mahsulot
          </p>
        </div>
        <button
          onClick={() => navigate('/distributor/products/add')}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors font-semibold text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Mahsulot qo'shish
        </button>
      </div>

      {/* Top Selling & Most Ordered */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Eng ko'p sotilgan */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">Eng ko'p sotilgan</h2>
          </div>
          {dashboardLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
            </div>
          ) : topSellingProducts.length > 0 ? (
            <div className="space-y-3">
              {topSellingProducts.slice(0, 5).map((item: any) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/distributor/products/${item.id}`)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                    {item.images?.[0]?.url ? (
                      <img src={item.images[0].url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Package className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                    <p className="text-xs text-slate-500">Sotildi: {item.soldQuantity || 0} ta</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">
                      {(item.revenue || 0).toLocaleString('uz-UZ')} UZS
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <Package className="w-12 h-12 mb-2 opacity-30" />
              <p className="text-sm">Ma'lumot yo'q</p>
            </div>
          )}
        </div>

        {/* Savdo dinamikasi */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-sky-500" />
            <h2 className="text-lg font-bold text-slate-900">Savdo dinamikasi</h2>
          </div>
          {dashboardLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
            </div>
          ) : mostOrderedProducts.length > 0 ? (
            <div className="space-y-3">
              {mostOrderedProducts.slice(0, 5).map((item: any) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/distributor/products/${item.id}`)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                    {item.images?.[0]?.url ? (
                      <img src={item.images[0].url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Package className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                    <p className="text-xs text-slate-500">Buyurtmalar: {item.orderCount || 0} ta</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <TrendingUp className="w-12 h-12 mb-2 opacity-30" />
              <p className="text-sm">Ma'lumot yo'q</p>
            </div>
          )}
        </div>
      </div>

      <div>
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Nomi yoki SKU bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
            />
          </div>

          {/* Stock status filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="">Barcha holat</option>
              <option value="in_stock">Mavjud</option>
              <option value="low_stock">Kam qoldi</option>
              <option value="out_of_stock">Tugagan</option>
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
          >
            <option value="createdAt">Yangi qo'shilgan</option>
            <option value="price">Narx</option>
            <option value="stock">Ombor</option>
            <option value="sales">Sotuvlar</option>
          </select>

          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['distributor-products'] })}
            className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title="Yangilash"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-72 animate-pulse border border-slate-100" />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-12 text-red-500">
            Ma'lumot yuklashda xatolik yuz berdi
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={(id: string) => deleteProduct(id)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && products.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 text-lg font-medium mb-2">Mahsulotlar topilmadi</p>
            <p className="text-gray-400 text-sm mb-6">Birinchi mahsulotingizni qo'shing</p>
            <button
              onClick={() => navigate('/distributor/products/add')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              Mahsulot qo'shish
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
