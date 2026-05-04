import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Store, Search, MapPin, Phone, Package, ShoppingCart, CheckCircle2, XCircle, DollarSign, X, CreditCard, Banknote, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { getAdminUsersFn, getAdminStorePaymentsFn } from '../../api/admin.api';

const AdminStoresPage = () => {
  const [search,        setSearch]        = useState('');
  const [selectedStore, setSelectedStore] = useState<any>(null);

  const { data: res, isLoading } = useQuery({
    queryKey: ['admin-stores'],
    queryFn: () => getAdminUsersFn({ role: 'CLIENT' }),
    retry: false,
  });

  const { data: paymentsRes, isLoading: paymentsLoading } = useQuery({
    queryKey: ['admin-store-payments', selectedStore?.id],
    queryFn: () => getAdminStorePaymentsFn(selectedStore.id),
    enabled: !!selectedStore,
    retry: false,
  });

  const stores: any[] = res?.data?.users || res?.users || res?.data || [];
  const filtered = stores.filter((s: any) => {
    const q = search.toLowerCase();
    return !q || s.name?.toLowerCase().includes(q) || s.phone?.includes(q);
  });

  const active   = stores.filter((s: any) => s.status === 'ACTIVE').length;
  const payments: any[] = paymentsRes?.data?.payments || paymentsRes?.payments || paymentsRes?.data || [];
  const totalSales = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

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
          { label: 'Jami',   value: stores.length,          c: 'text-white'       },
          { label: 'Faol',   value: active,                 c: 'text-emerald-400' },
          { label: 'Nofaol', value: stores.length - active, c: 'text-red-400'     },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className={"text-2xl font-bold " + s.c}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Do'kon nomi yoki telefon..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          />
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
                  {["Do'kon egasi", 'Telefon', 'Manzil', 'Mahsulotlar', 'Buyurtmalar', 'Savdo hajmi', 'Status', "To'lovlar"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-slate-500">Do'konlar topilmadi</td></tr>
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
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-slate-300 text-xs">
                          <Phone className="w-3 h-3" />{store.phone || ''}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-slate-400 text-xs">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[120px]">{cl.address || cl.region || ''}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-slate-300 text-xs">
                          <Package className="w-3 h-3" />{cl._count?.products ?? ''}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-slate-300 text-xs">
                          <ShoppingCart className="w-3 h-3" />{cl._count?.orders ?? ''}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                          <DollarSign className="w-3 h-3" />
                          {cl.totalRevenue
                            ? ((cl.totalRevenue) / 1_000_000).toFixed(1) + 'M'
                            : ''}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {store.status === 'ACTIVE'
                          ? <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" />Faol</span>
                          : <span className="flex items-center gap-1 text-xs text-red-400"><XCircle className="w-3.5 h-3.5" />Nofaol</span>}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedStore(store)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-violet-900/30 text-violet-400 border border-violet-800/30 rounded-lg text-xs hover:bg-violet-900/50 transition-colors"
                        >
                          <CreditCard className="w-3 h-3" /> Ko'rish
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedStore && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
              <div>
                <h3 className="text-lg font-bold">{selectedStore.client?.storeName || selectedStore.name}</h3>
                <p className="text-slate-400 text-sm">To'lovlar tarixi</p>
              </div>
              <button onClick={() => setSelectedStore(null)} className="p-1.5 hover:bg-slate-800 rounded-lg">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {!paymentsLoading && payments.length > 0 && (
              <div className="grid grid-cols-3 gap-3 p-4 border-b border-slate-800 shrink-0">
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-400 mb-1">Jami savdo</p>
                  <p className="text-sm font-bold text-emerald-400">{totalSales.toLocaleString('uz-UZ')} UZS</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-400 mb-1">Naqd</p>
                  <p className="text-sm font-bold text-amber-400">
                    {payments.filter((p: any) => p.method === 'CASH').reduce((s: number, p: any) => s + (p.amount || 0), 0).toLocaleString('uz-UZ')}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-400 mb-1">Online</p>
                  <p className="text-sm font-bold text-sky-400">
                    {payments.filter((p: any) => p.method !== 'CASH').reduce((s: number, p: any) => s + (p.amount || 0), 0).toLocaleString('uz-UZ')}
                  </p>
                </div>
              </div>
            )}

            <div className="overflow-y-auto flex-1 p-4">
              {paymentsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-500" />
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">To'lovlar tarixi yo'q</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {payments.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={"w-8 h-8 rounded-lg flex items-center justify-center " + (p.method === 'CASH' ? 'bg-amber-500/20' : 'bg-sky-500/20')}>
                          {p.method === 'CASH'
                            ? <Banknote className="w-4 h-4 text-amber-400" />
                            : <CreditCard className="w-4 h-4 text-sky-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">#{p.orderId?.slice(-6) || p.id?.slice(-6)}</p>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            {p.createdAt ? format(new Date(p.createdAt), 'dd MMM yyyy HH:mm') : ''}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-400">{(p.amount || 0).toLocaleString('uz-UZ')} UZS</p>
                        <span className={"text-[10px] px-1.5 py-0.5 rounded-full " + (
                          p.status === 'PAID'    ? 'bg-emerald-900/50 text-emerald-400' :
                          p.status === 'PENDING' ? 'bg-amber-900/50 text-amber-400'    :
                                                   'bg-slate-700 text-slate-400'
                        )}>{p.status || p.method}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStoresPage;