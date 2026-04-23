import { useQuery } from '@tanstack/react-query';
import { DollarSign, ShoppingCart, Users, Store, TrendingUp, AlertTriangle, Package, Truck } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getAdminDashboardFn, getAdminAnalyticsFn } from '../../api/admin.api';

const GlobalDashboard = () => {
  const { data: dashRes, isLoading } = useQuery({
    queryKey: ['admin-global-dashboard'],
    queryFn: getAdminDashboardFn,
    refetchInterval: 30_000,
  });

  const { data: analyticsRes } = useQuery({
    queryKey: ['admin-analytics', '30d'],
    queryFn: () => getAdminAnalyticsFn('30d'),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
    </div>
  );

  const stats    = dashRes?.data  || dashRes  || {};
  const gmv      = stats.gmv      || {};
  const orders   = stats.orders   || {};
  const users    = stats.users    || {};
  const debt     = stats.debt     || {};
  const products = stats.products || {};
  const platform = stats.platform || {};
  const growthData: any[] = analyticsRes?.data?.salesTrend || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platform Dashboard</h1>
          <p className="text-slate-400 mt-1">Global analytics va monitoring</p>
        </div>
        <div className="px-4 py-2 bg-slate-900 rounded-xl border border-slate-800">
          <span className="text-sm text-slate-400">Platform daromadi</span>
          <p className="text-xl font-bold text-emerald-400">{(platform.revenue||0).toLocaleString('uz-UZ')} UZS</p>
          <span className="text-xs text-slate-500">Komissiya: {platform.commission||0}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Umumiy GMV',      value: (gmv.total||0).toLocaleString('uz-UZ'),   icon: DollarSign,   from:'from-emerald-900/20', border:'border-emerald-800/30', c:'text-emerald-400', sub:`Bugun: ${(gmv.today||0).toLocaleString()}`, badge: gmv.growth },
          { label: 'Jami buyurtmalar', value: orders.total||0,                          icon: ShoppingCart, from:'from-blue-900/20',    border:'border-blue-800/30',    c:'text-blue-400',    sub:`Bugun: ${orders.today||0} | Faol: ${orders.active||0}` },
          { label: 'Faol foydalanuvchilar', value:(users.distributors?.active||0)+(users.shops?.active||0), icon:Users, from:'from-purple-900/20', border:'border-purple-800/30', c:'text-purple-400', sub:`Dist: ${users.distributors?.total||0} | Do'kon: ${users.shops?.total||0}` },
          { label: 'Jami qarz',        value: (debt.total||0).toLocaleString('uz-UZ'),  icon: AlertTriangle, from:'from-red-900/20',  border:'border-red-800/30',     c:'text-red-400',     sub:`Muddati o'tgan: ${(debt.overdue||0).toLocaleString()}` },
        ].map((card) => (
          <div key={card.label} className={`bg-gradient-to-br ${card.from} border ${card.border} rounded-2xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                <card.icon className={`w-6 h-6 ${card.c}`} />
              </div>
              {(card as any).badge !== undefined && (
                <Badge variant={(card as any).badge >= 0 ? 'success' : 'danger'}>
                  {(card as any).badge >= 0 ? '+' : ''}{Number((card as any).badge).toFixed(1)}%
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-400 mb-1">{card.label}</p>
            <p className={`text-3xl font-bold ${card.c}`}>{card.value}</p>
            <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-white/5">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">GMV tendensiyasi</h2>
            <p className="text-sm text-slate-400">Oxirgi 30 kun</p>
          </div>
          <TrendingUp className="w-6 h-6 text-emerald-400" />
        </div>
        {growthData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={growthData}>
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickFormatter={(v) => format(new Date(v), 'MMM dd')} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} labelFormatter={(v) => format(new Date(v), 'PPP', { locale: uz })} />
              <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-slate-500">Ma'lumot yo'q</div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Mahsulotlar', value: products.total||0, sub: `Kam qolgan: ${products.lowStock||0}`, icon: Package, bg: 'bg-amber-500/10', c: 'text-amber-400' },
          { label: 'Haydovchilar', value: users.drivers?.total||0, sub: `Online: ${users.drivers?.online||0}`, icon: Truck, bg: 'bg-cyan-500/10', c: 'text-cyan-400' },
          { label: "Faol do'konlar", value: users.shops?.active||0, sub: `Jami: ${users.shops?.total||0}`, icon: Store, bg: 'bg-violet-500/10', c: 'text-violet-400' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}><s.icon className={`w-5 h-5 ${s.c}`} /></div>
              <div>
                <p className="text-sm text-slate-400">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">So'nggi buyurtmalar</h3>
          <div className="space-y-3">
            {(stats.recentOrders||[]).slice(0,5).map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                <div className="flex-1">
                  <p className="font-semibold text-sm">{order.client?.storeName || "Do'kon"}</p>
                  <p className="text-xs text-slate-400">{order.distributor?.user?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{(order.totalAmount||0).toLocaleString('uz-UZ')} UZS</p>
                  <p className="text-xs text-slate-400">{format(new Date(order.createdAt), 'HH:mm')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">So'nggi foydalanuvchilar</h3>
          <div className="space-y-3">
            {(stats.recentUsers||[]).slice(0,5).map((user: any) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-violet-400">{user.name?.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.phone}</p>
                  </div>
                </div>
                <Badge variant={user.role === 'DISTRIBUTOR' ? 'primary' : 'secondary'}>{user.role}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalDashboard;