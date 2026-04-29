import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { format } from 'date-fns';
import { uz } from 'date-fns/locale';
import { Filter, ClipboardList, Package, Truck, Clock, CheckCircle2, XCircle, Loader2, PackageCheck } from 'lucide-react';
import { getOrdersFn } from '../api/order.api';
import { Badge } from '../components/ui/Badge';

const STATUS_MAP: Record<string, { label: string; variant: string; icon: any }> = {
  NEW:        { label: 'Yangi',          variant: 'warning', icon: Clock        },
  ACCEPTED:   { label: 'Qabul qilindi', variant: 'primary', icon: Package      },
  ASSIGNED:   { label: 'Tayinlandi',    variant: 'info',    icon: ClipboardList },
  IN_TRANSIT: { label: "Yo'lda",        variant: 'info',    icon: Truck        },
  DELIVERED:  { label: 'Yetkazildi',    variant: 'success', icon: CheckCircle2 },
  RETURNED:   { label: 'Qaytarildi',    variant: 'warning', icon: Package      },
  CANCELLED:  { label: 'Bekor qilindi', variant: 'danger',  icon: XCircle      },
  REJECTED:   { label: 'Rad etildi',    variant: 'danger',  icon: XCircle      },
};

const StoreOrdersPage = () => {
  const navigate        = useNavigate();
  const [filter, setFilter] = useState('');

  const { data: ordersRes, isLoading } = useQuery({
    queryKey: ['store-orders', filter],
    queryFn: () => getOrdersFn({ status: filter || undefined }),
    staleTime: 30_000,
    retry: false,
  });

  const orders: any[] = ordersRes?.data?.orders || ordersRes?.orders || [];

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="fade-in space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 underline decoration-indigo-500 underline-offset-8">
            Mening Buyurtmalarim
          </h1>
          <p className="text-slate-500 text-sm mt-1">{orders.length} ta buyurtma</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
            <option value="">Barcha holatlar</option>
            {Object.entries(STATUS_MAP).map(([val, info]) => (
              <option key={val} value={val}>{info.label}</option>
            ))}
          </select>
        </div>
      </div>

      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] bg-white rounded-2xl border border-dashed border-slate-300 gap-3">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
            <PackageCheck className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">Buyurtmalar yo'q</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {orders.map((order: any) => {
          const info = STATUS_MAP[order.status] || { label: order.status, variant: 'secondary', icon: ClipboardList };
          const Icon = info.icon;
          return (
            <div key={order.id} onClick={() => navigate(`/store/orders/${order.id}`)}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md cursor-pointer group transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-slate-100 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-mono text-xs text-indigo-500">#{order.id.slice(0, 8)}</p>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {order.distributor?.companyName || 'Distribyutor'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {format(new Date(order.createdAt), 'dd MMMM, yyyy HH:mm', { locale: uz })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col md:items-end gap-2 pr-4">
                  <p className="text-lg font-bold text-slate-900">
                    {(order.totalAmount || 0).toLocaleString('uz-UZ')} UZS
                  </p>
                  <Badge variant={info.variant as any}>{info.label}</Badge>
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