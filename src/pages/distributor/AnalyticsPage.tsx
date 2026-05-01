import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, ShoppingBag, Truck, Download,
  Package, CheckCircle2, Clock, XCircle, CalendarDays, X, Store,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import { DayPicker, DateRange } from 'react-day-picker';
import { getDistributorAnalyticsFn } from '../../api/analytics.api';
import { getOrdersFn } from '../../api/order.api';
import api from '../../api/api';
import { Badge } from '../../components/ui/Badge';
import { format, subDays } from 'date-fns';
import { uz } from 'date-fns/locale';
import 'react-day-picker/style.css';

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
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [modalType, setModalType] = useState<'sales' | null>(null);
  const [range, setRange] = useState<DateRange>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fromStr = range.from ? format(range.from, 'yyyy-MM-dd') : undefined;
  const toStr   = range.to   ? format(range.to,   'yyyy-MM-dd') : undefined;

  const rangeLabel = range.from && range.to
    ? `${format(range.from, 'd MMM', { locale: uz })} — ${format(range.to, 'd MMM yyyy', { locale: uz })}`
    : 'Sana tanlang';

  // Analytics
  const { data: analyticsRes, isLoading } = useQuery({
    queryKey: ['distributor-analytics', fromStr, toStr],
    queryFn: () => getDistributorAnalyticsFn({ from: fromStr, to: toStr }),
    enabled: !!fromStr,
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
        <div className="flex gap-2 items-center">
          {/* Date range picker */}
          <div className="relative" ref={calendarRef}>
            <button
              onClick={() => setCalendarOpen(v => !v)}
              className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-indigo-400 transition-all outline-none focus:ring-2 focus:ring-indigo-500/30 min-w-55"
            >
              <CalendarDays className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{rangeLabel}</span>
            </button>

            {calendarOpen && (
              <div className="absolute right-0 top-12 z-50 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/10 p-3">
                <DayPicker
                  mode="range"
                  selected={range}
                  onSelect={(r) => {
                    if (r) { setRange(r); if (r.from && r.to) setCalendarOpen(false); }
                  }}
                  locale={uz}
                  disabled={{ after: new Date() }}
                  numberOfMonths={2}
                  className="text-sm"
                />
                {/* Quick presets */}
                <div className="flex gap-2 border-t border-slate-100 pt-2 mt-1">
                  {[
                    { label: '7 kun',  days: 7  },
                    { label: '30 kun', days: 30 },
                    { label: '90 kun', days: 90 },
                  ].map(({ label, days }) => (
                    <button
                      key={days}
                      onClick={() => { setRange({ from: subDays(new Date(), days), to: new Date() }); setCalendarOpen(false); }}
                      className="flex-1 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-sm shadow-lg shadow-indigo-600/20 uppercase tracking-widest">
            <Download className="w-4 h-4" /> Hisobot
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: 'Umumiy Savdo', value: `${(stats.totalRevenue || 0).toLocaleString('uz-UZ')} UZS`,
            icon: TrendingUp, ring: 'bg-indigo-50', tc: 'text-emerald-500', trend: 'Do\'konlar bo\'yicha →',
            onClick: () => setModalType('sales'),
          },
          {
            label: 'Buyurtmalar', value: `${stats.orders?.total || allOrders.length || 0} ta`,
            icon: ShoppingBag, ring: 'bg-amber-50', tc: 'text-amber-500', trend: 'Barchasi →',
            onClick: () => navigate('/distributor/orders'),
          },
          {
            label: 'Faol haydovchilar', value: `${activeDrivers.length} ta`,
            icon: Truck, ring: 'bg-sky-50', tc: 'text-sky-500', trend: 'Haydovchilar →',
            onClick: () => navigate('/distributor/drivers'),
          },
          {
            label: "O'rtacha chek", value: `${(stats.avgOrderValue || 0).toLocaleString('uz-UZ')} UZS`,
            icon: TrendingUp, ring: 'bg-emerald-50', tc: 'text-emerald-500', trend: 'Barqaror',
            onClick: undefined,
          },
        ].map((card) => (
          <div
            key={card.label}
            onClick={card.onClick}
            className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group transition-all ${card.onClick ? 'cursor-pointer hover:shadow-lg hover:border-indigo-200 active:scale-[0.98]' : ''}`}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 ${card.ring} rounded-bl-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500`} />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{card.label}</p>
            <p className="text-2xl font-black text-slate-900">{card.value}</p>
            <div className={`flex items-center gap-2 ${card.tc} text-xs font-bold mt-4`}>
              <TrendingUp className="w-3 h-3" /> {card.trend}
            </div>
          </div>
        ))}
      </div>

      {/* ── Umumiy Savdo modal ── */}
      {modalType === 'sales' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalType(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <Store className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-base">Do'konlar bo'yicha savdo</h2>
                  <p className="text-xs text-slate-400 font-semibold">{rangeLabel}</p>
                </div>
              </div>
              <button onClick={() => setModalType(null)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-2">
              {(stats.clientBreakdown || []).length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-8">Ma'lumot yo'q</p>
              ) : (
                (stats.clientBreakdown as any[]).map((client: any, i: number) => (
                  <div key={client.clientId || i} className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-2xl hover:bg-indigo-50 transition-colors">
                    <span className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-600 text-xs font-black flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{client.storeName}</p>
                      <p className="text-xs text-slate-400 font-semibold">{client.ordersCount} ta buyurtma</p>
                    </div>
                    <p className="text-sm font-black text-indigo-600 shrink-0">
                      {(client.totalRevenue || 0).toLocaleString('uz-UZ')} UZS
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Footer total */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Jami</span>
              <span className="text-base font-black text-slate-900">
                {(stats.totalRevenue || 0).toLocaleString('uz-UZ')} UZS
              </span>
            </div>
          </div>
        </div>
      )}

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