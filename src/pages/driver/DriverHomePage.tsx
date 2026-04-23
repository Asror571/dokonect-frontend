import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, DollarSign, TrendingUp, MapPin } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { getDriverDashboardFn, updateDriverStatusFn, updateDriverLocationFn, acceptDriverOrderFn } from '../../api/driver.api';
import { DriverStatusToggle } from '../../components/driver/DriverStatusToggle';
import { OrderAcceptCard } from '../../components/driver/OrderAcceptCard';

export const DriverHomePage: React.FC = () => {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const [isOnline,      setIsOnline]      = useState(false);
  const [incomingOrder, setIncomingOrder] = useState<any>(null);

  const { data: dashRes } = useQuery({
    queryKey: ['driver-home'],
    queryFn: getDriverDashboardFn,
    staleTime: 30_000,
  });
  const dashboard = dashRes?.data || dashRes || {};

  const { mutate: updateStatus, isPending: statusPending } = useMutation({
    mutationFn: (online: boolean) => updateDriverStatusFn({ isOnline: online }),
    onSuccess: (_, online) => {
      setIsOnline(online);
      toast.success(online ? "Online bo'ldingiz" : "Offline bo'ldingiz");
      queryClient.invalidateQueries({ queryKey: ['driver-home'] });
    },
    onError: () => toast.error("Holat o'zgartirishda xatolik"),
  });

  const { mutate: acceptOrder } = useMutation({
    mutationFn: (orderId: string) => acceptDriverOrderFn(orderId),
    onSuccess: () => {
      toast.success('Buyurtma qabul qilindi!');
      setIncomingOrder(null);
      queryClient.invalidateQueries({ queryKey: ['driver-home'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xatolik'),
  });

  // Joylashuvni har 5 soniyada yuborish
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

  // Socket orqali kelgan buyurtma
  useEffect(() => {
    const handler = (event: any) => setIncomingOrder(event.detail.order);
    window.addEventListener('order-offer', handler);
    return () => window.removeEventListener('order-offer', handler);
  }, []);

  const todayEarnings = dashboard.todayEarnings || 0;
  const todayOrders   = dashboard.todayOrders   || 0;
  const dailyGoal     = 500_000;
  const goalProgress  = Math.min((todayEarnings / dailyGoal) * 100, 100);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Xush kelibsiz!</h1>
        <p className="text-slate-400">{dashboard.driver?.user?.name}</p>
      </div>

      <div className="mb-6">
        <DriverStatusToggle isOnline={isOnline} onChange={(v) => updateStatus(v)} disabled={statusPending} />
      </div>

      {incomingOrder && (
        <div className="mb-6">
          <OrderAcceptCard
            order={incomingOrder}
            expiresIn={30}
            onAccept={() => acceptOrder(incomingOrder.id)}
            onDecline={() => { setIncomingOrder(null); toast('Buyurtma rad etildi'); }}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div whileHover={{ scale: 1.02 }} className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-sky-500/20 rounded-lg"><Package className="w-5 h-5 text-sky-400" /></div>
            <div>
              <p className="text-slate-400 text-sm">Bugun</p>
              <p className="text-2xl font-bold">{todayOrders}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">Bajarilgan buyurtmalar</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg"><DollarSign className="w-5 h-5 text-green-400" /></div>
            <div>
              <p className="text-slate-400 text-sm">Daromad</p>
              <p className="text-2xl font-bold">{todayEarnings.toLocaleString('uz-UZ')}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">UZS bugun</p>
        </motion.div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <span className="font-semibold">Kunlik maqsad</span>
          </div>
          <span className="text-sm text-slate-400">{todayEarnings.toLocaleString('uz-UZ')} / {dailyGoal.toLocaleString('uz-UZ')} UZS</span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${goalProgress}%` }} className="h-full bg-gradient-to-r from-amber-500 to-orange-500" />
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {goalProgress >= 100 ? '🎉 Maqsad bajarildi!' : `${(100 - goalProgress).toFixed(0)}% qoldi`}
        </p>
      </div>

      {dashboard.activeOrder ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Faol yetkazish</h3>
            <div className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">Jarayonda</div>
          </div>
          <div className="flex items-start gap-3 mb-4">
            <MapPin className="w-5 h-5 mt-0.5" />
            <div>
              <p className="text-sky-100 text-sm">Yetkazish</p>
              <p className="font-semibold">{dashboard.activeOrder.client?.user?.name}</p>
              <p className="text-sm">
                {typeof dashboard.activeOrder.deliveryAddress === 'object'
                  ? dashboard.activeOrder.deliveryAddress?.street || dashboard.activeOrder.deliveryAddress?.address
                  : dashboard.activeOrder.deliveryAddress}
              </p>
            </div>
          </div>
          <button onClick={() => navigate(`/driver/delivery/${dashboard.activeOrder.id}`)} className="w-full bg-white text-sky-600 py-3 rounded-xl font-bold hover:bg-sky-50 transition-colors">
            Davom ettirish →
          </button>
        </motion.div>
      ) : (
        <div className="bg-slate-800 rounded-2xl p-12 text-center">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">{isOnline ? 'Buyurtma kutilmoqda...' : "Buyurtma olish uchun online bo'ling"}</p>
        </div>
      )}
    </div>
  );
};