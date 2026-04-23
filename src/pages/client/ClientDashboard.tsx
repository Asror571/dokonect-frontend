import React from 'react';
import { motion } from 'framer-motion';
import { Package, MapPin, Clock, ShoppingBag, Star } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Timeline } from '../../components/ui/Timeline';

import { getClientDashboardFn, getClientOrderTrackingFn, rateClientOrderFn } from '../../api/client.api';
import { getOrdersFn } from '../../api/order.api';
import toast from 'react-hot-toast';

export const ClientDashboard: React.FC = () => {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  const { data: dashRes, isLoading } = useQuery({
    queryKey: ['client-dashboard'],
    queryFn: getClientDashboardFn,
    staleTime: 30_000,
  });

  const { data: ordersRes } = useQuery({
    queryKey: ['store-orders', ''],
    queryFn: () => getOrdersFn({ limit: 10 } as any),
    staleTime: 30_000,
  });

  const dash         = dashRes?.data || dashRes || {};
  const activeOrder  = dash.activeOrder;
  const recentOrders: any[] = ordersRes?.data?.orders || ordersRes?.orders || dash.recentOrders || [];

  // ── Track active order ────────────────────────────────────────────────────
  const { data: trackingRes } = useQuery({
    queryKey: ['order-tracking', activeOrder?.id],
    queryFn: () => getClientOrderTrackingFn(activeOrder!.id),
    enabled: !!activeOrder?.id,
    staleTime: 15_000,
  });

  // ── Rate order ────────────────────────────────────────────────────────────
  const { mutate: rateOrder } = useMutation({
    mutationFn: ({ orderId, rating }: { orderId: string; rating: number }) =>
      rateClientOrderFn({ orderId, data: { rating } }),
    onSuccess: () => {
      toast.success('Baholandi!');
      queryClient.invalidateQueries({ queryKey: ['store-orders'] });
    },
    onError: () => toast.error('Baholashda xatolik'),
  });

  const tracking = trackingRes?.data || trackingRes;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Buyurtmalarim</h1>
        <p className="text-gray-600 mt-1">Yetkazishlarni kuzating va boshqaring</p>
      </div>

      <div className="p-8 space-y-8">

        {/* Active Order Tracking */}
        {activeOrder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Faol buyurtma</h2>
              <StatusBadge status={tracking?.status || activeOrder.status} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Buyurtma tafsiloti</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Buyurtma ID</p>
                      <p className="font-mono font-medium">#{activeOrder.id.slice(0, 8)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Yetkazish manzili</p>
                      <p className="font-medium">
                        {typeof activeOrder.deliveryAddress === 'object'
                          ? activeOrder.deliveryAddress?.street || activeOrder.deliveryAddress?.address
                          : activeOrder.address || '—'}
                      </p>
                    </div>
                  </div>

                  {(tracking?.driver || activeOrder.driver) && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-sm">
                        {(tracking?.driver?.user?.name || activeOrder.driver?.user?.name || 'D').charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Haydovchi</p>
                        <p className="font-medium">
                          {tracking?.driver?.user?.name || activeOrder.driver?.user?.name}
                        </p>
                        <a
                          href={`tel:${tracking?.driver?.user?.phone || activeOrder.driver?.user?.phone}`}
                          className="text-sm text-sky-600 hover:text-sky-700"
                        >
                          Qo'ng'iroq qilish
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Buyurtma tarixi</h3>
                <Timeline
                  items={(tracking?.statusHistory || activeOrder.statusHistory) || []}
                  currentStatus={tracking?.status || activeOrder.status}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/store/catalog')}
            className="bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all text-left"
          >
            <ShoppingBag className="w-8 h-8 mb-3" />
            <h3 className="text-xl font-bold mb-1">Katalog</h3>
            <p className="text-sky-100">Yangi buyurtma berish</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/store/orders')}
            className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all text-left"
          >
            <Clock className="w-8 h-8 text-gray-600 mb-3" />
            <h3 className="text-xl font-bold text-gray-900 mb-1">Buyurtmalar tarixi</h3>
            <p className="text-gray-600">Barcha buyurtmalarni ko'rish</p>
          </motion.button>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">So'nggi buyurtmalar</h2>
          <div className="space-y-4">
            {recentOrders.slice(0, 5).map((order: any) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/store/orders/${order.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-sky-50 rounded-lg">
                    <Package className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <p className="font-mono text-sm text-gray-600">#{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-500">
                      {order.items?.length || 0} mahsulot · {(order.totalAmount || 0).toLocaleString('uz-UZ')} UZS
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {order.status === 'DELIVERED' && !order.rating && (
                    <button
                      onClick={(e) => { e.stopPropagation(); rateOrder({ orderId: order.id, rating: 5 }); }}
                      className="flex items-center gap-1 text-xs text-amber-500 hover:text-amber-600 font-medium"
                    >
                      <Star className="w-3.5 h-3.5" /> Baholash
                    </button>
                  )}
                  <StatusBadge status={order.status} size="sm" />
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p className="text-center text-gray-400 py-8 text-sm">Hali buyurtmalar yo'q</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};