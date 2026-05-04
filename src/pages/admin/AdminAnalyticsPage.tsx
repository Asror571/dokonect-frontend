import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Package, Store, Truck, BarChart2 } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { format } from 'date-fns';
import { getAdminAnalyticsFn } from '../../api/admin.api';

const PERIODS = [
  { value: '7d',  label: '7 kun'  },
  { value: '30d', label: '30 kun' },
  { value: '90d', label: '90 kun' },
];

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];

const AdminAnalyticsPage = () => {
  const [period, setPeriod] = useState('30d');

  const { data: res, isLoading } = useQuery({
    queryKey: ['admin-analytics', period],
    queryFn: () => getAdminAnalyticsFn(period),
    retry: false,
  });

  const data = res?.data || res || {};

  const salesTrend: any[]    = data.salesTrend    || [];
  const topProducts: any[]   = data.topProducts   || [];
  const topStores: any[]     = data.topStores     || [];
  const topDistributors: any[] = data.topDistributors || [];
  const categoryBreakdown: any[] = data.categoryBreakdown || [];

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-violet-400" /> Analitika va Hisobotlar
          </h1>
          <p className="text-slate-400 text-sm mt-1">Tizim faoliyatini chuqur tahlil qilish</p>
        </div>
        <div className="flex gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          {PERIODS.map((p) => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p.value ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sales trend */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-base font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" /> O'sish statistikasi
        </h2>
        {salesTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={salesTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#475569" fontSize={11}
                tickFormatter={(v) => { try { return format(new Date(v), 'MMM dd'); } catch { return v; } }} />
              <YAxis stroke="#475569" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
              <Legend />
              <Line type="monotone" dataKey="sales"  name="Daromad (UZS)" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="orders" name="Buyurtmalar"   stroke="#8b5cf6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-slate-500 text-sm">Ma'lumot yo'q</div>
        )}
      </div>

      {/* Top products + Top stores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Eng ko'p sotilgan mahsulotlar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-bold mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-400" /> Eng ko'p sotilgan mahsulotlar
          </h3>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.slice(0, 8).map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{p.product?.name || p.name || `Mahsulot ${i+1}`}</p>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1">
                      <div className="h-1.5 rounded-full" style={{
                        width: `${Math.min(100, (p.quantity / (topProducts[0]?.quantity || 1)) * 100)}%`,
                        backgroundColor: COLORS[i % COLORS.length],
                      }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-amber-400">{(p.revenue||0).toLocaleString('uz-UZ')}</p>
                    <p className="text-xs text-slate-500">{p.quantity} dona</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">Ma'lumot yo'q</div>
          )}
        </div>

        {/* Eng aktiv do'konlar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-bold mb-4 flex items-center gap-2">
            <Store className="w-4 h-4 text-violet-400" /> Eng aktiv do'konlar
          </h3>
          {topStores.length > 0 ? (
            <div className="space-y-3">
              {topStores.slice(0, 8).map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{s.storeName || s.client?.storeName || `Do'kon ${i+1}`}</p>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1">
                      <div className="h-1.5 rounded-full bg-violet-500" style={{
                        width: `${Math.min(100, (s.orders / (topStores[0]?.orders || 1)) * 100)}%`,
                      }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-violet-400">{(s.totalSpent||0).toLocaleString('uz-UZ')}</p>
                    <p className="text-xs text-slate-500">{s.orders} buyurtma</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">Ma'lumot yo'q</div>
          )}
        </div>
      </div>

      {/* Top distributors + Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Eng yaxshi distribyutorlar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-bold mb-4 flex items-center gap-2">
            <Truck className="w-4 h-4 text-cyan-400" /> Eng yaxshi distribyutorlar
          </h3>
          {topDistributors.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topDistributors.slice(0, 6)} layout="vertical" margin={{ left: 80 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="companyName" stroke="#475569" fontSize={11} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="revenue" name="Daromad" fill="#06b6d4" radius={[0, 6, 6, 0]}>
                  {topDistributors.slice(0, 6).map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-slate-500 text-sm">Ma'lumot yo'q</div>
          )}
        </div>

        {/* Kategoriya breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-bold mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-400" /> Kategoriya bo'yicha daromad
          </h3>
          {categoryBreakdown.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={categoryBreakdown} dataKey="revenue" nameKey="category" cx="50%" cy="50%" outerRadius={80}>
                    {categoryBreakdown.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {categoryBreakdown.slice(0, 5).map((c: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-slate-300 truncate flex-1">{c.category}</span>
                    <span className="text-xs text-slate-400 shrink-0">{((c.revenue / categoryBreakdown.reduce((s: number, x: any) => s + x.revenue, 0)) * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">Ma'lumot yo'q</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;