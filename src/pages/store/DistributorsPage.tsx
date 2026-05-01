import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Star, CheckCircle2, Phone, Package, ShoppingBag, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getClientDistributorsFn } from '../../api/client.api';

const DistributorsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');

  const { data: distRes, isLoading } = useQuery({
    queryKey: ['client-distributors', search, region],
    queryFn: () => getClientDistributorsFn({ search: search || undefined, region: region || undefined }),
    staleTime: 30_000,
    retry: false,
  });

  const distributors: any[] = distRes?.data?.distributors || distRes?.distributors || distRes?.data || distRes || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">Distribyutorlar</h1>
          <p className="text-slate-500 font-medium mt-1">Hamkorlar toping va mahsulotlarini ko'ring.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" /> {distributors.length} ta distribyutor
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Nomi bo'yicha qidirish..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 font-medium outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64 relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <select
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 font-medium appearance-none outline-none"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="">Barcha hududlar</option>
            <option value="Toshkent">Toshkent</option>
            <option value="Samarqand">Samarqand</option>
            <option value="Andijon">Andijon</option>
            <option value="Namangan">Namangan</option>
            <option value="Farg'ona">Farg'ona</option>
            <option value="Buxoro">Buxoro</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 bg-slate-100 animate-pulse rounded-4xl" />
          ))}
        </div>
      ) : distributors.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-bold">Distribyutorlar topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {distributors.map((dist: any, i: number) => (
            <motion.div
              key={dist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-4xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
            >
              <div className="p-6">
                {/* Logo */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 overflow-hidden group-hover:scale-105 transition-transform">
                    {dist.logo ? (
                      <img src={dist.logo} alt={dist.companyName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-indigo-500">
                        {dist.companyName?.charAt(0) || 'D'}
                      </span>
                    )}
                  </div>
                  {dist.isVerified && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Tasdiqlangan
                    </span>
                  )}
                </div>

                {/* Name */}
                <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1 group-hover:text-indigo-600 transition-colors">
                  {dist.companyName}
                </h3>

                {/* Rating + Region */}
                <div className="flex items-center gap-4 text-sm font-bold text-slate-500 mb-4">
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
                </div>

                {/* Contact info */}
                <div className="space-y-1.5 mb-5 p-3 bg-slate-50 rounded-2xl">
                  {dist.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium">{dist.phone}</span>
                    </div>
                  )}
                  {dist.address && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium truncate">{dist.address}</span>
                    </div>
                  )}
                </div>

                {/* Buttons — always visible */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/store/catalog?distributorId=${dist.id}`)}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Package className="w-3.5 h-3.5" /> Mahsulotlar
                  </button>
                  <button
                    onClick={() => navigate(`/store/distributors/${dist.id}`)}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => navigate('/store/orders')}
                    className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DistributorsPage;
