import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Ban, Shield, UserPlus, X, Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  getAdminUsersFn,
  updateAdminUserStatusFn,
  createAdminUserFn,
  updateAdminUserRoleFn,
  deleteAdminUserFn,
} from '../../api/admin.api';

const ROLES = ['', 'ADMIN', 'DISTRIBUTOR', 'DRIVER', 'CLIENT'];
const ASSIGNABLE_ROLES = ['DISTRIBUTOR', 'DRIVER', 'CLIENT', 'ADMIN'];

const ROLE_STYLE: Record<string, string> = {
  ADMIN:       'bg-purple-900/40 text-purple-300 border-purple-800/30',
  DISTRIBUTOR: 'bg-blue-900/40 text-blue-300 border-blue-800/30',
  DRIVER:      'bg-green-900/40 text-green-300 border-green-800/30',
  CLIENT:      'bg-slate-700/60 text-slate-300 border-slate-600/30',
};

const EMPTY_FORM = { name: '', phone: '', password: '', role: 'CLIENT' };

export const UsersPage = () => {
  const queryClient = useQueryClient();
  const [search,       setSearch]       = useState('');
  const [roleFilter,   setRoleFilter]   = useState('');
  const [showModal,    setShowModal]    = useState(false);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [deleteId,     setDeleteId]     = useState<string | null>(null);

  const { data: res, isLoading } = useQuery({
    queryKey: ['admin-users', roleFilter],
    queryFn: () => getAdminUsersFn({ role: roleFilter as any || undefined }),
    retry: false,
  });

  const { mutate: updateStatus, isPending: updatingStatus } = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: any }) =>
      updateAdminUserStatusFn({ userId, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Holat yangilandi');
    },
    onError: () => toast.error('Xatolik'),
  });

  const { mutate: createUser, isPending: creating } = useMutation({
    mutationFn: createAdminUserFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success("Foydalanuvchi qo'shildi");
      setShowModal(false);
      setForm(EMPTY_FORM);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xatolik'),
  });

  const { mutate: updateRole, isPending: updatingRole } = useMutation({
    mutationFn: updateAdminUserRoleFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Rol yangilandi');
      setChangingRole(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xatolik'),
  });

  const { mutate: deleteUser, isPending: deleting } = useMutation({
    mutationFn: (userId: string) => deleteAdminUserFn(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success("Foydalanuvchi o'chirildi");
      setDeleteId(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xatolik'),
  });

  const users: any[] = res?.data?.users || res?.users || res?.data || [];

  const filtered = users.filter((u: any) => {
    const q = search.toLowerCase();
    return !q || u.name?.toLowerCase().includes(q) || u.phone?.includes(q) || u.email?.toLowerCase().includes(q);
  });

  const counts = {
    total:       users.length,
    distributor: users.filter((u: any) => u.role === 'DISTRIBUTOR').length,
    driver:      users.filter((u: any) => u.role === 'DRIVER').length,
    client:      users.filter((u: any) => u.role === 'CLIENT').length,
    blocked:     users.filter((u: any) => u.status === 'SUSPENDED').length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" /> Foydalanuvchilar
          </h1>
          <p className="text-slate-400 text-sm mt-1">Barcha foydalanuvchilarni boshqarish</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Yangi foydalanuvchi
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Jami',         value: counts.total,       c: 'text-white'     },
          { label: 'Distribyutor', value: counts.distributor, c: 'text-blue-400'  },
          { label: 'Haydovchi',    value: counts.driver,      c: 'text-green-400' },
          { label: 'Mijoz',        value: counts.client,      c: 'text-slate-300' },
          { label: 'Bloklangan',   value: counts.blocked,     c: 'text-red-400'   },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className={"text-2xl font-bold " + s.c}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism, telefon yoki email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
        >
          {ROLES.map((r) => <option key={r} value={r}>{r || 'Barcha rollar'}</option>)}
        </select>
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
                  {["Foydalanuvchi", 'Telefon', 'Rol', 'Status', "Qo'shilgan", 'Amallar'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-500">Foydalanuvchilar topilmadi</td></tr>
                ) : filtered.map((user: any) => (
                  <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm shrink-0">
                          {user.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">{user.phone || ''}</td>
                    <td className="px-4 py-3">
                      {changingRole === user.id ? (
                        <div className="flex items-center gap-1">
                          <select
                            defaultValue={user.role}
                            onChange={(e) => updateRole({ userId: user.id, role: e.target.value })}
                            disabled={updatingRole}
                            className="px-2 py-1 bg-slate-800 border border-violet-500/40 rounded-lg text-xs text-white focus:outline-none"
                          >
                            {ASSIGNABLE_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                          <button onClick={() => setChangingRole(null)} className="p-1 hover:bg-slate-700 rounded">
                            <X className="w-3 h-3 text-slate-400" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setChangingRole(user.id)}
                          className={"text-xs px-2 py-1 rounded-full border font-medium cursor-pointer hover:opacity-80 transition-opacity " + (ROLE_STYLE[user.role] || 'bg-slate-800 text-slate-400 border-slate-700')}
                          title="Rolni o'zgartirish uchun bosing"
                        >
                          {user.role}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={"text-xs px-2 py-1 rounded-full border font-medium " + (
                        user.status === 'ACTIVE'    ? 'bg-emerald-900/40 text-emerald-300 border-emerald-800/30' :
                        user.status === 'SUSPENDED' ? 'bg-red-900/40 text-red-300 border-red-800/30' :
                                                      'bg-slate-700/60 text-slate-400 border-slate-600/30'
                      )}>{user.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {user.createdAt ? format(new Date(user.createdAt), 'dd MMM yyyy') : ''}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                      <button
                        disabled={updatingStatus}
                        onClick={() => updateStatus({ userId: user.id, status: user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' })}
                        className={"p-2 rounded-lg transition-colors " + (
                          user.status === 'ACTIVE'
                            ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                            : 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50'
                        )}
                        title={user.status === 'ACTIVE' ? 'Bloklash' : 'Faollashtirish'}
                      >
                        {user.status === 'ACTIVE' ? <Ban className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setDeleteId(user.id)}
                        className="p-2 rounded-lg bg-red-900/20 text-red-500 hover:bg-red-900/40 transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold mb-2">O'chirishni tasdiqlang</h3>
            <p className="text-slate-400 text-sm mb-6">Bu foydalanuvchini o'chirsangiz, barcha ma'lumotlari o'chib ketadi.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-slate-700 rounded-xl text-sm text-slate-400 hover:bg-slate-800">Bekor</button>
              <button onClick={() => deleteUser(deleteId)} disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium disabled:opacity-60">
                {deleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h3 className="text-lg font-bold">Yangi foydalanuvchi</h3>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }} className="p-1.5 hover:bg-slate-800 rounded-lg">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {([
                { key: 'name',     label: 'Ism',     placeholder: 'Aziz Karimov',   type: 'text'     },
                { key: 'phone',    label: 'Telefon', placeholder: '+998901234567',  type: 'text'     },
                { key: 'password', label: 'Parol',   placeholder: 'Kamida 6 belgi', type: 'password' },
              ] as { key: keyof typeof EMPTY_FORM; label: string; placeholder: string; type: string }[]).map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Rol</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                >
                  {ASSIGNABLE_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}
                className="flex-1 py-2.5 border border-slate-700 rounded-xl text-sm text-slate-400 hover:bg-slate-800 transition-colors"
              >
                Bekor
              </button>
              <button
                onClick={() => createUser(form)}
                disabled={creating || !form.name || !form.phone || !form.password}
                className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium disabled:opacity-60 transition-colors"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Qo'shish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};