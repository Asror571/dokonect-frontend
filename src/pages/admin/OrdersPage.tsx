import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Download } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { format } from 'date-fns';
import { getAdminOrdersFn } from '../../api/admin.api';

const STATUS_LIST = ['ALL','NEW','ACCEPTED','ASSIGNED','IN_TRANSIT','DELIVERED','CANCELLED','REJECTED'];

export const OrdersPage: React.FC = () => {
  const [searchQuery,  setSearchQuery]  = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: ordersRes, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: () => getAdminOrdersFn({ status: statusFilter !== 'ALL' ? statusFilter : undefined }),
  });

  const allOrders: any[] = ordersRes?.data?.orders || ordersRes?.orders || ordersRes?.data || [];

  const filtered = allOrders.filter((o: any) =>
    o.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.client?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.client?.storeName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { key: 'id',          label: 'Buyurtma ID', sortable: true, render: (o: any) => <span className="font-mono text-sm">#{o.id.slice(0,8)}</span> },
    { key: 'client',      label: 'Mijoz',       render: (o: any) => o.client?.storeName || o.client?.user?.name || 'N/A' },
    { key: 'distributor', label: 'Distribyutor',render: (o: any) => o.distributor?.companyName || 'N/A' },
    { key: 'driver',      label: 'Haydovchi',   render: (o: any) => o.driver?.user?.name || 'Tayinlanmagan' },
    { key: 'totalAmount', label: 'Summa',        sortable: true, render: (o: any) => `${(o.totalAmount||0).toLocaleString('uz-UZ')} UZS` },
    { key: 'status',      label: 'Holat',        sortable: true, render: (o: any) => <StatusBadge status={o.status} size="sm" /> },
    { key: 'createdAt',   label: 'Sana',         sortable: true, render: (o: any) => format(new Date(o.createdAt), 'MMM dd, HH:mm') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Buyurtmalar boshqaruvi</h1>
        <p className="text-gray-600 mt-1">Barcha buyurtmalarni ko'rish va boshqarish</p>
      </div>

      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buyurtma ID yoki mijoz nomi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
                {STATUS_LIST.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'Barcha holatlar' : s}</option>)}
              </select>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors">
              <Download className="w-5 h-5" /> Eksport CSV
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
            <p className="text-gray-600 mt-2">Yuklanmoqda...</p>
          </div>
        ) : (
          <DataTable data={filtered} columns={columns} searchable={false} onRowClick={(o) => console.log(o)} />
        )}
      </div>
    </div>
  );
};