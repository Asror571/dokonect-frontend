import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConnectionRequestsFn, respondToConnectionFn } from '../../api/distributor.api';
import { CheckCircle, XCircle, Clock, Store, Phone, User } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING:  { label: 'Kutilmoqda', color: 'text-amber-600 bg-amber-50' },
  APPROVED: { label: 'Tasdiqlangan', color: 'text-green-600 bg-green-50' },
  REJECTED: { label: 'Rad etilgan', color: 'text-red-500 bg-red-50' },
};

const ConnectionRequestsPage = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['distributor-connections'],
    queryFn: getConnectionRequestsFn,
    staleTime: 30_000,
  });

  const { mutate: respond, isPending } = useMutation({
    mutationFn: respondToConnectionFn,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['distributor-connections'] });
      toast.success(vars.action === 'APPROVED' ? 'Tasdiqlandi!' : 'Rad etildi');
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const links: any[] = data?.data || data || [];
  const pending  = links.filter((l) => l.status === 'PENDING');
  const others   = links.filter((l) => l.status !== 'PENDING');

  return (
    <div className="page fade-in max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">Ulanish So'rovlari</h1>
        <p className="text-slate-500 font-medium mt-1">Do'kon egalari yuborgan ulanish so'rovlarini boshqaring.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 bg-slate-100 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <section className="mb-8">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Yangi so'rovlar — {pending.length} ta
              </p>
              <div className="space-y-3">
                {pending.map((link) => (
                  <RequestCard
                    key={link.id}
                    link={link}
                    onApprove={() => respond({ linkId: link.id, action: 'APPROVED' })}
                    onReject={() => respond({ linkId: link.id, action: 'REJECTED' })}
                    loading={isPending}
                  />
                ))}
              </div>
            </section>
          )}

          {others.length > 0 && (
            <section>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Tarix</p>
              <div className="space-y-3">
                {others.map((link) => (
                  <RequestCard key={link.id} link={link} />
                ))}
              </div>
            </section>
          )}

          {links.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
              <Store className="w-10 h-10 text-slate-300 mb-4" />
              <p className="text-slate-500 font-bold">Hozircha so'rovlar yo'q</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const RequestCard = ({
  link,
  onApprove,
  onReject,
  loading,
}: {
  link: any;
  onApprove?: () => void;
  onReject?: () => void;
  loading?: boolean;
}) => {
  const owner = link.storeOwner;
  const st = STATUS_LABEL[link.status] || STATUS_LABEL.PENDING;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
        <Store className="w-6 h-6 text-indigo-600" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-black text-slate-900 truncate">
          {owner?.storeName || owner?.user?.name || 'Do\'kon egasi'}
        </p>
        <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500 font-medium">
          {owner?.user?.name && (
            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {owner.user.name}</span>
          )}
          {owner?.user?.phone && (
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {owner.user.phone}</span>
          )}
          <span className="text-slate-400">{new Date(link.createdAt).toLocaleString('uz-UZ')}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className={`text-[11px] font-black px-3 py-1 rounded-xl uppercase tracking-widest ${st.color}`}>
          {st.label}
        </span>

        {link.status === 'PENDING' && onApprove && (
          <>
            <button
              onClick={onApprove}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-black rounded-xl transition-all disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" /> Tasdiqlash
            </button>
            <button
              onClick={onReject}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-black rounded-xl transition-all disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" /> Rad etish
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ConnectionRequestsPage;
