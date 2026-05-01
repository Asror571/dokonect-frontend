import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CreditCard, Banknote, AlertCircle, Truck, CalendarDays,
  ChevronDown, ChevronUp, CheckCircle2, Clock, TrendingUp,
} from 'lucide-react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format, subDays } from 'date-fns';
import { uz } from 'date-fns/locale';
import 'react-day-picker/style.css';
import { getPaymentsAnalyticsFn } from '../../api/analytics.api';

const METHOD_LABEL: Record<string, string> = {
  CARD:         'Karta',
  BANK_TRANSFER: 'Bank o\'tkazma',
  CASH:         'Naqt',
  CREDIT:       'Kredit',
};

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  PAID:    { label: "To'langan",  cls: 'bg-emerald-100 text-emerald-700' },
  UNPAID:  { label: "To'lanmagan", cls: 'bg-red-100 text-red-700' },
  PARTIAL: { label: 'Qisman',     cls: 'bg-amber-100 text-amber-700' },
  REFUNDED:{ label: 'Qaytarildi', cls: 'bg-slate-100 text-slate-600' },
};

const PaymentsPage = () => {
  const [tab, setTab] = useState<'driver' | 'online'>('driver');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [expandedDrivers, setExpandedDrivers] = useState<Set<string>>(new Set());
  const [range, setRange] = useState<DateRange>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fromStr = range.from ? format(range.from, 'yyyy-MM-dd') : undefined;
  const toStr   = range.to   ? format(range.to,   'yyyy-MM-dd') : undefined;
  const rangeLabel = range.from && range.to
    ? `${format(range.from, 'd MMM', { locale: uz })} — ${format(range.to, 'd MMM yyyy', { locale: uz })}`
    : 'Sana tanlang';

  const { data: res, isLoading } = useQuery({
    queryKey: ['payments-analytics', fromStr, toStr],
    queryFn: () => getPaymentsAnalyticsFn({ from: fromStr, to: toStr }),
    enabled: !!fromStr,
    staleTime: 60_000,
    retry: false,
  });

  const data     = res?.data || res || {};
  const summary  = data.summary  || {};
  const drivers: any[] = data.driverPayments  || [];
  const online:  any[] = data.onlinePayments  || [];

  const toggleDriver = (id: string) => {
    setExpandedDrivers(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
    </div>
  );

  return (
    <div className="fade-in space-y-8 max-w-5xl mx-auto pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-widest underline decoration-indigo-500 decoration-2 underline-offset-8">
            To'lovlar
          </h1>
          <p className="text-slate-500 text-sm mt-1">Online va haydovchi naqt to'lovlari tahlili.</p>
        </div>

        {/* Date range */}
        <div className="relative" ref={calendarRef}>
          <button
            onClick={() => setCalendarOpen(v => !v)}
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-indigo-400 transition-all min-w-55"
          >
            <CalendarDays className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>{rangeLabel}</span>
          </button>
          {calendarOpen && (
            <div className="absolute right-0 top-12 z-50 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3">
              <DayPicker
                mode="range" selected={range}
                onSelect={(r) => { if (r) { setRange(r); if (r.from && r.to) setCalendarOpen(false); } }}
                locale={uz} disabled={{ after: new Date() }} numberOfMonths={2} className="text-sm"
              />
              <div className="flex gap-2 border-t border-slate-100 pt-2 mt-1">
                {[{ label: '7 kun', days: 7 }, { label: '30 kun', days: 30 }, { label: '90 kun', days: 90 }].map(({ label, days }) => (
                  <button key={days} onClick={() => { setRange({ from: subDays(new Date(), days), to: new Date() }); setCalendarOpen(false); }}
                    className="flex-1 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg transition-colors">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Online */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 relative overflow-hidden group cursor-pointer" onClick={() => setTab('online')}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-indigo-500" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Online to'lovlar</p>
          </div>
          <p className="text-2xl font-black text-slate-900">{(summary.onlineTotal || 0).toLocaleString('uz-UZ')} UZS</p>
          <p className="text-xs text-indigo-500 font-bold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {summary.onlineCount || 0} ta buyurtma
          </p>
        </div>

        {/* Cash (driver) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 relative overflow-hidden group cursor-pointer" onClick={() => setTab('driver')}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Haydovchi naqt</p>
          </div>
          <p className="text-2xl font-black text-slate-900">{(summary.cashTotal || 0).toLocaleString('uz-UZ')} UZS</p>
          <p className="text-xs text-emerald-500 font-bold mt-2 flex items-center gap-1">
            <Truck className="w-3 h-3" /> {summary.cashCount || 0} ta buyurtma
          </p>
        </div>

        {/* Unpaid */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">To'lanmagan</p>
          </div>
          <p className="text-2xl font-black text-slate-900">{(summary.unpaidTotal || 0).toLocaleString('uz-UZ')} UZS</p>
          <p className="text-xs text-red-500 font-bold mt-2 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Kutilmoqda
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {[
          { key: 'driver', label: 'Haydovchi naqt', icon: Truck },
          { key: 'online', label: 'Online to\'lovlar', icon: CreditCard },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
              tab === key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* ── Driver cash tab ── */}
      {tab === 'driver' && (
        <div className="space-y-4">
          {drivers.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <Banknote className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-bold">Bu davr uchun naqt to'lovlar yo'q</p>
            </div>
          ) : (
            drivers.map((driver: any) => {
              const key = driver.driverId || '__none__';
              const expanded = expandedDrivers.has(key);
              return (
                <div key={key} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Driver header */}
                  <button
                    onClick={() => toggleDriver(key)}
                    className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 font-black text-base flex items-center justify-center">
                        {(driver.driverName || 'H').charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <p className="font-black text-slate-900">{driver.driverName}</p>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">{driver.ordersCount} ta do'kondan yig'ildi</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-black text-emerald-600">
                        {(driver.totalCollected || 0).toLocaleString('uz-UZ')} UZS
                      </p>
                      {expanded
                        ? <ChevronUp className="w-5 h-5 text-slate-400" />
                        : <ChevronDown className="w-5 h-5 text-slate-400" />
                      }
                    </div>
                  </button>

                  {/* Collections list */}
                  {expanded && (
                    <div className="border-t border-slate-100 divide-y divide-slate-50">
                      {driver.collections.map((col: any, i: number) => {
                        const st = STATUS_LABEL[col.paymentStatus] || STATUS_LABEL.UNPAID;
                        return (
                          <div key={col.orderId || i} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500">
                                {i + 1}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-sm">{col.storeName}</p>
                                <p className="text-xs text-slate-400">
                                  {col.date ? format(new Date(col.date), 'd MMM yyyy, HH:mm', { locale: uz }) : '—'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-xl ${st.cls}`}>{st.label}</span>
                              <p className="font-black text-slate-900 text-sm">{(col.amount || 0).toLocaleString('uz-UZ')} UZS</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Online payments tab ── */}
      {tab === 'online' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {online.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-bold">Bu davr uchun online to'lovlar yo'q</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {/* Table header */}
              <div className="grid grid-cols-4 px-6 py-3 bg-slate-50 text-xs font-black text-slate-400 uppercase tracking-widest">
                <span>Do'kon</span>
                <span>Usul</span>
                <span className="text-right">Summa</span>
                <span className="text-right">Sana</span>
              </div>
              {online.map((payment: any, i: number) => {
                const st = STATUS_LABEL[payment.paymentStatus] || STATUS_LABEL.UNPAID;
                const method = METHOD_LABEL[payment.method] || payment.method;
                return (
                  <div key={payment.orderId || i} className="grid grid-cols-4 px-6 py-4 hover:bg-slate-50 transition-colors items-center">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{payment.storeName}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${st.cls} inline-block mt-1`}>{st.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-indigo-100 text-indigo-700">
                        {method}
                      </span>
                    </div>
                    <p className="text-right font-black text-slate-900 text-sm">
                      {(payment.amount || 0).toLocaleString('uz-UZ')} UZS
                    </p>
                    <p className="text-right text-xs text-slate-400 font-semibold">
                      {payment.date ? format(new Date(payment.date), 'd MMM, HH:mm', { locale: uz }) : '—'}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer total */}
          {online.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Jami online
              </div>
              <p className="font-black text-slate-900 text-base">
                {(summary.onlineTotal || 0).toLocaleString('uz-UZ')} UZS
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
