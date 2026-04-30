import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOrderByIdFn } from '../../api/order.api';
import { ArrowLeft, Package, MapPin, Truck, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';

const STATUS_MAP: Record<string, { label: string; variant: string }> = {
  NEW:        { label: 'Yangi',         variant: 'warning'   },
  ACCEPTED:   { label: 'Qabul qilindi', variant: 'primary'   },
  REJECTED:   { label: 'Rad etildi',    variant: 'danger'    },
  ASSIGNED:   { label: 'Tayinlandi',    variant: 'info'      },
  IN_TRANSIT: { label: "Yo'lda",        variant: 'info'      },
  DELIVERED:  { label: 'Yetkazildi',    variant: 'success'   },
  CANCELLED:  { label: 'Bekor qilindi', variant: 'danger'    },
  PAID:       { label: "To'landi",      variant: 'success'   },
};

const StoreOrderDetailPage = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: resp, isLoading } = useQuery({
    queryKey: ['store-order-detail', id],
    queryFn: () => getOrderByIdFn(id!),
    enabled: !!id,
  });

  const order = resp?.data || resp;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <XCircle className="w-12 h-12 text-slate-300" />
        <p className="text-slate-500 font-medium">Buyurtma topilmadi</p>
        <button onClick={() => navigate('/store/orders')} className="text-indigo-600 text-sm font-semibold">
          Orqaga qaytish
        </button>
      </div>
    );
  }

  const statusInfo = STATUS_MAP[order.status] || { label: order.status, variant: 'secondary' };
  const address = typeof order.deliveryAddress === 'object'
    ? order.deliveryAddress?.address || order.deliveryAddress?.street || JSON.stringify(order.deliveryAddress)
    : order.deliveryAddress || '—';

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/store/orders')}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <p className="text-xs font-mono text-indigo-500 font-medium uppercase">#{order.id?.slice(0, 8)}</p>
          <h1 className="text-xl font-bold text-slate-900">Buyurtma tafsiloti</h1>
        </div>
        <div className="ml-auto">
          <Badge variant={statusInfo.variant as any} className="text-xs font-bold uppercase tracking-wider">
            {statusInfo.label}
          </Badge>
        </div>
      </div>

      {/* Distributor & Date */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-xl"><Truck className="w-5 h-5 text-indigo-600" /></div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Distribyutor</p>
            <p className="font-bold text-slate-900">{order.distributor?.companyName || '—'}</p>
            {order.distributor?.phone && <p className="text-sm text-slate-500">{order.distributor.phone}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-xl"><Clock className="w-5 h-5 text-slate-500" /></div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Sana</p>
            <p className="font-semibold text-slate-800">
              {order.createdAt ? format(new Date(order.createdAt), 'dd MMMM yyyy, HH:mm', { locale: uz }) : '—'}
            </p>
          </div>
        </div>
        {address && address !== '—' && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-xl"><MapPin className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Manzil</p>
              <p className="font-semibold text-slate-800">{address}</p>
            </div>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Package className="w-5 h-5 text-slate-500" />
          <h2 className="font-bold text-slate-900">Mahsulotlar</h2>
          <span className="ml-auto text-xs text-slate-400 font-medium">{order.items?.length || 0} ta</span>
        </div>
        <div className="divide-y divide-slate-100">
          {(order.items || []).map((item: any) => {
            const img = item.product?.images?.[0]?.url || item.product?.images?.[0];
            return (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                  {img
                    ? <img src={img} alt={item.product?.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-slate-300" /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{item.product?.name || 'Mahsulot'}</p>
                  <p className="text-xs text-slate-400">{item.quantity} × {(item.unitPrice || item.price || 0).toLocaleString('uz-UZ')} UZS</p>
                </div>
                <p className="font-bold text-slate-900 shrink-0">
                  {((item.quantity || 1) * (item.unitPrice || item.price || 0)).toLocaleString('uz-UZ')} UZS
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-5 h-5 text-slate-500" />
          <h2 className="font-bold text-slate-900">Hisob</h2>
        </div>
        {order.deliveryFee > 0 && (
          <div className="flex justify-between text-sm text-slate-600">
            <span>Yetkazib berish</span>
            <span>{(order.deliveryFee || 0).toLocaleString('uz-UZ')} UZS</span>
          </div>
        )}
        {order.discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Chegirma</span>
            <span>−{(order.discount || 0).toLocaleString('uz-UZ')} UZS</span>
          </div>
        )}
        <div className="flex justify-between font-black text-lg text-slate-900 pt-2 border-t border-slate-100">
          <span>Jami</span>
          <span>{(order.totalAmount || 0).toLocaleString('uz-UZ')} UZS</span>
        </div>
        {order.paymentMethod && (
          <p className="text-xs text-slate-400 text-right">
            {order.paymentMethod === 'CASH' ? 'Naqd pul' : order.paymentMethod === 'CARD' ? 'Karta' : "Bank o'tkazma"}
          </p>
        )}
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Izoh</p>
          <p className="text-slate-700 font-medium">{order.notes}</p>
        </div>
      )}

      {/* Driver */}
      {order.driver && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl"><Truck className="w-5 h-5 text-blue-600" /></div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Haydovchi</p>
            <p className="font-bold text-slate-900">{order.driver?.user?.name || '—'}</p>
            {order.driver?.user?.phone && <p className="text-sm text-slate-500">{order.driver.user.phone}</p>}
          </div>
          <div className="ml-auto">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreOrderDetailPage;
