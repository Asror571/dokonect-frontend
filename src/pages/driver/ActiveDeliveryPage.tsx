import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Camera, AlertTriangle, Navigation } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { updateDriverOrderStatusFn } from '../../api/driver.api';
import api from '../../api/api';
import { DeliveryStepBar } from '../../components/driver/DeliveryStepBar';

export const ActiveDeliveryPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  // ── Order detail ──────────────────────────────────────────────────────────
  const { data: orderRes, isLoading } = useQuery({
    queryKey: ['active-delivery', orderId],
    queryFn: () => api.get(`/api/driver/orders/${orderId}`).then(r => r.data),
    enabled: !!orderId,
  });

  // ── Update status ─────────────────────────────────────────────────────────
  const { mutate: updateStatus } = useMutation({
    mutationFn: (status: 'PICKED' | 'IN_TRANSIT' | 'DELIVERED' | 'RETURNED') =>
      updateDriverOrderStatusFn({ orderId: orderId!, status }),
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ['active-delivery', orderId] });
      toast.success('Holat yangilandi');
      if (status === 'DELIVERED') {
        toast.success('Yetkazish yakunlandi! 🎉');
        setTimeout(() => navigate('/driver'), 2000);
      }
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xatolik'),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500" />
      </div>
    );
  }

  const order = orderRes?.data || orderRes;
  if (!order) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Buyurtma topilmadi</p>
          <button onClick={() => navigate('/driver')} className="text-sky-400 hover:underline">Orqaga</button>
        </div>
      </div>
    );
  }

  const deliveryAddr = typeof order.deliveryAddress === 'object'
    ? order.deliveryAddress?.street || order.deliveryAddress?.address || ''
    : order.deliveryAddress || '';

  const handleNavigate = () =>
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(deliveryAddr)}`);

  const handleCallClient = () => {
    const phone = order.client?.user?.phone;
    if (phone) window.location.href = `tel:${phone}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Map Placeholder */}
      <div className="h-64 bg-slate-800 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500">Xarita</p>
          </div>
        </div>
        <button
          onClick={handleNavigate}
          className="absolute bottom-4 right-4 bg-sky-500 text-white p-4 rounded-full shadow-lg hover:bg-sky-600 transition-colors"
        >
          <Navigation className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Customer Info */}
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-400 text-sm">Yetkazish manzili</p>
              <p className="text-xl font-bold">{order.client?.user?.name}</p>
            </div>
            <button onClick={handleCallClient} className="p-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors">
              <Phone className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
            <p className="text-slate-300">{deliveryAddr}</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-3">Yetkazish mahsulotlari</p>
          <div className="space-y-2">
            {(order.items || []).map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-slate-300">{item.quantity}x {item.product?.name}</span>
                <span className="text-slate-400 text-sm">{((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString('uz-UZ')} UZS</span>
              </div>
            ))}
          </div>
          <div className="pt-3 mt-3 border-t border-slate-700 flex items-center justify-between font-bold">
            <span>Jami</span>
            <span>{(order.totalAmount || 0).toLocaleString('uz-UZ')} UZS</span>
          </div>
        </div>

        {/* Delivery Steps */}
        <div>
          <p className="text-slate-400 text-sm mb-4">Yetkazish jarayoni</p>
          <DeliveryStepBar
            currentStep={order.status}
            onStepChange={(step) => updateStatus(step as any)}
          />
        </div>

        {/* Problem Report */}
        <button className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors">
          <AlertTriangle className="w-5 h-5" />
          Muammo xabari
        </button>

        {/* Photo Proof */}
        {order.status === 'ARRIVED' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-3">Yetkazish dalili</p>
            <button className="w-full flex items-center justify-center gap-2 py-4 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors">
              <Camera className="w-5 h-5" />
              Rasm olish
            </button>
            <p className="text-xs text-slate-500 text-center mt-2">Yetkazishni yakunlash uchun rasm kerak</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};