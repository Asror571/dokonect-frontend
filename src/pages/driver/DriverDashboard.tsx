import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, DollarSign, Package, Navigation } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { getDriverDashboardFn, updateDriverStatusFn, updateDriverLocationFn, updateDriverOrderStatusFn } from '../../api/driver.api';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const DriverDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(false);

  const { data: dashRes, refetch } = useQuery({
    queryKey: ['driver-dashboard'],
    queryFn: getDriverDashboardFn,
    staleTime: 30_000,
  });
  const dashboard = dashRes?.data || dashRes || {};

  const { mutate: updateStatus } = useMutation({
    mutationFn: (online: boolean) => updateDriverStatusFn({ isOnline: online }),
    onSuccess: (_, online) => {
      setIsOnline(online);
      toast.success(online ? "Online bo'ldingiz" : "Offline bo'ldingiz");
      refetch();
    },
  });

  const { mutate: markDelivered } = useMutation({
    mutationFn: (orderId: string) => updateDriverOrderStatusFn({ orderId, status: 'DELIVERED' }),
    onSuccess: () => {
      toast.success('Yetkazish tasdiqlandi! 🎉');
      queryClient.invalidateQueries({ queryKey: ['driver-dashboard'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xatolik'),
  });

  // Joylashuvni yuborish
  useEffect(() => {
    if (!isOnline) return;
    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => updateDriverLocationFn({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error('Location:', err)
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [isOnline]);

  const activeOrder = dashboard.activeOrder;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Haydovchi paneli</h1>
            <p className="text-slate-400 text-sm mt-1">{dashboard.driver?.user?.name}</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => updateStatus(!isOnline)}
            className={`relative w-20 h-10 rounded-full transition-colors ${isOnline ? 'bg-green-500' : 'bg-slate-600'}`}
          >
            <motion.div animate={{ x: isOnline ? 40 : 0 }} className="absolute top-1 left-1 w-8 h-8 bg-white rounded-full shadow-lg" />
          </motion.button>
        </div>
      </div>

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Bugun', value: dashboard.todayOrders || 0, icon: Package, bg: 'bg-sky-500/20', c: 'text-sky-400' },
            { label: 'Daromad', value: (dashboard.todayEarnings || 0).toLocaleString('uz-UZ'), icon: DollarSign, bg: 'bg-green-500/20', c: 'text-green-400' },
            { label: 'Holat', value: null, icon: MapPin, bg: 'bg-amber-500/20', c: 'text-amber-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-3">
                <div className={`p-2 ${stat.bg} rounded-lg`}><stat.icon className={`w-5 h-5 ${stat.c}`} /></div>
                <div>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  {stat.value !== null
                    ? <p className="text-2xl font-bold">{stat.value}</p>
                    : <StatusBadge status={isOnline ? 'ONLINE' : 'OFFLINE'} size="sm" />
                  }
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Active Order */}
        {activeOrder ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Faol yetkazish</h2>
              <StatusBadge status={activeOrder.status} size="md" />
            </div>
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sky-100 text-sm">Mijoz</p>
                <p className="text-lg font-semibold">{activeOrder.client?.user?.name}</p>
              </div>
              <div>
                <p className="text-sky-100 text-sm">Manzil</p>
                <p className="font-medium">
                  {typeof activeOrder.deliveryAddress === 'object'
                    ? activeOrder.deliveryAddress?.street || activeOrder.deliveryAddress?.address
                    : activeOrder.deliveryAddress}
                </p>
              </div>
              <div>
                <p className="text-sky-100 text-sm">Mahsulotlar</p>
                {(activeOrder.items || []).slice(0, 2).map((item: any, i: number) => (
                  <p key={i} className="text-sm">{item.quantity}x {item.product?.name}</p>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const addr = typeof activeOrder.deliveryAddress === 'object'
                    ? activeOrder.deliveryAddress?.street || ''
                    : activeOrder.deliveryAddress || '';
                  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`);
                }}
                className="flex-1 bg-white text-sky-600 py-3 rounded-xl font-bold hover:bg-sky-50 transition-colors flex items-center justify-center gap-2"
              >
                <Navigation className="w-5 h-5" /> Navigatsiya
              </button>
              <button
                onClick={() => markDelivered(activeOrder.id)}
                className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors"
              >
                Yetkazildi ✓
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="bg-slate-800 rounded-2xl p-12 text-center border border-slate-700">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">
              {isOnline ? 'Buyurtma kutilmoqda...' : "Online bo'ling va buyurtma oling"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};