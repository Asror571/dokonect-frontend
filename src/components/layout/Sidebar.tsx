import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LogOut, LayoutDashboard, Package, ClipboardList, 
  BarChart3, MessageSquare, Truck,
  Zap, Warehouse, Tag, Settings,
  FolderOpen
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const menuItems = [
  { to: '/distributor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/distributor/orders',    icon: ClipboardList,   label: 'Buyurtmalar' },
  { to: '/distributor/products',  icon: Package,         label: 'Mahsulotlar' },
  { to: '/distributor/inventory', icon: Warehouse,       label: 'Inventar' },
  { to: '/distributor/drivers',   icon: Truck,           label: 'Haydovchilar' },
  { to: '/distributor/analytics', icon: BarChart3,       label: 'Analytics' },
  { to: '/distributor/pricing',   icon: Tag,             label: 'Narxlash' },
  { to: '/distributor/chat',      icon: MessageSquare,   label: 'Chat' },
  { to: '/distributor/settings',  icon: Settings,        label: 'Sozlamalar' },
  { to: '/distributor/categories', icon: FolderOpen, label: 'Kategoriyalar' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();                  // zustand state + localStorage.clear()
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-64 bg-slate-900 flex flex-col h-full fixed left-0 top-0 z-50 shadow-2xl">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black text-xl tracking-tighter leading-none">
              Doko<span className="text-indigo-400 font-bold">nect</span>
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Platforma v3.0</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
        <p className="px-3 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-50">Asosiy menyu</p>
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 -translate-y-0.5'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 active:scale-95'
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="tracking-tight">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/5 bg-slate-950/30">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all active:scale-95 group"
        >
          <LogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
          <span className="tracking-widest uppercase text-[11px]">Chiqish</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;