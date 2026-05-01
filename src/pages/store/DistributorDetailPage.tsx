import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getClientDistributorByIdFn } from '../../api/client.api';
import {
  ArrowLeft, MapPin, Star, Phone, Package,
  CheckCircle2, ShoppingBag, Building2, Tag,
} from 'lucide-react';
import { motion } from 'framer-motion';

const DistributorDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: dist, isLoading } = useQuery({
    queryKey: ['distributor-detail', id],
    queryFn: () => getClientDistributorByIdFn(id!),
    enabled: !!id,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-48 bg-slate-100 animate-pulse rounded-4xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => <div key={n} className="h-24 bg-slate-100 animate-pulse rounded-3xl" />)}
        </div>
        <div className="h-64 bg-slate-100 animate-pulse rounded-4xl" />
      </div>
    );
  }

  if (!dist) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 font-bold">Distribyutor topilmadi</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 font-bold">Orqaga</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Distribyutorlar
      </button>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-4xl border border-slate-200 shadow-sm p-6"
      >
        <div className="flex items-start gap-5">
          {/* Logo */}
          <div className="w-20 h-20 shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 overflow-hidden">
            {dist.logo ? (
              <img src={dist.logo} alt={dist.companyName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-black text-indigo-500">{dist.companyName?.charAt(0) || 'D'}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-2xl font-black text-slate-900">{dist.companyName}</h1>
              {dist.isVerified && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Tasdiqlangan
                </span>
              )}
            </div>

            <div className="flex items-center flex-wrap gap-4 text-sm font-bold text-slate-500 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{dist.rating || '0.0'}</span>
              </div>
              {dist.region && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{dist.region}</span>
                </div>
              )}
              {dist.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>{dist.phone}</span>
                </div>
              )}
            </div>

            {dist.address && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Building2 className="w-4 h-4 shrink-0" />
                <span>{dist.address}</span>
              </div>
            )}

            {dist.description && (
              <p className="text-sm text-slate-600 leading-relaxed mt-2">{dist.description}</p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => navigate(`/store/catalog?distributorId=${dist.id}`)}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" /> Mahsulotlar katalogi
          </button>
          <button
            onClick={() => navigate('/store/orders')}
            className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm transition-all active:scale-95 flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" /> Buyurtmalar
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-black text-indigo-600">{dist.productsCount ?? 0}</p>
          <p className="text-xs font-bold text-slate-500 mt-1">Mahsulotlar</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-black text-amber-500">{Number(dist.rating || 0).toFixed(1)}</p>
          <p className="text-xs font-bold text-slate-500 mt-1">Reyting</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-black text-emerald-600">{dist.categories?.length ?? 0}</p>
          <p className="text-xs font-bold text-slate-500 mt-1">Kategoriyalar</p>
        </div>
      </div>

      {/* Categories */}
      {dist.categories?.length > 0 && (
        <div className="bg-white rounded-4xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-500" /> Kategoriyalar
          </h2>
          <div className="flex flex-wrap gap-2">
            {dist.categories.map((cat: any) => (
              <span key={cat.id} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold">
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      {dist.products?.length > 0 && (
        <div className="bg-white rounded-4xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-500" /> Mahsulotlar
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {dist.products.map((product: any, i: number) => {
              const cover = product.images?.[0]?.url;
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="cursor-pointer group"
                  onClick={() => navigate(`/store/catalog?distributorId=${dist.id}`)}
                >
                  <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-2">
                    {cover ? (
                      <img src={cover} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-800 truncate">{product.name}</p>
                  <p className="text-xs font-black text-indigo-600 mt-0.5">
                    {product.wholesalePrice?.toLocaleString()} so'm
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributorDetailPage;
