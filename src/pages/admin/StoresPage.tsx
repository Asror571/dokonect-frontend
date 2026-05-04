import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Store, Search, MapPin, Phone, Package, ShoppingCart, CheckCircle2, XCircle } from 'lucide-react';
import { getAdminUsersFn } from '../../api/admin.api';

const AdminStoresPage = () => {
  const [search, setSearch] = useState('');

  const { data: res, isLoading } = useQuery({
    queryKey: ['admin-stores'],
    queryFn: () => getAdminUsersFn({ role: 'CLIENT' }),
    retry: false,
  });

  const stores: any[] = res?.data?.users || res?.users || res?.data || [];
  const filtered = stores.filter((s: any) => {
    const q = search.toLowerCase();
    return !q || s.name?.toLowerCase().includes(q) || s.phone?.includes(q);
  });

  const active = stores.filter((s: any) => s.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Store className="w-6 h-6 text-violet-400" /> Do'konlar
        </h1>
        <p className="text-slate-400 text-sm mt-1">Barcha do'kon egalarini boshqarish</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Jami',   value: stores.length,           c: 'text-white'       },
          { label: 'Faol',   value: active,                  c: 'text-emerald-400' },
          { label: 'Nofaol', value: stores.length - active,  c: 'text-red-400'     },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.c}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Do'kon nomi yoki telefon..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/50">
                  {["Do'kon egasi", 'Telefon', 'Manzil', 'Mahsulotlar', 'Buyurtmalar', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-500">Do'konlar topilmadi</td></tr>
                ) : filtered.map((store: any) => {
                  const cl = store.client || store;
                  return (
                    <tr key={store.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold shrink-0">
                            {(cl.storeName || store.name || 'S').charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-white">{cl.storeName || store.name}</p>
                            <p className="text-xs text-slate-500">{store.email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><div className="flex items-center gap-1 text-slate-300 text-xs"><Phone className="w-3 h-3" />{store.phone || '—'}</div></td>
                      <td className="px-4 py-3"><div className="flex items-center gap-1 text-slate-400 text-xs"><MapPin className="w-3 h-3 shrink-0" /><span className="truncate max-w-[120px]">{cl.address || cl.region || '—'}</span></div></td>
                      <td className="px-4 py-3"><div className="flex items-center gap-1 text-slate-300 text-xs"><Package className="w-3 h-3" />{cl._count?.products ?? '—'}</div></td>
                      <td className="px-4 py-3"><div className="flex items-center gap-1 text-slate-300 text-xs"><ShoppingCart className="w-3 h-3" />{cl._count?.orders ?? '—'}</div></td>
                      <td className="px-4 py-3">
                        {store.status === 'ACTIVE'
                          ? <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" />Faol</span>
                          : <span className="flex items-center gap-1 text-xs text-red-400"><XCircle className="w-3.5 h-3.5" />Nofaol</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStoresPage;