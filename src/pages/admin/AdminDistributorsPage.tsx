import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Loader2, Package, ShoppingCart, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/api';

const fetchDistributors = async () => {
  const res = await api.get('/api/admin/distributors');
  return res.data?.data || res.data || [];
};

export default function AdminDistributorsPage() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-distributors'],
    queryFn: fetchDistributors,
  });

  const { mutate: verify, isPending: verifying } = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      api.patch(`/api/admin/distributors/${id}`, { isVerified: value }),
    onSuccess: (_, vars) => {
      toast.success(vars.value ? 'Distribyutor tasdiqlandi' : 'Tasdiqlash bekor qilindi');
      queryClient.invalidateQueries({ queryKey: ['admin-distributors'] });
    },
    onError: () => toast.error('Xatolik yuz berdi'),
  });

  const filtered = data.filter((d: any) =>
    (d.companyName || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.user?.phone || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Distribyutorlar</h1>
          <p className="text-slate-500 text-sm mt-0.5">{data.length} ta distribyutor</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Qidirish..."
            className="pl-9 pr-4 h-9 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 w-60"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-violet-600" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Kompaniya</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Telefon</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Mahsulotlar</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Buyurtmalar</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Holat</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((d: any) => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{d.companyName}</p>
                    <p className="text-xs text-slate-400">{d.user?.name}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{d.user?.phone || d.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-slate-600">
                      <Package className="w-3.5 h-3.5" />
                      {d._count?.products ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-slate-600">
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {d._count?.orders ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {d.isVerified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        <CheckCircle className="w-3 h-3" />
                        Tasdiqlangan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                        <XCircle className="w-3 h-3" />
                        Tasdiqlanmagan
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {d.isVerified ? (
                      <button
                        onClick={() => verify({ id: d.id, value: false })}
                        disabled={verifying}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        Bekor qilish
                      </button>
                    ) : (
                      <button
                        onClick={() => verify({ id: d.id, value: true })}
                        disabled={verifying}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-50"
                      >
                        Tasdiqlash
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">Distribyutorlar topilmadi</div>
          )}
        </div>
      )}
    </div>
  );
}
