import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag, Plus, Trash2, Edit2, Ticket, Users } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import toast from 'react-hot-toast';
import { getPromoCodesFn, deletePromoCodeFn } from '../../api/promo-codes.api';
import { getBulkRulesFn, deleteBulkRuleFn } from '../../api/pricing.api';
import { useAuthStore } from '../../store/authStore';

const PricingPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'promo' | 'bulk'>('promo');

  const { data: promoRes } = useQuery({ queryKey: ['promo-codes'], queryFn: getPromoCodesFn, staleTime: 30_000 });
  const { data: bulkRes }  = useQuery({ queryKey: ['bulk-rules', user?.distributorId], queryFn: () => getBulkRulesFn(user?.distributorId || ''), enabled: !!user?.distributorId, staleTime: 30_000 });

  const { mutate: deletePromo } = useMutation({ mutationFn: deletePromoCodeFn, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['promo-codes'] }); toast.success("O'chirildi"); } });
  const { mutate: deleteBulk }  = useMutation({ mutationFn: deleteBulkRuleFn,  onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bulk-rules'] }); toast.success("O'chirildi"); } });

  const promoCodes: any[] = promoRes?.data?.promoCodes || promoRes?.data || promoRes || [];
  const bulkRules: any[]  = bulkRes?.data?.rules || bulkRes?.data || bulkRes || [];

  return (
    <div className="fade-in space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 underline decoration-indigo-500 underline-offset-8">Narxlash va Kampaniyalar</h1>
          <p className="text-slate-500 text-sm mt-1">Promo-kodlar va ulgurji chegirmalarni boshqaring.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-sm shadow-lg shadow-indigo-600/20">
          <Plus className="w-4 h-4" /> {activeTab === 'promo' ? 'Yangi promo-kod' : 'Yangi chegirma'}
        </button>
      </div>

      <div className="flex border-b border-slate-200">
        {[{ key:'promo', label:'Promo-kodlar', icon:Ticket }, { key:'bulk', label:'Ulgurji chegirmalar', icon:Users }].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key as any)} className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab===key ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {activeTab === 'promo' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promoCodes.map((promo: any) => (
            <div key={promo.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Tag className="w-6 h-6" /></div>
                <Badge variant="success">{promo.status || 'ACTIVE'}</Badge>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-1 uppercase">{promo.code}</h3>
              <p className="text-sm text-slate-500 mb-4">{promo.description || 'Chegirma kampaniyasi'}</p>
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Miqdori:</span>
                  <span className="font-bold text-indigo-600">{promo.discountType==='PERCENT' ? `${promo.discountValue}%` : `${(promo.discountValue||0).toLocaleString()} UZS`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Min. buyurtma:</span>
                  <span className="font-bold">{(promo.minOrderAmount||0).toLocaleString()} UZS</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 uppercase tracking-widest">Tahrirlash</button>
                <button onClick={() => window.confirm("O'chirasizmi?") && deletePromo(promo.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {promoCodes.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white border border-dashed border-slate-300 rounded-2xl">
              <Ticket className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Hali promo-kodlar yaratilmagan</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-widest font-black">
              <tr>
                <th className="px-6 py-4">Mahsulot</th>
                <th className="px-6 py-4">Min. miqdor</th>
                <th className="px-6 py-4">Max. miqdor</th>
                <th className="px-6 py-4">Chegirma</th>
                <th className="px-6 py-4">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {bulkRules.map((rule: any) => (
                <tr key={rule.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold text-slate-900">{rule.product?.name || 'Barcha mahsulotlar'}</td>
                  <td className="px-6 py-4 text-slate-600">{rule.minQuantity} dona</td>
                  <td className="px-6 py-4 text-slate-600">{rule.maxQuantity ? `${rule.maxQuantity} dona` : '—'}</td>
                  <td className="px-6 py-4 text-emerald-600 font-black">{rule.discountType==='PERCENT' ? `${rule.discountValue}%` : `${(rule.discountValue||0).toLocaleString()} UZS`}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => window.confirm("O'chirasizmi?") && deleteBulk(rule.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {bulkRules.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Chegirma qoidalari yo'q</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PricingPage;