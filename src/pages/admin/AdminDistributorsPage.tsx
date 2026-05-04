import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, Search, Plus, Edit3, Trash2, X, Loader2, Phone, MapPin, Star, DollarSign, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAdminDistributorsFn, createAdminDistributorFn,
  updateAdminDistributorFn, deleteAdminDistributorFn,
} from '../../api/admin.api';

const AdminDistributorsPage = () => {
  const queryClient = useQueryClient();
  const [search,   setSearch]   = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing,  setEditing]  = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', region: '' });

  const { data: res, isLoading } = useQuery({
    queryKey: ['admin-distributors'],
    queryFn: getAdminDistributorsFn,
    retry: false,
  });

  const distributors: any[] = res?.data?.distributors || res?.distributors || res?.data || [];

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: (data: any) => editing
      ? updateAdminDistributorFn({ id: editing.id, data })
      : createAdminDistributorFn(data),
    onSuccess: () => {
      toast.success(editing ? 'Yangilandi' : "Qo'shildi");
      queryClient.invalidateQueries({ queryKey: ['admin-distributors'] });
      closeModal();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xatolik'),
  });

  const { mutate: del, isPending: deleting } = useMutation({
    mutationFn: deleteAdminDistributorFn,
    onSuccess: () => {
      toast.success("O'chirildi");
      queryClient.invalidateQueries({ queryKey: ['admin-distributors'] });
      setDeleteId(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xatolik'),
  });

  const openCreate = () => { setEditing(null); setForm({ name: '', phone: '', email: '', address: '', region: '' }); setShowModal(true); };
  const openEdit   = (d: any) => { setEditing(d); setForm({ name: d.companyName || d.user?.name || '', phone: d.phone || d.user?.phone || '', email: d.email || d.user?.email || '', address: d.address || '', region: d.region || '' }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const filtered = distributors.filter((d: any) => {
    const q = search.toLowerCase();
    return !q || (d.companyName || '').toLowerCase().includes(q) || (d.user?.name || '').toLowerCase().includes(q) || (d.phone || '').includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="w-6 h-6 text-cyan-400" /> Distribyutorlar
          </h1>
          <p className="text-slate-400 text-sm mt-1">{distributors.length} ta distribyutor</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Yangi distribyutor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Jami',    value: distributors.length,                                              c: 'text-white'        },
          { label: 'Faol',    value: distributors.filter((d: any) => d.status === 'ACTIVE').length,   c: 'text-emerald-400'  },
          { label: 'Nofaol',  value: distributors.filter((d: any) => d.status !== 'ACTIVE').length,  c: 'text-red-400'      },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.c}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Nomi yoki telefon..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d: any) => (
            <div key={d.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center font-bold text-cyan-400 text-lg">
                    {(d.companyName || d.user?.name || 'D').charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-white">{d.companyName || d.user?.name}</p>
                    <p className="text-xs text-slate-400">{d.user?.name || ''}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(d)} className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(d.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                {(d.phone || d.user?.phone) && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{d.phone || d.user?.phone}</span>
                  </div>
                )}
                {(d.region || d.address) && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{d.region || d.address}</span>
                  </div>
                )}
                {d.rating !== undefined && (
                  <div className="flex items-center gap-2 text-sm text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400 shrink-0" />
                    <span>{Number(d.rating || 0).toFixed(1)}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-center">
                {[
                  { label: "Do'konlar",  value: d._count?.connections || d.clientsCount || 0,               c: 'text-white'        },
                  { label: 'Yetkazildi', value: d.deliveredOrders || d._count?.deliveredOrders || 0, c: 'text-emerald-400'  },
                  { label: 'Faol',       value: d.activeOrders   || d._count?.activeOrders    || 0, c: 'text-amber-400'    },
                  { label: 'Haydovchi',  value: d._count?.drivers || d.driversCount || 0,              c: 'text-slate-300'    },
                ].map((s) => (
                  <div key={s.label}>
                    <p className={`text-sm font-bold ${(s as any).c || "text-white"}`}>{s.value}</p>
                    <p className="text-[10px] text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Revenue */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-slate-800/50 rounded-xl p-2.5 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <DollarSign className="w-3 h-3 text-emerald-400" />
                    <p className="text-[10px] text-slate-500">Umumiy daromad</p>
                  </div>
                  <p className="text-xs font-bold text-emerald-400">
                    {d.totalRevenue ? ((d.totalRevenue) / 1_000_000).toFixed(1) + 'M UZS' : '—'}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-2.5 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="w-3 h-3 text-sky-400" />
                    <p className="text-[10px] text-slate-500">Oylik daromad</p>
                  </div>
                  <p className="text-xs font-bold text-sky-400">
                    {d.monthlyRevenue ? ((d.monthlyRevenue) / 1_000_000).toFixed(1) + 'M UZS' : '—'}
                  </p>
                </div>
              </div>

              {d.clients && d.clients.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-800">
                  <p className="text-[10px] text-slate-500 mb-1.5">Biriktirilgan do’konlar</p>
                  <div className="flex flex-wrap gap-1">
                    {d.clients.slice(0, 3).map((cl: any) => (
                      <span key={cl.id} className="text-[10px] px-2 py-0.5 bg-cyan-900/30 text-cyan-400 rounded-full border border-cyan-800/30">
                        {cl.storeName || cl.name}
                      </span>
                    ))}
                    {d.clients.length > 3 && (
                      <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full">
                        +{d.clients.length - 3} ta
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-12 text-slate-500">Distribyutorlar topilmadi</div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h3 className="text-lg font-bold">{editing ? 'Tahrirlash' : 'Yangi distribyutor'}</h3>
              <button onClick={closeModal} className="p-1.5 hover:bg-slate-800 rounded-lg">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { key: 'name',    label: 'Kompaniya nomi', placeholder: 'ABC MChJ'        },
                { key: 'phone',   label: 'Telefon',        placeholder: '+998901234567'   },
                { key: 'email',   label: 'Email',          placeholder: 'info@abc.uz'     },
                { key: 'region',  label: 'Hudud',          placeholder: 'Toshkent'        },
                { key: 'address', label: 'Manzil',         placeholder: 'Chilonzor, 1-uy' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">{label}</label>
                  <input value={(form as any)[key]} onChange={(e) => setForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={closeModal} className="flex-1 py-2.5 border border-slate-700 rounded-xl text-sm text-slate-400 hover:bg-slate-800 transition-colors">Bekor</button>
              <button onClick={() => save(form)} disabled={saving || !form.name}
                className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium disabled:opacity-60 transition-colors">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : editing ? 'Saqlash' : "Qo'shish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold mb-2">O'chirishni tasdiqlang</h3>
            <p className="text-slate-400 text-sm mb-6">Bu distribyutorni o'chirsangiz, barcha ma'lumotlari o'chib ketadi.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-slate-700 rounded-xl text-sm text-slate-400 hover:bg-slate-800">Bekor</button>
              <button onClick={() => del(deleteId)} disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium disabled:opacity-60">
                {deleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDistributorsPage;