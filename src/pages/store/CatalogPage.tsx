import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '../../store/cart.store';
import ProductCard from '../../components/products/ProductCard';
import { ShoppingBag, Search, SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

import { getClientProductsFn } from '../../api/client.api';
import { getProductCategoriesFn } from '../../api/product.api';

const LIMIT = 12;

const CatalogPage = () => {
  const [search,     setSearch]     = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sortBy,     setSortBy]     = useState('newest');
  const [page,       setPage]       = useState(1);

  // Barcha kategoriyalarni alohida yuklash
  const { data: categoriesData } = useQuery({
    queryKey: ['catalog-categories'],
    queryFn: () => getProductCategoriesFn(''),
    staleTime: 300_000,
  });
  const categories: any[] = (Array.isArray(categoriesData) ? categoriesData : categoriesData?.data || []);

  const { data: fetchRes, isLoading } = useQuery({
    queryKey: ['client-catalog', search, categoryId, sortBy, page],
    queryFn: () =>
      getClientProductsFn({
        search:     search     || undefined,
        categoryId: categoryId || undefined,
        sort:       sortBy !== 'newest' ? sortBy : undefined,
        page,
        limit: LIMIT,
      } as any),
    staleTime: 30_000,
  });

  const { items, addItem, removeItem, updateQuantity } = useCartStore();

  const catalogData     = fetchRes?.data || fetchRes || {};
  const products: any[] = catalogData.products || catalogData.items || [];
  const total: number   = catalogData.total || catalogData.pagination?.total || 0;
  const totalPages      = Math.ceil(total / LIMIT);

  const handleAddToCart = (product: any) => {
    addItem({
      ...product,
      quantity:      1,
      productId:     product.id,
      distributorId: product.distributorId || product.distributor?.id || '',
    });
    toast.success(`${product.name} savatga qo'shildi`, { icon: '🛍️' });
  };

  const hasFilters = search || categoryId || sortBy !== 'newest';
  const filteredProducts = products;

  return (
    <div className="page fade-in max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">Mahsulotlar Katalogi</h1>
        <p className="text-slate-500 font-medium mt-1">Hamkorlarimiz mahsulotlarini ko'ring va savatga qo'shing.</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Mahsulot yoki SKU qidirish..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
            />
            {search && (
              <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-48">
              <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={categoryId}
                onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
                className="w-full pl-11 pr-8 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-indigo-500/20 outline-none"
              >
                <option value="">Kategoriyalar</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="flex-1 min-w-30 pl-4 pr-8 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-indigo-500/20 outline-none"
            >
              <option value="newest">Yangi</option>
              <option value="price_asc">Arzonroq</option>
              <option value="price_desc">Qimmatroq</option>
            </select>
          </div>
        </div>

        {hasFilters && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtrlar faol</p>
            <button onClick={() => { setSearch(''); setCategoryId(''); setSortBy('newest'); setPage(1); }} className="text-xs font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">
              Tozalash
            </button>
          </div>
        )}
      </div>

      {/* Products */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, n) => (
            <div key={n} className="h-72 bg-slate-100 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-500 font-bold">Mahsulotlar topilmadi</p>
          <p className="text-slate-400 text-sm mt-1">Boshqa so'z bilan qidiring yoki filtrlarni tozalang.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredProducts.map((product: any) => {
              const cartItem = items.find((i) => i.productId === product.id);
              return (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    price: product.wholesalePrice || product.price,
                    category: product.category?.name || product.category || '',
                    imageUrl: product.imageUrl || product.images?.[0]?.url || product.images?.[0] || null,
                  }}
                  type="STORE_OWNER"
                  onAddCart={handleAddToCart}
                  onRemoveCart={removeItem}
                  onUpdateQuantity={updateQuantity}
                  cartQuantity={cartItem?.quantity}
                />
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="w-12 h-12 p-0 rounded-2xl border-slate-200">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">{page}</span>
                <span className="text-xs font-bold text-slate-400">/ {totalPages}</span>
              </div>
              <Button variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-12 h-12 p-0 rounded-2xl border-slate-200">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CatalogPage;