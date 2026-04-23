import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { DollarSign, ShoppingBag, AlertTriangle, Users, Package, ArrowRight, Plus } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';
import { getDistributorDashboardFn, getDistributorOrdersFn } from '../../api/ distributor.api';

const ORDER_STATUS_LIST = [
  { key: 'new',        label: 'Yangi',          color: 'bg-blue-50   text-blue-600'   },
  { key: 'accepted',   label: 'Qabul qilingan', color: 'bg-green-50  text-green-600'  },
  { key: 'assigned',   label: 'Tayinlangan',    color: 'bg-purple-50 text-purple-600' },
  { key: 'in_transit', label: "Yo'lda",         color: 'bg-indigo-50 text-indigo-600' },
  { key: 'delivered',  label: 'Yetkazilgan',    color: 'bg-teal-50   text-teal-600'   },
  { key: 'cancelled',  label: 'Bekor qilingan', color: 'bg-red-50    text-red-600'    },
  { key: 'rejected',   label: 'Rad etilgan',    color: 'bg-gray-50   text-gray-600'   },
];

export const DistributorDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const { data: dashboardRes, isLoading } = useQuery({
    queryKey: ['distributor-dashboard'],
    queryFn: getDistributorDashboardFn,
    staleTime: 30_000,
  });

  const { data: ordersRes } = useQuery({
    queryKey: ['distributor-recent-orders-simple'],
    queryFn: () => getDistributorOrdersFn({ limit: 5 } as any),
    staleTime: 30_000,
  });

  const stats = dashboardRes?.data || dashboardRes || {};
  const recentOrders: any[] = ordersRes?.data?.orders || ordersRes?.orders || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const kpiCards = [
    {
      label: 'Bugungi savdo',
      value: `${(stats.todaySales || 0).toLocaleString('uz-UZ')} so'm`,
      icon: DollarSign,
      bg: 'bg-green-100', color: 'text-green-600',
    },
    {
      label: 'Yangi buyurtmalar',
      value: stats.orderStats?.new || 0,
      icon: ShoppingBag,
      bg: 'bg-blue-100', color: 'text-blue-600',
    },
    {
      label: 'Kam qolgan mahsulotlar',
      value: stats.lowStockCount || 0,
      icon: AlertTriangle,
      bg: 'bg-yellow-100', color: 'text-yellow-600',
    },
    {
      label: 'Faol haydovchilar',
      value: stats.activeDrivers || 0,
      icon: Users,
      bg: 'bg-purple-100', color: 'text-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Xush kelibsiz, {user?.name}!</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/distributor/products/add')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg transition"
              >
                <Plus className="w-4 h-4" /> Mahsulot
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
              >
                Chiqish
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`p-3 ${card.bg} rounded-lg`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Status Grid */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Buyurtmalar holati</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {ORDER_STATUS_LIST.map((s) => (
              <div key={s.key} className={`text-center p-4 rounded-lg ${s.color.split(' ')[0]}`}>
                <p className={`text-2xl font-bold ${s.color.split(' ')[1]}`}>
                  {stats.orderStats?.[s.key] || 0}
                </p>
                <p className="text-xs text-gray-600 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">So'nggi buyurtmalar</h2>
            <button
              onClick={() => navigate('/distributor/orders')}
              className="flex items-center gap-1 text-sm text-sky-500 hover:text-sky-600 font-medium"
            >
              Barchasi <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentOrders.length > 0 ? recentOrders.map((order: any) => (
              <div
                key={order.id}
                onClick={() => navigate(`/distributor/orders/${order.id}`)}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
              >
                <div>
                  <p className="font-medium text-gray-900 text-sm">{order.client?.storeName || "Do'kon"}</p>
                  <p className="text-xs text-gray-400">{format(new Date(order.createdAt), 'dd MMM, HH:mm', { locale: uz })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-bold text-sky-600">{(order.totalAmount || 0).toLocaleString('uz-UZ')} UZS</p>
                  <Badge variant="warning">{order.status}</Badge>
                </div>
              </div>
            )) : (
              <p className="text-center text-gray-400 py-6 text-sm">Buyurtmalar yo'q</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Mahsulot qo\'shish', desc: 'Yangi mahsulot yaratish', path: '/distributor/products/add', bg: 'bg-blue-100', color: 'text-blue-600', icon: Package },
            { label: 'Buyurtmalar',       desc: 'Buyurtmalarni ko\'rish',  path: '/distributor/orders',       bg: 'bg-green-100',  color: 'text-green-600',  icon: ShoppingBag },
            { label: 'Inventar',          desc: 'Zaxirani boshqarish',     path: '/distributor/inventory',    bg: 'bg-purple-100', color: 'text-purple-600', icon: AlertTriangle },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition text-left"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 ${item.bg} rounded-lg`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.label}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};