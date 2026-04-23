import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';
import {
  Filter, ClipboardList, Package, Truck, Clock,
  CheckCircle2, XCircle, Loader2, PackageCheck,
} from 'lucide-react';
import { getOrdersFn } from '../api/order.api';
import { Badge } from '../components/ui/Badge';

const STATUS_MAP: Record<string, { label: string; variant: any; icon: any }> = {
  NEW:        { label: 'Yangi',          variant: 'warning', icon: Clock        },
  ACCEPTED:   { label: 'Qabul qilindi', variant: 'primary', icon: Package      },
  ASSIGNED:   { label: 'Tayinlandi',    variant: 'info',    icon: ClipboardList },
  IN_TRANSIT: { label: "Yo'lda",        variant: 'info',    icon: Truck        },
  DELIVERED:  { label: 'Yetkazildi',    variant: 'success', icon: CheckCircle2 },
  RETURNED:   { label: 'Qaytarildi',    variant: 'warning', icon: Package      },
  CANCELLED:  { label: 'Bekor qilindi', variant: 'danger',  icon: XCircle      },
  REJECTED:   { label: 'Rad etildi',    variant: 'danger',  icon: XCircle      },
  PAID:       { label: "To'landi",      variant: 'success', icon: CheckCircle2 },
};

const StoreOrdersPage = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('');

  const { data: fetchRes, isLoading } = useQuery({
    queryKey: ['store-orders', filterStatus],
    queryFn: () => getOrdersFn({ status: filterStatus || undefined }),
  });

  const orders: any[] = fetchRes?.data?.orders || fetchRes?.orders || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-7 h-7 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="fade-in space-y-6 max-w-4xl mx-auto pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 underline decoration-indigo-500 underline-offset-8">
            Buyurtmalarim
          </h1>
          <p className="text-slate-500 text-sm mt-1">{orders.length} ta buyurtma</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 bg-white"
          >
            <option value="">Barcha holat</option>
            {Object.entries(STATUS_MAP).map(([val, info]) => (
              <option key={val} value={val}>{info.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Empty state */}
      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] bg-white rounded-2xl border border-dashed border-slate-300 gap-3">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
            <PackageCheck className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium text-sm">Buyurtmalar yo'q</p>
          <p className="text-slate-400 text-xs">Katalogdan mahsulot tanlang</p>
        </div>
      )}

      {/* Orders list */}
      <div className="space-y-4">
        {orders.map((order: any) => {
          const statusInfo = STATUS_MAP[order.status] || {
            label: order.status, variant: 'secondary', icon: ClipboardList,
          };
          const StatusIcon = statusInfo.icon;
          const deliveryAddr = typeof order.deliveryAddress === 'object'
            ? order.deliveryAddress?.street || order.deliveryAddress?.address || '—'
            : order.address || '—';

          return (
            <div
              key={order.id}
              onClick={() => navigate(`/store/orders/${order.id}`)}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group overflow-hidden"
            >
              {/* Order header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                    <StatusIcon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-mono text-xs text-indigo-500 font-medium">
                      #{order.id?.slice(0, 8)}
                    </p>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {order.distributor?.companyName || 'Distribyutor'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  <span className="font-bold text-violet-600 text-sm">
                    {(order.totalAmount || 0).toLocaleString('uz-UZ')} UZS
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="px-5 py-3.5 grid sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Sana</p>
                  <p className="text-slate-700 font-medium">
                    {format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm', { locale: uz })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Manzil</p>
                  <p className="text-slate-700 font-medium line-clamp-1">{deliveryAddr}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Mahsulotlar
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {order.items?.slice(0, 2).map((item: any) => (
                      <span
                        key={item.id}
                        className="text-xs bg-slate-100 text-slate-600 rounded-md px-2 py-0.5 truncate max-w-[100px]"
                      >
                        {item.product?.name || 'Mahsulot'} ×{item.quantity}
                      </span>
                    ))}
                    {(order.items?.length || 0) > 2 && (
                      <span className="text-xs text-slate-400">
                        +{order.items.length - 2} ta
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StoreOrdersPage;