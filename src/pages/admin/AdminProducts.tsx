import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EyeOff, Loader2, Package, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/api';
import { Badge } from '../../components/ui/Badge';

const AdminProductsPage = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page],
    queryFn: () => api.get('/api/products', { params: { page, limit: 20 } }).then(r => r.data),
    retry: false,
  });

  const { mutate: deactivate } = useMutation({
    mutationFn: (id: string) => api.patch(`/api/products/${id}`, { status: 'DRAFT' }),
    onSuccess: () => {
      toast.success('Deaktiv qilindi');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xatolik'),
  });

  const products   = data?.data?.products || data?.products || data?.data || [];
  const total      = data?.data?.pagination?.total ?? data?.pagination?.total ?? products.length;
  const totalPages = data?.data?.pagination?.totalPages ?? data?.pagination?.totalPages ?? Math.ceil(total / 20);

  const lowStock = products.filter((p: any) => (p.stockQty ?? p.stock ?? 0) < 10).length;
  const active   = products.filter((p: any) => p.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="w-6 h-6 text-amber-400" /> Mahsulotlar
        </h1>
        <p className="text-slate-400 text-sm mt-1">{total} ta mahsulot</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Jami',       value: total,     c: 'text-white'       },
          { label: 'Faol',       value: active,    c: 'text-emerald-400' },
          { label: 'Kam qolgan', value: lowStock,  c: 'text-amber-400'   },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.c}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-violet-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/50">
                  {['Mahsulot', 'Distribyutor', 'Narx (UZS)', 'Zaxira', 'Holat', 'Amal'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {products.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-500">Mahsulotlar topilmadi</td></tr>
                ) : products.map((p: any) => {
                  const stock = p.stockQty ?? p.stock ?? 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.images?.[0]?.url ? (
                            <img src={p.images[0].url} alt={p.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                              <Package className="w-4 h-4 text-amber-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-white">{p.name}</p>
                            <p className="text-xs text-slate-500">{p.category?.name || p.sku || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{p.distributor?.companyName || '—'}</td>
                      <td className="px-4 py-3 font-bold text-amber-400">{(p.wholesalePrice || 0).toLocaleString('uz-UZ')}</td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 text-xs font-medium ${stock < 10 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {stock < 10 && <AlertTriangle className="w-3 h-3" />}
                          {stock} {p.unit || 'dona'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {p.status === 'ACTIVE'
                          ? <Badge variant="success">Faol</Badge>
                          : <Badge variant="danger">Nofaol</Badge>}
                      </td>
                      <td className="px-4 py-3">
                        {p.status === 'ACTIVE' && (
                          <button onClick={() => deactivate(p.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/30 text-red-400 border border-red-800/30 rounded-lg text-xs font-medium hover:bg-red-900/50 transition-colors">
                            <EyeOff className="w-3.5 h-3.5" /> Deaktiv
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-400 hover:text-white disabled:opacity-40 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Oldingi
          </button>
          <span className="text-sm text-slate-400">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-400 hover:text-white disabled:opacity-40 transition-colors">
            Keyingi <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;