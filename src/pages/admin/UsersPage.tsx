import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Ban, Shield, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getAdminUsersFn, updateAdminUserStatusFn } from '../../api/admin.api';

const ROLES = ['', 'ADMIN', 'DISTRIBUTOR', 'DRIVER', 'CLIENT'];

const ROLE_STYLE: Record<string, string> = {
  ADMIN:       'bg-purple-900/40 text-purple-300 border-purple-800/30',
  DISTRIBUTOR: 'bg-blue-900/40 text-blue-300 border-blue-800/30',
  DRIVER:      'bg-green-900/40 text-green-300 border-green-800/30',
  CLIENT:      'bg-slate-700/60 text-slate-300 border-slate-600/30',
};

export const UsersPage = () => {
  const queryClient = useQueryClient();
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { data: res, isLoading } = useQuery({
    queryKey: ['admin-users', roleFilter],
    queryFn: () => getAdminUsersFn({ role: roleFilter as any || undefined }),
    retry: false,
  });

  const { mutate: updateStatus, isPending: updating } = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: any }) =>
      updateAdminUserStatusFn({ userId, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Holat yangilandi');
    },
    onError: () => toast.error('Xatolik'),
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" /> Foydalanuvchilar
          </h1>
          <p className="text-slate-400 text-sm mt-1">Barcha foydalanuvchilarni boshqarish</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors">
          <UserPlus className="w-4 h-4" /> Yangi foydalanuvchi
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Jami',         value: counts.total,       c: 'text-white'        },
          { label: 'Distribyutor', value: counts.distributor, c: 'text-blue-400'     },
          { label: 'Haydovchi',    value: counts.driver,      c: 'text-green-400'    },
          { label: 'Mijoz',        value: counts.client,      c: 'text-slate-300'    },
          { label: 'Bloklangan',   value: counts.blocked,     c: 'text-red-400'      },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.c}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism, telefon yoki email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40">
          {ROLES.map((r) => <option key={r} value={r}>{r || 'Barcha rollar'}</option>)}
        </select>
      </div>

      {/* Table */}
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
                  {['Foydalanuvchi', 'Telefon', 'Rol', 'Status', "Qo'shilgan", 'Amallar'].map((h) => (
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
                          <p className="text-xs text-slate-500">{user.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">{user.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${ROLE_STYLE[user.role] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${
                        user.status === 'ACTIVE'    ? 'bg-emerald-900/40 text-emerald-300 border-emerald-800/30' :
                        user.status === 'SUSPENDED' ? 'bg-red-900/40 text-red-300 border-red-800/30'            :
                                                      'bg-slate-700/60 text-slate-400 border-slate-600/30'
                      }`}>{user.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {user.createdAt ? format(new Date(user.createdAt), 'dd MMM yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        disabled={updating}
                        onClick={() => updateStatus({ userId: user.id, status: user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' })}
                        className={`p-2 rounded-lg transition-colors ${
                          user.status === 'ACTIVE'
                            ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                            : 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50'
                        }`}
                        title={user.status === 'ACTIVE' ? 'Bloklash' : 'Faollashtirish'}
                      >
                        {user.status === 'ACTIVE' ? <Ban className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};