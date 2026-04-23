import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, UserPlus, Shield, Ban } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getAdminUsersFn, updateAdminUserStatusFn } from '../../api/admin.api';

const ROLES = ['ALL', 'ADMIN', 'DISTRIBUTOR', 'DRIVER', 'CLIENT'];

export const UsersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter,  setRoleFilter]  = useState('ALL');
  const queryClient = useQueryClient();

  const { data: usersRes, isLoading } = useQuery({
    queryKey: ['admin-users', roleFilter],
    queryFn: () => getAdminUsersFn({ role: roleFilter !== 'ALL' ? roleFilter as any : undefined }),
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: any }) =>
      updateAdminUserStatusFn({ userId, status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); toast.success("Holat yangilandi"); },
    onError:   () => toast.error('Xatolik yuz berdi'),
  });

  const allUsers: any[] = usersRes?.data?.users || usersRes?.users || usersRes?.data || [];

  const filtered = allUsers.filter((u: any) => {
    const q = searchQuery.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.includes(q);
  });

  const roleBadge = (role: string) => {
    const colors: Record<string,string> = { ADMIN:'bg-purple-100 text-purple-700', DISTRIBUTOR:'bg-blue-100 text-blue-700', DRIVER:'bg-green-100 text-green-700', CLIENT:'bg-gray-100 text-gray-700' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role]||'bg-gray-100 text-gray-700'}`}>{role}</span>;
  };
  const statusBadge = (status: string) => {
    const colors: Record<string,string> = { ACTIVE:'bg-green-100 text-green-700', SUSPENDED:'bg-red-100 text-red-700', INACTIVE:'bg-gray-100 text-gray-700' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]||'bg-gray-100 text-gray-700'}`}>{status}</span>;
  };

  const columns = [
    {
      key: 'name', label: 'Foydalanuvchi', sortable: true,
      render: (user: any) => (
        <div className="flex items-center gap-3">
          {user.avatar ? <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" /> : (
            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold">{user.name?.charAt(0)}</div>
          )}
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email || user.phone}</p>
          </div>
        </div>
      ),
    },
    { key: 'role',      label: 'Rol',     sortable: true, render: (u: any) => roleBadge(u.role) },
    { key: 'status',    label: 'Holat',   sortable: true, render: (u: any) => statusBadge(u.status) },
    { key: 'createdAt', label: "Qo'shilgan", sortable: true, render: (u: any) => format(new Date(u.createdAt), 'MMM dd, yyyy') },
    {
      key: 'actions', label: 'Amallar',
      render: (user: any) => (
        <button
          onClick={(e) => { e.stopPropagation(); updateStatus({ userId: user.id, status: user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }); }}
          className={`p-2 rounded-lg transition-colors ${user.status === 'ACTIVE' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
          title={user.status === 'ACTIVE' ? "Bloklash" : "Faollashtirish"}
        >
          {user.status === 'ACTIVE' ? <Ban className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
        </button>
      ),
    },
  ];

  const statCards = [
    { label: 'Jami', count: allUsers.length, bg: 'bg-purple-100', c: 'text-purple-600' },
    { label: 'Distribyutor', count: allUsers.filter((u:any)=>u.role==='DISTRIBUTOR').length, bg:'bg-blue-100', c:'text-blue-600' },
    { label: 'Haydovchi', count: allUsers.filter((u:any)=>u.role==='DRIVER').length, bg:'bg-green-100', c:'text-green-600' },
    { label: 'Mijoz', count: allUsers.filter((u:any)=>u.role==='CLIENT').length, bg:'bg-gray-100', c:'text-gray-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Foydalanuvchilar</h1>
            <p className="text-gray-600 mt-1">Barcha foydalanuvchilarni boshqarish</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors">
            <UserPlus className="w-5 h-5" /> Qo'shish
          </button>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {statCards.map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`p-3 ${s.bg} rounded-lg`}><Users className={`w-6 h-6 ${s.c}`} /></div>
                <div>
                  <p className="text-sm text-gray-600">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{s.count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Ism, email yoki telefon..." value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <select value={roleFilter} onChange={(e)=>setRoleFilter(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
              {ROLES.map((r) => <option key={r} value={r}>{r === 'ALL' ? 'Barcha rollar' : r}</option>)}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
            <p className="text-gray-600 mt-2">Yuklanmoqda...</p>
          </div>
        ) : (
          <DataTable data={filtered} columns={columns} searchable={false} />
        )}
      </div>
    </div>
  );
};