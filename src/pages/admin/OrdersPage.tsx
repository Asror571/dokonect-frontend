import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Download, ShoppingCart, Package, Truck, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';
import { getAdminOrdersFn } from '../../api/admin.api';

const STATUS_OPTIONS = [
  { value: '',            label: 'Barcha holatlar', icon: Filter,      c: 'text-slate-400' },
  { value: 'NEW',         label: 'Yangi',            icon: Clock,       c: 'text-amber-400' },
  { value: 'ACCEPTED',    label: 'Qabul qilindi',    icon: Package,     c: 'text-blue-400'  },
  { value: 'ASSIGNED',    label: 'Tayinlandi',       icon: Truck,       c: 'text-sky-400'   },
  { value: 'IN_TRANSIT',  label: "Yo'lda",           icon: Truck,       c: 'text-indigo-400'},
  { value: 'DELIVERED',   label: 'Yetkazildi',       icon: CheckCircle2,c: 'text-emerald-400'},
  { value: 'CANCELLED',   label: 'Bekor qilindi',    icon: XCircle,     c: 'text-red-400'   },
  { value: 'REJECTED',    label: 'Rad etildi',       icon: XCircle,     c: 'text-red-400'   },
];

const STATUS_STYLE: Record<string, string> = {
  NEW:        'bg-amber-900/40 text-amber-300 border-amber-800/30',
  ACCEPTED:   'bg-blue-900/40 text-blue-300 border-blue-800/30',
  ASSIGNED:   'bg-sky-900/40 text-sky-300 border-sky-800/30',
  IN_TRANSIT: 'bg-indigo-900/40 text-indigo-300 border-indigo-800/30',
  DELIVERED:  'bg-emerald-900/40 text-emerald-300 border-emerald-800/30',
  CANCELLED:  'bg-red-900/40 text-red-300 border-red-800/30',
  REJECTED:   'bg-red-900/40 text-red-300 border-red-800/30',
  PAID:       'bg-green-900/40 text-green-300 border-green-800/30',
};

export const OrdersPage = () => {
  const [search,  setSearch]  = useState('');
  const [status,  setStatus]  = useState('');
  const [page,    setPage]    = useState(1);

  const { data: res, isLoading } = useQuery({
    queryKey: ['admin-orders', status, page],
    queryFn: () => getAdminOrdersFn({ status: status || undefined, page, limit: 20 }),
    retry: false,
  });

  const orders: any[] = res?.data?.orders || res?.orders || res?.data || [];

  const filtered = orders.filter((o: any) => {
    const q = search.toLowerCase();
    return !q ||
      o.id?.toLowerCase().includes(q) ||
      o.client?.storeName?.toLowerCase().includes(q) ||
      o.distributor?.companyName?.toLowerCase().includes(q);
  });

  const statCounts = {
    total:    orders.length,
    new:      orders.filter((o: any) => o.status === 'NEW').length,
    active:   orders.filter((o: any) => ['ACCEPTED','ASSIGNED','IN_TRANSIT'].includes(o.status)).length,
    done:     orders.filter((o: any) => o.status === 'DELIVERED').length,
    cancelled:orders.filter((o: any) => ['CANCELLED','REJECTED'].includes(o.status)).length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-400" /> Buyurtmalar
          </h1>
          <p className="text-slate-400 text-sm mt-1">Barcha buyurtmalarni ko'rish va boshqarish</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors">
          <Download className="w-4 h-4" /> CSV eksport
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Jami',    value: statCounts.total,    c: 'text-white'        },
          { label: 'Yangi',   value: statCounts.new,      c: 'text-amber-400'    },
          { label: 'Faol',    value: statCounts.active,   c: 'text-sky-400'      },
          { label: 'Yetkazildi', value: statCounts.done,  c: 'text-emerald-400'  },
          { label: 'Bekor',   value: statCounts.cancelled,c: 'text-red-400'      },
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
            placeholder="Buyurtma ID, do'kon yoki distribyutor..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40">
          {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
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
                  {['ID', 'Do\'kon', 'Distribyutor', 'Haydovchi', 'Summa', 'To\'lov', 'Holat', 'Sana'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-slate-500">Buyurtmalar topilmadi</td></tr>
                ) : filtered.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">#{order.id?.slice(0,8)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{order.client?.storeName || '—'}</p>
                      <p className="text-xs text-slate-500">{order.client?.user?.phone || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{order.distributor?.companyName || '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{order.driver?.user?.name || <span className="text-slate-600">Tayinlanmagan</span>}</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">{(order.totalAmount||0).toLocaleString('uz-UZ')} UZS</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${
                        order.paymentMethod === 'CASH' ? 'bg-amber-900/30 text-amber-300 border-amber-800/30' : 'bg-blue-900/30 text-blue-300 border-blue-800/30'
                      }`}>{order.paymentMethod === 'CASH' ? 'Naqd' : order.paymentMethod || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${STATUS_STYLE[order.status] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                        {STATUS_OPTIONS.find(s => s.value === order.status)?.label || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">
                      {order.createdAt ? format(new Date(order.createdAt), 'dd MMM, HH:mm', { locale: uz }) : '—'}
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