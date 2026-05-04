import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign, ShoppingCart, Users, Store, TrendingUp, Package, Truck, CreditCard, Activity,
} from 'lucide-react';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { getAdminDashboardFn, getAdminAnalyticsFn } from '../../api/admin.api';

const PERIODS = [
  { value: '7d',  label: '7 kun'  },
  { value: '30d', label: '30 kun' },
  { value: '90d', label: '90 kun' },
];

const STATUS_LABEL: Record<string, string> = {
  NEW: 'Yangi', ACCEPTED: 'Qabul', ASSIGNED: 'Tayinlandi',
  IN_TRANSIT: "Yo'lda", DELIVERED: 'Yetkazildi',
  CANCELLED: 'Bekor', REJECTED: 'Rad',
};

const GlobalDashboard = () => {
  const [period, setPeriod] = useState('30d');

  const { data: dashRes, isLoading } = useQuery({
    queryKey: ['admin-global-dashboard'],
    queryFn: getAdminDashboardFn,
    refetchInterval: 30_000,
    retry: false,
  });

  const { data: analyticsRes } = useQuery({
    queryKey: ['admin-analytics', period],
    queryFn: () => getAdminAnalyticsFn(period),
    retry: false,
  });

  const stats    = dashRes?.data  || dashRes  || {};
  const gmv      = stats.gmv      || {};
  const orders   = stats.orders   || {};
  const users    = stats.users    || {};
  const products = stats.products || {};
  const platform = stats.platform || {};
  const payments = stats.payments || {};

  const growthData: any[] = analyticsRes?.data?.salesTrend || analyticsRes?.salesTrend || [];
  const recentOrders: any[] = stats.recentOrders || [];
  const recentUsers: any[]  = stats.recentUsers  || [];

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Global analitika va monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-900 rounded-xl border border-slate-800 text-right">
            <p className="text-xs text-slate-400">Platform daromadi</p>
            <p className="text-lg font-bold text-emerald-400">{(platform.revenue||0).toLocaleString('uz-UZ')} UZS</p>
            <p className="text-[10px] text-slate-500">Komissiya: {platform.commission||0}%</p>
          </div>
          <div className={`w-3 h-3 rounded-full bg-emerald-500 animate-pulse`} title="Real-time" />
        </div>
      </div>

      {/* KPI Cards — Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Umumiy GMV',
            value: (gmv.total||0).toLocaleString('uz-UZ') + ' UZS',
            icon: DollarSign, c: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-800/30',
            subs: [
              { label: 'Bugun',   val: (gmv.today  ||0).toLocaleString('uz-UZ') + ' UZS' },
              { label: 'Haftalik', val: (gmv.weekly ||0).toLocaleString('uz-UZ') + ' UZS' },
              { label: 'Oylik',   val: (gmv.monthly||0).toLocaleString('uz-UZ') + ' UZS' },
            ],
          },
          {
            label: 'To\'lovlar',
            value: (payments.total||0).toLocaleString('uz-UZ') + ' UZS',
            icon: CreditCard, c: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-800/30',
            subs: [
              { label: 'Naqd',   val: (payments.cash  ||0).toLocaleString('uz-UZ') + ' UZS' },
              { label: 'Online', val: (payments.online||0).toLocaleString('uz-UZ') + ' UZS' },
            ],
          },
          {
            label: 'Buyurtmalar',
            value: orders.total||0,
            icon: ShoppingCart, c: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-800/30',
            subs: [
              { label: 'Bugun',  val: orders.today  || 0 },
              { label: 'Hafta',  val: orders.weekly || 0 },
              { label: 'Faol',   val: orders.active || 0 },
            ],
          },
          {
            label: 'Foydalanuvchilar',
            value: (users.distributors?.active||0) + (users.shops?.active||0),
            icon: Users, c: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-800/30',
            subs: [
              { label: 'Distribyutor', val: users.distributors?.active || 0 },
              { label: "Do'kon",       val: users.shops?.active        || 0 },
              { label: 'Haydovchi',    val: users.drivers?.online      || 0 },
            ],
          },
        ].map((card) => (
          <div key={card.label} className={`bg-slate-900 border ${card.border} rounded-2xl p-5`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.c}`} />
              </div>
              <div>
                <p className="text-xs text-slate-400">{card.label}</p>
                <p className={`text-xl font-bold ${card.c}`}>{card.value}</p>
              </div>
            </div>
            <div className="space-y-1 pt-3 border-t border-slate-800">
              {card.subs.map((s) => (
                <div key={s.label} className="flex justify-between text-xs">
                  <span className="text-slate-500">{s.label}</span>
                  <span className="text-slate-300 font-medium">{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* KPI Cards — Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Mahsulotlar',    value: products.total||0, sub: `Kam qolgan: ${products.lowStock||0}`,    icon: Package,  bg: 'bg-amber-500/10',  c: 'text-amber-400'  },
          { label: 'Faol do\'konlar', value: users.shops?.active||0, sub: `Jami: ${users.shops?.total||0}`,  icon: Store,    bg: 'bg-violet-500/10', c: 'text-violet-400' },
          { label: 'Faol haydovchilar', value: users.drivers?.online||0, sub: `Jami: ${users.drivers?.total||0}`, icon: Truck, bg: 'bg-cyan-500/10',   c: 'text-cyan-400'   },
          { label: 'Faol distribyutorlar', value: users.distributors?.active||0, sub: `Jami: ${users.distributors?.total||0}`, icon: TrendingUp, bg: 'bg-indigo-500/10', c: 'text-indigo-400' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon className={`w-6 h-6 ${s.c}`} />
            </div>
            <div>
              <p className="text-xs text-slate-400">{s.label}</p>
              <p className={`text-2xl font-bold ${s.c}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold">GMV va Buyurtmalar tendensiyasi</h2>
          </div>
          <div className="flex gap-1 bg-slate-800 p-1 rounded-xl">
            {PERIODS.map((p) => (
              <button key={p.value} onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p.value ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        {growthData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#475569" fontSize={11}
                tickFormatter={(v) => { try { return format(new Date(v), 'MMM dd'); } catch { return v; } }} />
              <YAxis stroke="#475569" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }}
                labelFormatter={(v) => { try { return format(new Date(v), 'PPP', { locale: uz }); } catch { return v; } }}
              />
              <Legend />
              <Line type="monotone" dataKey="sales"  name="Daromad"     stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="orders" name="Buyurtmalar" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-slate-500">
            <TrendingUp className="w-12 h-12 opacity-20" />
          </div>
        )}
      </div>

      {/* Recent tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Oxirgi buyurtmalar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-blue-400" /> So'nggi buyurtmalar
            </h3>
            <Activity className="w-4 h-4 text-slate-500 animate-pulse" />
          </div>
          <div className="space-y-2">
            {recentOrders.length > 0 ? recentOrders.slice(0, 6).map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors">
                <div>
                  <p className="text-sm font-semibold">{order.client?.storeName || "Do'kon"}</p>
                  <p className="text-xs text-slate-400">{order.distributor?.companyName || order.distributor?.user?.name || '—'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">{(order.totalAmount||0).toLocaleString('uz-UZ')} UZS</p>
                  <div className="flex items-center gap-1 justify-end mt-0.5">
                    <span className="text-[10px] text-slate-400">{order.createdAt ? format(new Date(order.createdAt), 'HH:mm') : ''}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      order.status === 'DELIVERED' ? 'bg-emerald-900/50 text-emerald-400' :
                      order.status === 'NEW'       ? 'bg-amber-900/50 text-amber-400'    :
                      order.status === 'CANCELLED' ? 'bg-red-900/50 text-red-400'        :
                                                     'bg-blue-900/50 text-blue-400'
                    }`}>{STATUS_LABEL[order.status] || order.status}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-slate-500 text-sm">Buyurtmalar yo'q</div>
            )}
          </div>
        </div>

        {/* So'nggi foydalanuvchilar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-bold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" /> So'nggi foydalanuvchilar
          </h3>
          <div className="space-y-2">
            {recentUsers.length > 0 ? recentUsers.slice(0, 6).map((u: any) => (
              <div key={u.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-violet-400">{u.name?.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.phone || u.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                    u.role === 'DISTRIBUTOR' ? 'bg-blue-900/50 text-blue-400' :
                    u.role === 'DRIVER'      ? 'bg-green-900/50 text-green-400' :
                                               'bg-slate-700 text-slate-300'
                  }`}>{u.role}</span>
                  <p className="text-[10px] text-slate-500 mt-1">{u.createdAt ? format(new Date(u.createdAt), 'dd MMM') : ''}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-slate-500 text-sm">Foydalanuvchilar yo'q</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalDashboard;