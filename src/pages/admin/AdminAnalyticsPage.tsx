import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, ShoppingCart, DollarSign, Loader2 } from 'lucide-react';
import api from '../../api/api';

const fetchAnalytics = async (period: string) => {
  const res = await api.get('/api/admin/analytics', { params: { period } });
  return res.data;
};

const fmt = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `${(n / 1_000).toFixed(0)}K`
    : String(n);

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<'1d' | '7d' | '30d'>('7d');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics', period],
    queryFn: () => fetchAnalytics(period),
  });

  const chartData = data?.revenueByDay
    ? Object.entries(data.revenueByDay)
        .map(([date, revenue]) => ({
          date: date.slice(5),
          revenue: revenue as number,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Analitika</h1>
          <p className="text-slate-500 text-sm mt-0.5">Platforma bo'yicha hisobot</p>
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {(['1d', '7d', '30d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                period === p
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {p === '1d' ? 'Bugun' : p === '7d' ? '7 kun' : '30 kun'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-violet-600" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Buyurtmalar</p>
                <p className="text-2xl font-black text-slate-900">{data?.totalOrders ?? 0}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Daromad</p>
                <p className="text-2xl font-black text-slate-900">{fmt(data?.totalRevenue ?? 0)} UZS</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-sky-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">O'rtacha buyurtma</p>
                <p className="text-2xl font-black text-slate-900">
                  {data?.totalOrders
                    ? fmt(Math.round((data.totalRevenue ?? 0) / data.totalOrders))
                    : 0}{' '}
                  UZS
                </p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-6">Kunlik daromad</h2>
            {chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <TrendingUp className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">Ma'lumot yo'q</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => fmt(v)}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      border: 'none',
                      borderRadius: 10,
                      color: '#f8fafc',
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [`${v.toLocaleString('uz-UZ')} UZS`, 'Daromad']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#7c3aed"
                    strokeWidth={2.5}
                    fill="url(#revenueGrad)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#7c3aed' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}
