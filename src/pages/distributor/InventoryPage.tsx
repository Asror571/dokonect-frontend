import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Warehouse, History, Search, Download, RefreshCw, AlertTriangle, Edit3, X, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import api from '../../api/api';
import { getProductAlertsFn, checkProductAlertsFn, markAlertAsReadFn, updateProductVelocitiesFn } from '../../api/product-alerts.api';
import { deleteProductFn } from '../../api/product.api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { getDistributorStockLogsFn, updateDistributorProductStockFn } from '../../api/distributor.api';

const InventoryPage = () => {
  const queryClient = useQueryClient();
  const navigate    = useNavigate();
  const [searchTerm,      setSearchTerm]      = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [showLogs,        setShowLogs]        = useState(false);
  const [editStock,       setEditStock]       = useState<{ productId: string; name: string; current: number } | null>(null);
  const [stockInput,      setStockInput]      = useState('');
  const [stockType,       setStockType]       = useState<'ADD' | 'SUBTRACT' | 'SET'>('ADD');
  const [confirmDelete,   setConfirmDelete]   = useState<{ id: string; name: string } | null>(null);

  // ── Inventory ─────────────────────────────────────────────────────────────
  const { data: inventoryResponse, isLoading } = useQuery({
    queryKey: ['distributor-inventory'],
    queryFn: () => api.get('/api/distributor/inventory').then(r => r.data?.data?.inventory || r.data?.inventory || []),
    staleTime: 30_000,
  });

  // ── Stock Logs ────────────────────────────────────────────────────────────
  const { data: logsData } = useQuery({
    queryKey: ['distributor-stock-logs'],
    queryFn: getDistributorStockLogsFn,
    enabled: showLogs,
  });

  // ── Alerts ────────────────────────────────────────────────────────────────
  const { data: alertsData } = useQuery({
    queryKey: ['product-alerts', 'unread'],
    queryFn: () => getProductAlertsFn(false),
    staleTime: 60_000,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const { mutate: checkAlerts, isPending: isChecking } = useMutation({
    mutationFn: checkProductAlertsFn,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['product-alerts'] }); toast.success('Yangilandi'); },
  });

  const { mutate: markRead } = useMutation({
    mutationFn: (id: string) => markAlertAsReadFn(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product-alerts'] }),
  });

  const { mutate: updateVelocities, isPending: isUpdating } = useMutation({
    mutationFn: updateProductVelocitiesFn,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['distributor-inventory'] }); toast.success('Tezliklar yangilandi'); },
    onError: () => toast.error('Xatolik'),
  });

  const { mutate: updateStock, isPending: isStockUpdating } = useMutation({
    mutationFn: updateDistributorProductStockFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributor-inventory'] });
      toast.success('Zaxira yangilandi');
      setEditStock(null);
      setStockInput('');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xatolik'),
  });

  const { mutate: deleteProduct, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteProductFn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributor-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['distributor-products'] });
      toast.success("Mahsulot o'chirildi");
      setConfirmDelete(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xatolik'),
  });

  const inventory: any[] = inventoryResponse || [];
  const alerts: any[]    = alertsData?.alerts || alertsData?.data?.alerts || [];
  const logs: any[]      = logsData?.data?.logs || logsData?.logs || [];
  const warehouses       = [...new Set(inventory.map((inv: any) => inv.warehouse?.name).filter(Boolean))];

  const filteredInventory = inventory.filter((inv: any) => {
    const q = searchTerm.toLowerCase();
    const matchSearch = inv.product?.name?.toLowerCase().includes(q) || inv.product?.sku?.toLowerCase().includes(q);
    const matchWh     = !warehouseFilter || inv.warehouse?.name === warehouseFilter;
    return matchSearch && matchWh;
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500" /></div>;
  }

  return (
    <div className="fade-in space-y-6 max-w-7xl mx-auto pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 underline underline-offset-8 decoration-sky-500 decoration-2">Sklad va Inventar</h1>
          <p className="text-slate-500 text-sm mt-1">Mahsulotlar qoldig'i va omborlardagi zaxirani boshqaring.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" className="gap-2 px-4 py-2 text-sm" onClick={() => checkAlerts()} disabled={isChecking}>
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} /> Tekshirish
          </Button>
          <Button variant="secondary" className="gap-2 px-4 py-2 text-sm bg-violet-50 text-violet-600 border-violet-100 hover:bg-violet-100" onClick={() => updateVelocities()} disabled={isUpdating}>
            <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} /> Tezlikni yangilash
          </Button>
          <Button variant="secondary" className="gap-2 px-4 py-2 text-sm bg-sky-50 text-sky-600 border-sky-100 hover:bg-sky-100">
            <Download className="w-4 h-4" /> Eksport
          </Button>
          <Button variant="secondary" className="gap-2 px-4 py-2 text-sm" onClick={() => setShowLogs(!showLogs)}>
            <History className="w-4 h-4" /> {showLogs ? "Jadvalni ko'rish" : 'Tarix'}
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-amber-800">{alerts.length} ta ogohlantirish</h3>
          </div>
          {alerts.map((alert: any) => (
            <div key={alert.id} className="flex items-center justify-between bg-white/80 rounded-xl px-4 py-2.5">
              <div>
                <p className="text-sm font-medium text-slate-800">{alert.message}</p>
                {alert.product && <p className="text-xs text-slate-500">{alert.product.name} — {alert.product.sku}</p>}
              </div>
              <button onClick={() => markRead(alert.id)} className="text-xs text-amber-600 hover:text-amber-800 font-semibold ml-4 shrink-0">O'qildi ✓</button>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Jami mahsulotlar',  value: inventory.length, border: '' },
          { label: 'Kam qolganlar',     value: inventory.filter((i: any) => (i.available ?? i.quantity - i.reserved) <= (i.minThreshold ?? 5)).length, border: 'border-l-4 border-l-red-400',   valueClass: 'text-red-500' },
          { label: 'Band qilingan',     value: inventory.reduce((a: number, i: any) => a + (i.reserved || 0), 0), border: 'border-l-4 border-l-amber-400', valueClass: 'text-amber-500' },
          { label: 'Omborlar',          value: warehouses.length || 1, border: 'border-l-4 border-l-sky-400', valueClass: 'text-sky-500' },
        ].map((s) => (
          <div key={s.label} className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm ${s.border}`}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
            <p className={`text-2xl font-bold ${(s as any).valueClass || 'text-slate-900'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Stock Logs Modal */}
      {showLogs && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Zaxira tarixi</h3>
          {logs.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">Tarix bo'sh</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Mahsulot</th>
                    <th className="px-4 py-3">Tur</th>
                    <th className="px-4 py-3">Miqdor</th>
                    <th className="px-4 py-3">Sana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.slice(0, 20).map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{log.product?.name || '—'}</td>
                      <td className="px-4 py-3"><Badge variant={log.type === 'ADD' ? 'success' : 'danger'}>{log.type}</Badge></td>
                      <td className="px-4 py-3 font-bold">{log.quantity}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Stock Update Modal */}
      {editStock && createPortal(
        <div className="fixed inset-0 bg-black/40 z-9999 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Zaxira yangilash</h3>
              <button onClick={() => setEditStock(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <p className="text-sm text-slate-600 mb-4">{editStock.name} — Hozir: <strong>{editStock.current}</strong></p>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {(['ADD', 'SUBTRACT', 'SET'] as const).map((t) => (
                  <button key={t} onClick={() => setStockType(t)} className={`py-2 rounded-xl text-xs font-semibold border transition ${stockType === t ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-600'}`}>{t === 'ADD' ? "Qo'shish" : t === 'SUBTRACT' ? "Ayirish" : "Belgilash"}</button>
                ))}
              </div>
              <input
                type="number"
                min="0"
                placeholder="Miqdor"
                value={stockInput}
                onChange={(e) => setStockInput(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <Button
                className="w-full"
                isLoading={isStockUpdating}
                onClick={() => {
                  if (!stockInput) return toast.error('Miqdor kiriting');
                  updateStock({ productId: editStock.productId, data: { quantity: Number(stockInput), type: stockType } });
                }}
              >
                Saqlash
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete && createPortal(
        <div className="fixed inset-0 bg-black/40 z-9999 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Mahsulotni o'chirish</h3>
              <button onClick={() => setConfirmDelete(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              <strong>{confirmDelete.name}</strong> mahsulotini o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmDelete(null)}>
                Bekor qilish
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600 border-red-500"
                isLoading={isDeleting}
                onClick={() => deleteProduct(confirmDelete.id)}
              >
                O'chirish
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Mahsulot yoki SKU..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 focus:bg-white transition-all" />
          </div>
          <select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500">
            <option value="">Barcha omborlar</option>
            {warehouses.map((w: any) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-widest font-bold">
              <tr>
                <th className="px-3 sm:px-6 py-3">Mahsulot</th>
                <th className="px-3 sm:px-6 py-3 hidden md:table-cell">Ombor</th>
                <th className="px-3 sm:px-6 py-3 hidden sm:table-cell">Jami</th>
                <th className="px-3 sm:px-6 py-3 hidden lg:table-cell">Band</th>
                <th className="px-3 sm:px-6 py-3">Mavjud</th>
                <th className="px-3 sm:px-6 py-3 hidden lg:table-cell">Tezlik</th>
                <th className="px-3 sm:px-6 py-3 hidden sm:table-cell">Holati</th>
                <th className="px-3 sm:px-6 py-3">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredInventory.map((inv: any) => {
                const available = inv.available ?? (inv.quantity - inv.reserved);
                const isLow     = available <= (inv.minThreshold ?? 5);
                const photoUrl  = inv.product?.images?.[0]?.url;
                return (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-3 sm:px-6 py-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden shrink-0">
                          {photoUrl ? <img src={photoUrl} alt={inv.product?.name} className="w-full h-full object-cover" /> : <Package className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-xs sm:text-sm truncate max-w-32 sm:max-w-none">{inv.product?.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{inv.product?.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Warehouse className="w-4 h-4 text-slate-300" />
                        <span className="font-semibold text-xs uppercase tracking-tighter">{inv.warehouse?.name || 'Asosiy ombor'}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 font-bold text-slate-700 hidden sm:table-cell">{inv.quantity ?? '—'}</td>
                    <td className="px-3 sm:px-6 py-3 font-bold text-amber-500 hidden lg:table-cell">{inv.reserved ?? 0}</td>
                    <td className={`px-3 sm:px-6 py-3 font-bold ${isLow ? 'text-red-500' : 'text-emerald-600'}`}>{available}</td>
                    <td className="px-3 sm:px-6 py-3 hidden lg:table-cell">
                      {inv.product?.velocityStatus ? (
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                          inv.product.velocityStatus === 'fast'   ? 'bg-green-100 text-green-700' :
                          inv.product.velocityStatus === 'medium' ? 'bg-blue-100 text-blue-700'   :
                          inv.product.velocityStatus === 'slow'   ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-red-100 text-red-700'
                        }`}>
                          {inv.product.velocityStatus === 'fast' ? '🚀 Tez' : inv.product.velocityStatus === 'medium' ? "📦 O'rta" : inv.product.velocityStatus === 'slow' ? '🐢 Sekin' : '💀 Harakatsiz'}
                        </span>
                      ) : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td className="px-3 sm:px-6 py-3 hidden sm:table-cell">
                      <Badge variant={isLow ? 'danger' : 'success'}>{isLow ? 'Kam qolgan' : 'Zaxira bor'}</Badge>
                    </td>
                    <td className="px-3 sm:px-6 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => { setEditStock({ productId: inv.product?.id || inv.productId, name: inv.product?.name || '—', current: available }); setStockInput(''); setStockType('ADD'); }}
                          className="flex items-center gap-1 px-2 py-1.5 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors text-xs font-semibold"
                          title="Zaxira"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Zaxira</span>
                        </button>
                        <button
                          onClick={() => navigate('/distributor/products/add', { state: inv.product })}
                          className="flex items-center gap-1 px-2 py-1.5 bg-violet-50 text-violet-600 rounded-lg hover:bg-violet-100 transition-colors text-xs font-semibold"
                          title="Tahrir"
                        >
                          <Pencil className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Tahrir</span>
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ id: inv.product?.id || inv.productId, name: inv.product?.name || '—' })}
                          className="flex items-center gap-1 px-2 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors text-xs font-semibold"
                          title="O'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> <span className="hidden lg:inline">O'chirish</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredInventory.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400">Inventar topilmadi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;