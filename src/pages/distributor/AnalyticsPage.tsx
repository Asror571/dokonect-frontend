import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, ShoppingBag, Truck, Download,
  Package, CheckCircle2, Clock, XCircle,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import { getDistributorAnalyticsFn } from '../../api/analytics.api';
import { getOrdersFn } from '../../api/order.api';
import api from '../../api/api';
import { Badge } from '../../components/ui/Badge';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';

const COLORS = ['#6366f1', '#fbbf24', '#38bdf8', '#4ade80', '#f472b6'];

const STATUS_MAP: Record<string, { label: string; variant: string }> = {
  NEW:        { label: 'Yangi',         variant: 'warning' },
  ACCEPTED:   { label: 'Qabul qilindi', variant: 'primary' },
  ASSIGNED:   { label: 'Tayinlandi',    variant: 'info'    },
  IN_TRANSIT: { label: "Yo'lda",        variant: 'info'    },
  DELIVERED:  { label: 'Yetkazildi',    variant: 'success' },
  CANCELLED:  { label: 'Bekor',         variant: 'danger'  },
  REJECTED:   { label: 'Rad etildi',    variant: 'danger'  },
};

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('7d');

  // Analytics
  const { data: analyticsRes, isLoading } = useQuery({
    queryKey: ['distributor-analytics', period],
    queryFn: () => getDistributorAnalyticsFn(period),
    staleTime: 60_000,
    retry: false,
  });

  // Faol buyurtmalar
  const { data: ordersRes } = useQuery({
    queryKey: ['distributor-orders-active'],
    queryFn: () => getOrdersFn({ status: 'NEW' }),
    staleTime: 30_000,
    retry: false,
  });

  // Faol haydovchilar
  const { data: driversRes } = useQuery({
    queryKey: ['distributor-drivers-active'],
    queryFn: () => api.get('/api/distributor/drivers').then(r => r.data),
    staleTime: 30_000,
    retry: false,
  });

  const stats       = analyticsRes?.data || analyticsRes || {};
  const allOrders: any[] = ordersRes?.data?.orders || ordersRes?.orders || [];
  const allDrivers: any[] = driversRes?.data || driversRes?.drivers || [];
  const activeDrivers = allDrivers.filter((d: any) => d.status === 'ACTIVE' || d.status === 'ON_DELIVERY');

  const salesData = (stats.salesTrend || []).map((s: any) => ({
    name:   s.date,
    sales:  s.sales,
    orders: s.orders,
  }));

  const topProducts = (stats.topProducts || []).map((p: any) => ({
    name:     (p.product?.name || '').slice(0, 15) + '...',
    value:    p.revenue,
    quantity: p.quantity,
  }));

  const orderStats = {
    new:        allOrders.filter((o: any) => o.status === 'NEW').length        || stats.incomingOrders || 0,
    inTransit:  allOrders.filter((o: any) => o.status === 'IN_TRANSIT').length || stats.shippedOrders  || 0,
    delivered:  stats.orders?.delivered  || 0,
    cancelled:  stats.orders?.cancelled  || 0,
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
    </div>
  );

  return (
    <div className="fade-in space-y-8 max-w-7xl mx-auto pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 underline decoration-indigo-500 decoration-2 underline-offset-8 uppercase tracking-widest">
            Savdo va Tahlil
          </h1>
          <p className="text-slate-500 text-sm mt-1">Biznesingizning chuqur statistikasi va tahlili.</p>
        </div>
        <div className="flex gap-2">
          <select value={period} onChange={(e) => setPeriod(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 uppercase tracking-tight">
            <option value="7d">Oxirgi 7 kun</option>
            <option value="30d">Oxirgi 30 kun</option>
            <option value="90d">Oxirgi 90 kun</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-sm shadow-lg shadow-indigo-600/20 uppercase tracking-widest">
            <Download className="w-4 h-4" /> Hisobot
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Umumiy Savdo',  value: `${(stats.totalRevenue || 0).toLocaleString('uz-UZ')} UZS`, icon: TrendingUp, ring: 'bg-indigo-50',  tc: 'text-emerald-500', trend: "Daromad" },
          { label: 'Buyurtmalar',   value: `${stats.orders?.total || allOrders.length || 0} ta`,        icon: ShoppingBag, ring: 'bg-amber-50',   tc: 'text-amber-500',   trend: 'Jami buyurtma' },
          { label: 'Faol haydovchilar', value: `${activeDrivers.length} ta`,                           icon: Truck,       ring: 'bg-sky-50',     tc: 'text-sky-500',     trend: 'Hozir faol' },
          { label: "O'rtacha chek", value: `${(stats.avgOrderValue || 0).toLocaleString('uz-UZ')} UZS`, icon: TrendingUp, ring: 'bg-emerald-50', tc: 'text-emerald-500', trend: 'Barqaror' },
        ].map((card) => (
          <div key={card.label} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 ${card.ring} rounded-bl-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500`} />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{card.label}</p>
            <p className="text-2xl font-black text-slate-900">{card.value}</p>
            <div className={`flex items-center gap-2 ${card.tc} text-xs font-bold mt-4`}>
              <TrendingUp className="w-3 h-3" /> {card.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Buyurtmalar statusi + Faol haydovchilar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Buyurtmalar holati ── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Package className="w-5 h-5 text-violet-500" /> Buyurtmalar holati
            </h3>
            <button onClick={() => navigate('/distributor/orders')}
              className="text-xs text-violet-500 font-bold hover:text-violet-700 uppercase tracking-widest">
              Barchasi →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: 'Yangi',     value: orderStats.new,       icon: Clock,       bg: 'bg-amber-50',  c: 'text-amber-500'  },
              { label: "Yo'lda",   value: orderStats.inTransit, icon: Truck,       bg: 'bg-sky-50',    c: 'text-sky-500'    },
              { label: 'Yetkazildi', value: orderStats.delivered, icon: CheckCircle2, bg: 'bg-emerald-50', c: 'text-emerald-500' },
              { label: 'Bekor',     value: orderStats.cancelled, icon: XCircle,     bg: 'bg-red-50',    c: 'text-red-500'    },
            ].map((s) => (
              <div key={s.label} className={`flex items-center gap-3 p-4 rounded-2xl ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.c}`} />
                <div>
                  <p className={`text-2xl font-black ${s.c}`}>{s.value}</p>
                  <p className="text-xs text-slate-500 font-semibold">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* So'nggi buyurtmalar */}
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">So'nggi buyurtmalar</p>
            {allOrders.slice(0, 4).map((order: any) => {
              const info = STATUS_MAP[order.status] || { label: order.status, variant: 'secondary' };
              return (
                <div key={order.id} onClick={() => navigate(`/distributor/orders/${order.id}`)}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{order.client?.storeName || "Do'kon"}</p>
                    <p className="text-xs text-slate-400">
                      {order.createdAt ? format(new Date(order.createdAt), 'dd MMM, HH:mm', { locale: uz }) : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-violet-600">{(order.totalAmount || 0).toLocaleString('uz-UZ')} UZS</p>
                    <Badge variant={info.variant as any}>{info.label}</Badge>
                  </div>
                </div>
              );
            })}
            {allOrders.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-4">Buyurtmalar yo'q</p>
            )}
          </div>
        </div>

        {/* ── Faol haydovchilar ── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Truck className="w-5 h-5 text-sky-500" /> Faol haydovchilar
            </h3>
            <button onClick={() => navigate('/distributor/drivers')}
              className="text-xs text-sky-500 font-bold hover:text-sky-700 uppercase tracking-widest">
              Barchasi →
            </button>
          </div>

          {/* Haydovchi stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-2xl font-black text-emerald-600">
                  {allDrivers.filter((d: any) => d.status === 'ACTIVE').length}
                </p>
                <p className="text-xs text-slate-500 font-semibold">Bo'sh</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-sky-50 rounded-2xl">
              <Truck className="w-5 h-5 text-sky-500" />
              <div>
                <p className="text-2xl font-black text-sky-600">
                  {allDrivers.filter((d: any) => d.status === 'ON_DELIVERY').length}
                </p>
                <p className="text-xs text-slate-500 font-semibold">Yetkazmoqda</p>
              </div>
            </div>
          </div>

          {/* Haydovchilar ro'yxati */}
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Haydovchilar ro'yxati</p>
            {activeDrivers.slice(0, 5).map((driver: any) => (
              <div key={driver.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-black text-sm">
                    {(driver.user?.name || driver.name || 'D').charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{driver.user?.name || driver.name}</p>
                    <p className="text-xs text-slate-400">{driver.vehicleType} · {driver.vehicleNumber || driver.plateNumber || ''}</p>
                  </div>
                </div>
                <Badge variant={driver.status === 'ON_DELIVERY' ? 'info' : 'success'}>
                  {driver.status === 'ON_DELIVERY' ? "Yo'lda" : 'Bo\'sh'}
                </Badge>
              </div>
            ))}
            {activeDrivers.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-4">Faol haydovchilar yo'q</p>
            )}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-8 border-b pb-4 flex items-center gap-3 uppercase tracking-widest">
            <TrendingUp className="w-5 h-5 text-indigo-500" /> Savdo Dinamikasi
          </h3>
          <div className="h-[300px] min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-8 border-b pb-4 flex items-center gap-3 uppercase tracking-widest">
            <ShoppingBag className="w-5 h-5 text-amber-500" /> Eng Ko'p Sotilgan
          </h3>
          <div className="h-[300px] min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 50 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false}
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 'bold' }} width={100} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={25}>
                  {topProducts.map((_: any, i: number) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;