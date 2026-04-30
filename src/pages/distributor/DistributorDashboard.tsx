import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Package, AlertTriangle, TrendingUp, DollarSign, Plus, ArrowRight, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';
import toast from 'react-hot-toast';

import { getProductAlertsFn, checkProductAlertsFn, markAlertAsReadFn } from '../../api/product-alerts.api';
import { useAuthStore } from '../../store/authStore';
import SalesChart from '../../components/analytics/SalesChart';
import { Badge } from '../../components/ui/Badge';
import { getDistributorDashboardFn, getDistributorOrdersFn } from '../../api/distributor.api';

export const DistributorDashboard: React.FC = () => {
  const { user }    = useAuthStore();
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  // ── Dashboard stats ───────────────────────────────────────────────────────
  const { data: dashRes, isLoading: dashLoading } = useQuery({
    queryKey: ['distributor-dashboard'],
    queryFn: getDistributorDashboardFn,
    staleTime: 30_000,
    retry: false,           // ← 500 da qayta urinmaslik
  });

  // ── Recent orders ─────────────────────────────────────────────────────────
  const { data: ordersRes, isLoading: ordersLoading } = useQuery({
    queryKey: ['distributor-recent-orders'],
    queryFn: () => getDistributorOrdersFn({ limit: 5 } as any),
    staleTime: 30_000,
    retry: false,
  });

  // ── Product alerts ────────────────────────────────────────────────────────
  const { data: alertsData } = useQuery({
    queryKey: ['product-alerts', 'unread'],
    queryFn: () => getProductAlertsFn(false),
    staleTime: 60_000,
    retry: false,
  });

  // ── Check alerts (sahifa ochilganda) ──────────────────────────────────────
  const { mutate: checkAlerts } = useMutation({
    mutationFn: checkProductAlertsFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product-alerts'] }),
    onError: () => {},      // ← 500 xatoni jimgina o'tkazib yuborish
  });

  useEffect(() => { checkAlerts(); }, []);

  // ── Mark alert as read ────────────────────────────────────────────────────
  const { mutate: markRead } = useMutation({
    mutationFn: (id: string) => markAlertAsReadFn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-alerts'] });
      toast.success("Ogohlantirish o'qildi");
    },
    onError: () => {},
  });

  // ── Data ──────────────────────────────────────────────────────────────────
  const stats         = dashRes?.data || dashRes || {};
  const recentOrders: any[] = ordersRes?.data?.orders || ordersRes?.orders || [];
  const alerts: any[] = alertsData?.alerts || alertsData?.data?.alerts || [];
  const unreadCount   = alerts.length;

  const salesTrend    = stats.salesTrend || [];
  const currentSales  = salesTrend[salesTrend.length - 1]?.sales || 0;
  const previousSales = salesTrend[salesTrend.length - 2]?.sales || 0;
  const growth = previousSales > 0 ? ((currentSales - previousSales) / previousSales) * 100 : 0;

  const getStatusColor = (s: string) =>
    ({ NEW: 'warning', ACCEPTED: 'primary', DELIVERED: 'success', CANCELLED: 'danger', IN_TRANSIT: 'info' } as any)[s] || 'secondary';

  if (dashLoading || ordersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500" />
      </div>
    );
  }

  return (
    <div className="fade-in space-y-6 max-w-7xl mx-auto pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Xush kelibsiz, {user?.name || 'Distributor'}! 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">Bugungi biznes ko'rsatkichlaringizni kuzating.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/distributor/products/add')}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-all font-medium text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" /> Mahsulot qo'shish
          </button>
          <button
            onClick={() => navigate('/distributor/orders')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-medium text-sm shadow-sm"
          >
            <Package className="w-4 h-4" /> Barcha buyurtmalar
          </button>
        </div>
      </div>

      {/* Alerts banner */}
      {unreadCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-amber-500 animate-pulse" />
            <h3 className="font-semibold text-amber-800">{unreadCount} ta o'qilmagan ogohlantirish</h3>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert: any) => (
              <div key={alert.id} className="flex items-center justify-between bg-white/70 rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{alert.message}</p>
                    {alert.product && (
                      <p className="text-xs text-slate-500">{alert.product.name} — {alert.product.sku}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => markRead(alert.id)}
                  className="text-xs text-amber-600 hover:text-amber-800 font-semibold ml-4 shrink-0"
                >
                  O'qildi
                </button>
              </div>
            ))}
            {unreadCount > 3 && (
              <p className="text-xs text-amber-600 text-center font-medium pt-1">
                + {unreadCount - 3} ta boshqa
              </p>
            )}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Bugungi tushum',
            value: `${(stats.revenue || 0).toLocaleString('uz-UZ')} UZS`,
            icon: DollarSign, bg: 'bg-emerald-50', c: 'text-emerald-500',
          },
          {
            label: 'Yangi buyurtmalar',
            value: `${stats.incomingOrders || 0} ta`,
            icon: Package, bg: 'bg-sky-50', c: 'text-sky-500',
          },
          {
            label: 'Tayyorlanmoqda',
            value: `${stats.readyOrders || 0} ta`,
            icon: AlertTriangle, bg: 'bg-amber-50', c: 'text-amber-500',
            onClick: () => navigate('/distributor/orders'),
          },
          {
            label: "Yetkazilayotgan",
            value: `${stats.shippedOrders || 0} ta`,
            icon: TrendingUp,
            bg: 'bg-green-50',
            c: 'text-green-500',
          },
        ].map((card) => (
          <div
            key={card.label}
            onClick={(card as any).onClick}
            className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow ${(card as any).onClick ? 'cursor-pointer' : ''}`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">{card.label}</p>
              <div className={`w-10 h-10 rounded-full ${card.bg} ${card.c} flex items-center justify-center`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-4">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Chart + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart
            data={salesTrend.map((s: any) => ({ sana: s.date, sotuv: s.sales }))}
            title="Sotuv dinamikasi (Oxirgi 7 kun)"
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">So'nggi buyurtmalar</h2>
            <button
              onClick={() => navigate('/distributor/orders')}
              className="text-sm text-sky-500 font-medium hover:text-sky-600 flex items-center gap-1 group"
            >
              Barchasi <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div className="space-y-3 flex-1">
            {recentOrders.length > 0 ? (
              recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  onClick={() => navigate(`/distributor/orders/${order.id}`)}
                  className="flex flex-col p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-semibold text-slate-900">
                      {order.client?.storeName || "Do'kon"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {format(new Date(order.createdAt), 'dd MMM, HH:mm', { locale: uz })}
                    </p>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-[13px] font-bold text-slate-700">
                      {(order.totalAmount || 0).toLocaleString('uz-UZ')} UZS
                    </p>
                    <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center flex-1 text-slate-400 text-sm h-32">
                Buyurtmalar yo'q
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};