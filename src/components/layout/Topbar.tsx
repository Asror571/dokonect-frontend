import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { Bell, Search, Globe, ChevronDown, User, LogOut, Settings, Shield, Menu } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { getNotificationsFn, markNotificationReadFn, markAllNotificationsReadFn } from '../../api/notifications.api';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin', DISTRIBUTOR: 'Distribyutor', CLIENT: "Do'kon egasi", STORE: "Do'kon egasi",
};

const Topbar = ({ onMenuClick }: { onMenuClick?: () => void } = {}) => {
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotificationsFn,
    staleTime: 30_000,
    retry: false,
  });

  const { mutate: markRead } = useMutation({
    mutationFn: markNotificationReadFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: markAllNotificationsReadFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications: any[] = notifData?.data || notifData || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-6 sm:px-8 flex items-center justify-between shadow-sm backdrop-blur-md bg-white/80">
      
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors mr-2"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Left: Global Search */}
      <div className="relative flex-1 max-w-md hidden md:block group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Global qidiruv..." 
          className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all border-none font-medium"
        />
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        
        {/* Language Switch */}
        <button className="hidden sm:flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all font-bold text-xs">
          <Globe className="w-4 h-4" />
          <span>UZ</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2.5 rounded-xl transition-all relative ${showNotifications ? 'bg-indigo-50 text-indigo-600 scale-110' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 bg-red-500 border-2 border-white rounded-full text-[9px] font-black text-white flex items-center justify-center px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-80 bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden z-50 p-2"
              >
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Bildirishnomalar</span>
                  <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-lg font-bold">YANGI</span>
                </div>
                <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
                  {notifications.length === 0 && (
                    <p className="px-4 py-8 text-center text-xs text-slate-400 font-medium">Bildirishnomalar yo'q</p>
                  )}
                  {notifications.map((n: any) => (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && markRead(n.id)}
                      className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 group ${!n.isRead ? 'bg-indigo-50/40' : ''}`}
                    >
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0 opacity-0 transition-opacity" style={{ opacity: n.isRead ? 0 : 1 }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{n.title || n.type}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{n.message || n.body}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">{n.createdAt ? new Date(n.createdAt).toLocaleString('uz-UZ') : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {unreadCount > 0 && (
                  <button onClick={() => markAllRead()} className="w-full py-3 text-xs font-black text-indigo-600 hover:bg-indigo-50 border-t border-slate-100 tracking-widest uppercase transition-colors">
                    Barchasini o'qildi deb belgilash
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Vertical Divider */}
        <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* User Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 pl-2 pr-1 py-1 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-200 transition-all group active:scale-95"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-indigo-600/20 group-hover:rotate-12 transition-transform">
              {user?.name?.slice(0, 1).toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-left mr-2">
              <p className="text-[11px] font-black text-slate-900 leading-none truncate max-w-[100px] uppercase tracking-tighter">{user?.name}</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{ROLE_LABELS[user?.role || ''] || user?.role}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180 text-indigo-500' : ''}`} />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-60 bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden z-50 p-2"
              >
                 <div className="p-3 border-b border-slate-50">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 pl-2">Hisobingiz</p>
                    <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm font-black uppercase">
                        {user?.name?.slice(0, 1).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-black text-slate-900 truncate uppercase tracking-tighter">{user?.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{user?.phone}</p>
                        </div>
                    </div>
                 </div>
                 <div className="p-1 space-y-0.5">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all group">
                        <User className="w-4 h-4 group-hover:scale-110 transition-transform" /> Mening Profilim
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all group">
                        <Settings className="w-4 h-4 group-hover:scale-110 transition-transform" /> Sozlamalar
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all group">
                        <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" /> Xavfsizlik
                    </button>
                 </div>
                 <div className="p-1 border-t border-slate-50 pt-1">
                    <button 
                        onClick={() => { logout(); setShowProfileMenu(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all group"
                    >
                        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Tizimdan chiqish
                    </button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
};

export default Topbar;
