import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getOrdersFn, updateOrderStatusFn } from '../../api/order.api';
import { MapPin, PackageCheck, Loader2, Eye, Search, CheckCircle, XCircle, Truck, X } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';
import toast from 'react-hot-toast';
import api from '../../api/api';

const STATUS_OPTIONS = [
  { value: 'NEW',        label: 'Yangi',          variant: 'warning'  },
  { value: 'ACCEPTED',   label: 'Qabul qilindi',  variant: 'primary'  },
  { value: 'REJECTED',   label: 'Rad etildi',     variant: 'danger'   },
  { value: 'ASSIGNED',   label: 'Tayinlandi',     variant: 'info'     },
  { value: 'IN_TRANSIT', label: "Yo'lda",         variant: 'info'     },
  { value: 'DELIVERED',  label: 'Yetkazildi',     variant: 'success'  },
  { value: 'RETURNED',   label: 'Qaytarildi',     variant: 'warning'  },
  { value: 'CANCELLED',  label: 'Bekor qilindi',  variant: 'danger'   },
  { value: 'PAID',       label: "To'landi",       variant: 'success'  },
];

const DistributorOrdersPage = () => {
  const queryClient = useQueryClient();
  const navigate    = useNavigate();

  const [updatingId,   setUpdatingId]   = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [acceptModal,  setAcceptModal]  = useState<{ orderId: string } | null>(null);
  const [selectedDriver, setSelectedDriver] = useState('');

  // ── Fetch orders ──────────────────────────────────────────────────────────
  const { data: fetchRes, isLoading } = useQuery({
    queryKey: ['distributor-orders', filterStatus],
    queryFn: () => getOrdersFn({ status: filterStatus || undefined }),
  });

  // ── Fetch drivers ─────────────────────────────────────────────────────────
  const { data: driversResp } = useQuery({
    queryKey: ['distributor-drivers'],
    queryFn: () => api.get('/api/distributor/drivers').then(r => r.data),
  });
  const drivers: any[] = driversResp?.data || driversResp?.drivers || [];

  // ── Update status ─────────────────────────────────────────────────────────
  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateOrderStatusFn({ id, data: { status: status as any } }),
    onSuccess: () => {
      toast.success('Holat yangilandi');
      queryClient.invalidateQueries({ queryKey: ['distributor-orders'] });
      setUpdatingId(null);
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || 'Xatolik');
      setUpdatingId(null);
    },
  });

  // ── Accept + assign driver ────────────────────────────────────────────────
  const { mutate: acceptAndAssign, isPending: accepting } = useMutation({
    mutationFn: async ({ orderId, driverId }: { orderId: string; driverId: string }) => {
      await updateOrderStatusFn({ id: orderId, data: { status: 'ACCEPTED' as any } });
      if (driverId) await api.post(`/api/distributor/orders/${orderId}/assign`, { driverId });
    },
    onSuccess: () => {
      toast.success('Buyurtma qabul qilindi' + (selectedDriver ? ' va haydovchi tayinlandi' : ''));
      queryClient.invalidateQueries({ queryKey: ['distributor-orders'] });
      setAcceptModal(null);
      setSelectedDriver('');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xatolik'),
  });

  const allOrders: any[] = Array.isArray(fetchRes) ? fetchRes : fetchRes?.data?.orders || fetchRes?.orders || fetchRes?.data || [];

  const orders = allOrders.filter((o: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.client?.storeName?.toLowerCase().includes(q) ||
      o.id?.toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-7 h-7 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Buyurtmalar</h1>
          <p className="text-slate-500 text-sm mt-0.5">{allOrders.length} ta buyurtma</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Do'kon yoki ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 bg-white"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 bg-white"
          >
            <option value="">Barcha holat</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-2xl border border-dashed border-slate-300 gap-3">
          <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center">
            <PackageCheck className="w-7 h-7 text-violet-400" />
          </div>
          <p className="text-slate-600 font-medium text-sm">Buyurtmalar yo'q</p>
          <p className="text-slate-400 text-xs">Yangi buyurtmalar bu yerda ko'rinadi</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {['Buyurtmachi', 'Sana', 'Manzil', 'Summa', 'Holat', 'Boshqaruv', ''].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order: any) => {
                  const statusInfo = STATUS_OPTIONS.find((s) => s.value === order.status);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Buyer */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-bold shrink-0">
                            {order.client?.storeName?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 leading-none">
                              {order.client?.storeName}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {order.client?.phone || order.client?.user?.phone}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-slate-700">
                          {format(new Date(order.createdAt), 'dd MMM yyyy', { locale: uz })}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {format(new Date(order.createdAt), 'HH:mm')}
                        </p>
                      </td>

                      {/* Address */}
                      <td className="px-5 py-4 max-w-[160px]">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <p className="text-sm text-slate-700 line-clamp-2">
                            {typeof order.deliveryAddress === 'string' && order.deliveryAddress
                              ? order.deliveryAddress
                              : typeof order.deliveryAddress === 'object' && order.deliveryAddress
                                ? order.deliveryAddress?.street || order.deliveryAddress?.address || order.deliveryAddress?.text || '—'
                                : '—'}
                          </p>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="text-sm font-bold text-violet-600">
                          {(order.totalAmount || 0).toLocaleString('uz-UZ')} UZS
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {order.items?.length || 0} tovar
                        </p>
                      </td>

                      {/* Status badge */}
                      <td className="px-5 py-4">
                        <Badge variant={statusInfo?.variant as any}>
                          {statusInfo?.label || order.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        {updatingId === order.id ? (
                          <Loader2 className="w-4 h-4 text-violet-600 animate-spin" />
                        ) : order.status === 'NEW' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setAcceptModal({ orderId: order.id }); setSelectedDriver(''); }}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-600 border border-green-200 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Qabul
                            </button>
                            <button
                              onClick={() => { setUpdatingId(order.id); updateStatus({ id: order.id, status: 'REJECTED' }); }}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-500 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Rad
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>

                      {/* Detail */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() => navigate(`/distributor/orders/${order.id}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-600 rounded-lg text-xs font-medium hover:bg-violet-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Batafsil
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Accept + Driver modal */}
      {acceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-slate-900">Buyurtmani qabul qilish</h3>
              <button onClick={() => setAcceptModal(null)} className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <p className="text-sm text-slate-500 mb-4">Haydovchi tanlang (ixtiyoriy):</p>

            <div className="space-y-2 mb-5 max-h-56 overflow-y-auto">
              <label className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${selectedDriver === '' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" name="driver" value="" checked={selectedDriver === ''} onChange={() => setSelectedDriver('')} className="hidden" />
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-slate-400" />
                </div>
                <span className="text-sm font-semibold text-slate-600">Hozircha tayinlamaslik</span>
              </label>

              {drivers.map((d: any) => (
                <label key={d.id} className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${selectedDriver === d.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" name="driver" value={d.id} checked={selectedDriver === d.id} onChange={() => setSelectedDriver(d.id)} className="hidden" />
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xs">
                    {d.user?.name?.charAt(0) || 'D'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{d.user?.name || d.name}</p>
                    <p className="text-xs text-slate-400">{d.vehicleType} · {d.vehicleNumber || d.plateNumber || ''}</p>
                  </div>
                </label>
              ))}

              {drivers.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-3">Haydovchilar topilmadi</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setAcceptModal(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Bekor
              </button>
              <button
                onClick={() => acceptAndAssign({ orderId: acceptModal.orderId, driverId: selectedDriver })}
                disabled={accepting}
                className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-sm font-black transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {accepting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributorOrdersPage;