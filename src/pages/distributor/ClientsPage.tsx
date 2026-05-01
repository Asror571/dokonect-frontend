import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';
import {
  Users, Phone, MapPin, Package,
  AlertCircle, CheckCircle, XCircle, Search,
  ChevronRight, Clock,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import toast from 'react-hot-toast';

const tierConfig: Record<string, { label: string }> = {
  BRONZE: { label: 'Bronza' },
  SILVER: { label: 'Kumush' },
  GOLD:   { label: 'Oltin'  },
  VIP:    { label: 'VIP'    },
};

const ClientsPage = () => {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab,   setActiveTab]   = useState<'approved' | 'pending' | 'all'>('approved');

  // ── GET /api/distributor/connections ─────────────────────────────────────
  const { data: connRes, isLoading } = useQuery({
    queryKey: ['distributor-connections'],
    queryFn: () => api.get('/api/distributor/connections').then(r => r.data),
    retry: false,
  });

  const allConnections: any[] = connRes?.data || connRes?.connections || connRes || [];

  // Statusga qarab ajratish
  const approvedClients = allConnections.filter((c: any) =>
    c.status === 'APPROVED' || c.linkStatus === 'APPROVED'
  );
  const pendingClients  = allConnections.filter((c: any) =>
    c.status === 'PENDING'  || c.linkStatus === 'PENDING'
  );

  // ── PATCH /api/distributor/connections/{linkId} ───────────────────────────
  const { mutate: approveClient, isPending: approving } = useMutation({
    mutationFn: (id: string) =>
      api.patch(`/api/distributor/connections/${id}`, { status: 'APPROVED' }),
    onSuccess: () => {
      toast.success("So'rov tasdiqlandi");
      queryClient.invalidateQueries({ queryKey: ['distributor-connections'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xatolik'),
  });

  const { mutate: rejectClient, isPending: rejecting } = useMutation({
    mutationFn: (id: string) =>
      api.patch(`/api/distributor/connections/${id}`, { status: 'REJECTED' }),
    onSuccess: () => {
      toast.success("So'rov rad etildi");
      queryClient.invalidateQueries({ queryKey: ['distributor-connections'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xatolik'),
  });

  // ── Filter ────────────────────────────────────────────────────────────────
  const getClient = (c: any) => c.client || c.store || c;

  const filteredApproved = approvedClients.filter((c: any) => {
    const cl = getClient(c);
    const q  = searchQuery.toLowerCase();
    return (
      cl?.storeName?.toLowerCase().includes(q) ||
      cl?.name?.toLowerCase().includes(q)      ||
      cl?.phone?.includes(q)
    );
  });

  const totalDebt = approvedClients.reduce((sum: number, c: any) => {
    const cl = getClient(c);
    return sum + (cl?.totalDebt || 0);
  }, 0);

  const clientsWithDebt = approvedClients.filter((c: any) => getClient(c)?.totalDebt > 0);

  const displayList = activeTab === 'approved'
    ? (searchQuery ? filteredApproved : approvedClients)
    : activeTab === 'pending'
    ? pendingClients
    : allConnections;

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-violet-500" />
    </div>
  );

  return (
    <div className="fade-in space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mijozlar</h1>
          <p className="text-slate-500 text-sm mt-1">
            {approvedClients.length} ta do'kon ulangan
            {pendingClients.length > 0 && ` • ${pendingClients.length} ta kutilmoqda`}
          </p>
        </div>
        {totalDebt > 0 && (
          <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
            <span className="text-red-600 font-semibold">
              Umumiy nasiya: {totalDebt.toLocaleString()} UZS
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Ulangan do\'konlar', value: approvedClients.length,      icon: Users,       bg: 'bg-violet-100', c: 'text-violet-600' },
          { label: 'Kutilmoqda',         value: pendingClients.length,        icon: Clock,       bg: 'bg-amber-100',  c: 'text-amber-600'  },
          { label: 'Jami ulanishlar',    value: allConnections.length,        icon: Package,     bg: 'bg-sky-100',    c: 'text-sky-600'    },
          { label: 'Nasiyadorlar',       value: clientsWithDebt.length,       icon: AlertCircle, bg: 'bg-red-100',    c: 'text-red-600'    },
        ].map((card) => (
          <div key={card.label} className="bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${card.bg} ${card.c} flex items-center justify-center`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                <p className="text-xs text-slate-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

        {/* Tabs + Search */}
        <div className="border-b border-slate-100 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'approved', label: 'Ulangan do\'konlar', count: approvedClients.length },
              { id: 'pending',  label: "Ulanish so'rovlari", count: pendingClients.length  },
              { id: 'all',      label: 'Barchasi',           count: allConnections.length  },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-violet-100' : 'bg-slate-200'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Qidirish..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
          </div>
        </div>

        <div className="p-4">
          {displayList.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{activeTab === 'pending' ? "Kutilayotgan so'rovlar yo'q" : "Mijozlar topilmadi"}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayList.map((conn: any) => {
                const cl     = getClient(conn);
                const status = conn.status || conn.linkStatus;
                const isPending = status === 'PENDING';

                return (
                  <div key={conn.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isPending
                        ? 'bg-amber-50 border-amber-100'
                        : 'bg-white border-slate-100 hover:border-violet-200 hover:shadow-sm cursor-pointer group'
                    }`}
                    onClick={!isPending ? () => navigate(`/distributor/clients/${conn.id}`) : undefined}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-violet-200 text-violet-700 flex items-center justify-center font-bold text-lg">
                        {(cl?.storeName || cl?.name || 'S').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-slate-900">{cl?.storeName || cl?.name || 'Do\'kon'}</p>
                          {cl?.tier && tierConfig[cl.tier] && (
                            <Badge variant={cl.tier === 'VIP' ? 'primary' : cl.tier === 'GOLD' ? 'warning' : 'secondary'}>
                              {tierConfig[cl.tier].label}
                            </Badge>
                          )}
                          {isPending && <Badge variant="warning"><Clock className="w-3 h-3 inline mr-1" />Kutilmoqda</Badge>}
                          {status === 'APPROVED' && <Badge variant="success">Ulangan</Badge>}
                          {status === 'REJECTED' && <Badge variant="danger">Rad etilgan</Badge>}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 flex-wrap">
                          {(cl?.phone || cl?.user?.phone) && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" /> {cl.phone || cl.user?.phone}
                            </span>
                          )}
                          {(cl?.region || cl?.address) && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" /> {cl.region || cl.address}
                            </span>
                          )}
                          {cl?.totalOrders !== undefined && (
                            <span className="flex items-center gap-1">
                              <Package className="w-3.5 h-3.5" /> {cl.totalOrders} ta buyurtma
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* Savdo va nasiya */}
                      {!isPending && cl?.totalSpent > 0 && (
                        <div className="text-right hidden md:block">
                          <p className="font-semibold text-slate-900">{(cl.totalSpent || 0).toLocaleString()} UZS</p>
                          <p className="text-xs text-slate-500">Jami savdo</p>
                        </div>
                      )}
                      {!isPending && cl?.totalDebt > 0 && (
                        <div className="text-right px-3 py-1.5 bg-red-50 rounded-xl hidden md:block">
                          <p className="font-semibold text-red-600">{cl.totalDebt.toLocaleString()} UZS</p>
                          <p className="text-xs text-red-500">Nasiya</p>
                        </div>
                      )}

                      {/* Pending tugmalar */}
                      {isPending && (
                        <div className="flex gap-2">
                          <button onClick={(e) => { e.stopPropagation(); approveClient(conn.id); }}
                            disabled={approving}
                            className="flex items-center gap-1 px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-50">
                            <CheckCircle className="w-4 h-4" /> Tasdiqlash
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); rejectClient(conn.id); }}
                            disabled={rejecting}
                            className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50">
                            <XCircle className="w-4 h-4" /> Rad etish
                          </button>
                        </div>
                      )}

                      {!isPending && (
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-violet-500 transition-colors" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;