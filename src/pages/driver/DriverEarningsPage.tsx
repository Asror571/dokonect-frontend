import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Award, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { getDriverEarningsFn } from '../../api/driver.api';

const TABS = [
  { key: 'today', label: 'Bugun' },
  { key: 'week',  label: 'Hafta' },
  { key: 'month', label: 'Oy'    },
];

export const DriverEarningsPage: React.FC = () => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  const { data: earningsRes } = useQuery({
    queryKey: ['driver-earnings', period],
    queryFn: () => getDriverEarningsFn(period),
    staleTime: 30_000,
  });

  const earnings     = earningsRes?.data || earningsRes || {};
  const earningsList: any[] = earnings.earnings || [];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Daromadlar</h1>
        <p className="text-slate-400">Daromad va bonuslarni kuzating</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-white/20 rounded-full"><DollarSign className="w-6 h-6" /></div>
          <div>
            <p className="text-green-100 text-sm">Jami daromad</p>
            <p className="text-3xl font-bold">{(earnings.total || 0).toLocaleString('uz-UZ')} UZS</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-100">
          <TrendingUp className="w-4 h-4" />
          <span>Tanlangan davr bo'yicha</span>
        </div>
      </motion.div>

      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setPeriod(tab.key as any)}
            className={`flex-1 py-3 rounded-xl font-medium transition-colors ${period === tab.key ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-amber-400" />
          <span className="font-semibold">Bonuslar</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { emoji: '🔥', label: '7 kunlik streak', bonus: 50_000 },
            { emoji: '⭐', label: 'Top baholangan',  bonus: 30_000 },
            { emoji: '📦', label: '10 ta yetkazish', bonus: 20_000 },
            { emoji: '🚀', label: 'Tez yetkazish',   bonus: 15_000 },
          ].map((b, i) => (
            <div key={i} className="bg-slate-700 rounded-lg p-3 text-center">
              <p className="text-2xl mb-1">{b.emoji}</p>
              <p className="text-xs text-slate-400">{b.label}</p>
              <p className="text-sm font-bold text-amber-400">+{b.bonus.toLocaleString('uz-UZ')} UZS</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold">Daromad tafsiloti</span>
          <button className="text-sky-400 text-sm flex items-center gap-1"><Download className="w-4 h-4" /> Eksport</button>
        </div>
        <div className="space-y-3">
          {earningsList.map((earning: any, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <div>
                <p className="font-medium">Buyurtma #{earning.orderId?.slice(0, 8)}</p>
                <p className="text-xs text-slate-400">{format(new Date(earning.date), 'MMM dd, HH:mm')}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-400">+{(earning.amount || 0).toLocaleString('uz-UZ')} UZS</p>
                {earning.bonus > 0 && <p className="text-xs text-amber-400">+{earning.bonus.toLocaleString('uz-UZ')} bonus</p>}
              </div>
            </motion.div>
          ))}
          {earningsList.length === 0 && <div className="text-center py-8 text-slate-500">Bu davr uchun daromad yo'q</div>}
        </div>
      </div>

      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        className="w-full bg-sky-500 text-white py-4 rounded-xl font-bold hover:bg-sky-600 transition-colors shadow-lg">
        Pul chiqarish so'rovi
      </motion.button>
    </div>
  );
};