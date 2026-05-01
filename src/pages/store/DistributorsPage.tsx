import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, MapPin, Star, CheckCircle2, Clock,
  XCircle, AlertCircle, Phone, Package, ShoppingBag,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getClientDistributorsFn, connectDistributorFn } from '../../api/client.api';

const DistributorsPage = () => {
  const queryClient = useQueryClient();
  const navigate    = useNavigate();
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');

  const { data: distRes, isLoading } = useQuery({
    queryKey: ['client-distributors', search, region],
    queryFn: () => getClientDistributorsFn({ search: search || undefined, region: region || undefined }),
    staleTime: 30_000,
    retry: false,
  });

  const { mutate: connect, isPending: isConnecting } = useMutation({
    mutationFn: (distributorId: string) => connectDistributorFn(distributorId),
    onSuccess: () => {
      toast.success("Ulanish so'rovi yuborildi");
      queryClient.invalidateQueries({ queryKey: ['client-distributors'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    },
  });

  const distributors: any[] = distRes?.data?.distributors || distRes?.distributors || distRes?.data || distRes || [];

  const connectedCount = distributors.filter((d: any) => d.linkStatus === 'APPROVED').length;
  const pendingCount   = distributors.filter((d: any) => d.linkStatus === 'PENDING').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">Distribyutorlar</h1>
          <p className="text-slate-500 font-medium mt-1">Hamkorlar toping va mahsulotlariga ulaning.</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl font-semibold">
            <CheckCircle2 className="w-4 h-4" /> {connectedCount} ulangan
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl font-semibold">
              <Clock className="w-4 h-4" /> {pendingCount} kutilmoqda
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input type="text" placeholder="Nomi bo'yicha qidirish..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 font-medium outline-none"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="w-full md:w-64 relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <select className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 font-medium appearance-none outline-none"
            value={region} onChange={(e) => setRegion(e.target.value)}>
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
            <div key={n} className="h-72 bg-slate-100 animate-pulse rounded-[32px]" />
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
            <motion.div key={dist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
            >
              <div className="p-6">
                {/* Logo + Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 overflow-hidden group-hover:scale-105 transition-transform">
                    {dist.logo ? (
                      <img src={dist.logo} alt={dist.companyName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-2xl font-black text-indigo-500">
                        {dist.companyName?.charAt(0) || 'D'}
                      </div>
                    )}
                  </div>
                  {dist.linkStatus === 'APPROVED' && <Badge variant="success"><CheckCircle2 className="w-3 h-3 inline mr-1" />Ulangan</Badge>}
                  {dist.linkStatus === 'PENDING'  && <Badge variant="warning"><Clock className="w-3 h-3 inline mr-1" />Kutilmoqda</Badge>}
                  {dist.linkStatus === 'REJECTED' && <Badge variant="danger"><XCircle className="w-3 h-3 inline mr-1" />Rad etilgan</Badge>}
                  {dist.linkStatus === 'BLOCKED'  && <Badge variant="danger"><AlertCircle className="w-3 h-3 inline mr-1" />Bloklangan</Badge>}
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
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{dist.region || 'Toshkent'}</span>
                  </div>
                </div>

                {/* Detail info */}
                <div className="space-y-2 mb-5 p-3 bg-slate-50 rounded-2xl">
                  {(dist.phone || dist.user?.phone) && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium">{dist.phone || dist.user?.phone}</span>
                    </div>
                  )}
                  {dist.address && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium truncate">{dist.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    {dist.productsCount !== undefined && (
                      <div className="flex items-center gap-1">
                        <Package className="w-3.5 h-3.5" />
                        <span>{dist.productsCount} ta mahsulot</span>
                      </div>
                    )}
                    {dist.ordersCount !== undefined && (
                      <div className="flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{dist.ordersCount} ta buyurtma</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                {dist.linkStatus === 'APPROVED' ? (
                  // Ulangan — 2 ta button
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate('/store/catalog')}
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Package className="w-3.5 h-3.5" /> Mahsulotlar
                    </button>
                    <button
                      onClick={() => navigate(`/store/orders`)}
                      className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Buyurtma
                    </button>
                  </div>
                ) : !dist.linkStatus || dist.linkStatus === 'NONE' ? (
                  // Ulanmagan
                  <button onClick={() => connect(dist.id)} disabled={isConnecting}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50">
                    {isConnecting ? 'Yuborilmoqda...' : "Ulanish so'rovi"}
                  </button>
                ) : (
                  // Pending / Rejected / Blocked
                  <button disabled
                    className="w-full py-3 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest cursor-not-allowed">
                    {dist.linkStatus === 'PENDING'  ? 'So\'rov kutilmoqda...' :
                     dist.linkStatus === 'REJECTED' ? 'Rad etilgan'          : 'Ulanish imkonsiz'}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DistributorsPage;