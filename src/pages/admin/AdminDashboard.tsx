import React from 'react';
import {
  Package,
  DollarSign,
  Truck,
  Clock,
  MapPin,
} from 'lucide-react';
import { KPICard } from '../../components/ui/KPICard';
import { OrderCard } from '../../components/ui/OrderCard';
import { DriverCard } from '../../components/ui/DriverCard';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/api';

export const AdminDashboard: React.FC = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/api/admin/dashboard').then(res => res.data),
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: () => api.get('/api/admin/orders').then(res => res.data),
  });

  const { data: activeDrivers } = useQuery({
    queryKey: ['active-drivers'],
    queryFn: () => api.get('/api/admin/drivers/active').then(res => res.data),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Welcome back! Here's what's happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <KPICard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={Package}
          trend={stats?.ordersTrend}
          trendLabel="vs yesterday"
          color="primary"
        />
        <KPICard
          title="Revenue"
          value={`${(stats?.revenue || 0).toLocaleString()} UZS`}
          icon={DollarSign}
          trend={stats?.revenueTrend}
          trendLabel="vs yesterday"
          color="success"
        />
        <KPICard
          title="Active Drivers"
          value={stats?.activeDrivers || 0}
          icon={Truck}
          color="warning"
        />
        <KPICard
          title="Pending Deliveries"
          value={stats?.pendingDeliveries || 0}
          icon={Clock}
          color="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-base sm:text-xl font-bold text-gray-900">Recent Orders</h2>
              <button className="text-sky-600 hover:text-sky-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {recentOrders?.map((order: any) => (
                <OrderCard key={order.id} order={order} variant="expanded" />
              ))}
            </div>
          </div>
        </div>

        {/* Active Drivers */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-base sm:text-xl font-bold text-gray-900">Active Drivers</h2>
              <span className="text-sm text-gray-600">{activeDrivers?.length || 0} online</span>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {activeDrivers?.map((driver: any) => (
                <DriverCard key={driver.id} driver={driver} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Map Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-4">Live Driver Locations</h2>
        <div className="h-48 sm:h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm sm:text-base">Map integration coming soon</p>
            <p className="text-xs sm:text-sm text-gray-500">Mapbox GL JS / Google Maps</p>
          </div>
        </div>
      </div>
    </div>
  );
};
