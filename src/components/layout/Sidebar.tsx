import { NavLink, useNavigate } from 'react-router-dom';
import {
  LogOut, LayoutDashboard, Package, ClipboardList,
  BarChart3, MessageSquare, Truck,
  Zap, Warehouse, Tag, Settings,
  FolderOpen, DollarSign, Users, UserCheck,
  ChevronLeft, ChevronRight, ShoppingCart,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const distributorMenu = [
  { to: '/distributor/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/distributor/orders',      icon: ClipboardList,   label: 'Buyurtmalar' },
  { to: '/distributor/products',    icon: Package,         label: 'Mahsulotlar' },
  { to: '/distributor/inventory',   icon: Warehouse,       label: 'Inventar' },
  { to: '/distributor/drivers',     icon: Truck,           label: 'Haydovchilar' },
  { to: '/distributor/analytics',   icon: BarChart3,       label: 'Analytics' },
  { to: '/distributor/pricing',     icon: Tag,             label: 'Narxlash' },
  { to: '/distributor/chat',        icon: MessageSquare,   label: 'Chat' },
  { to: '/distributor/settings',    icon: Settings,        label: 'Sozlamalar' },
  { to: '/distributor/categories',  icon: FolderOpen,      label: 'Kategoriyalar' },
  { to: '/distributor/connections', icon: UserCheck,       label: "Ulanish So'rovlari" },
];

const clientMenu = [
  { to: '/store/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/store/orders',       icon: ClipboardList,   label: 'Buyurtmalar' },
  { to: '/store/catalog',      icon: Package,         label: 'Katalog' },
  { to: '/store/cart',         icon: ShoppingCart,    label: 'Savat' },
  { to: '/store/distributors', icon: Users,           label: 'Distribyutorlar' },
  { to: '/store/finance',      icon: DollarSign,      label: 'Moliya' },
  { to: '/store/chat',         icon: MessageSquare,   label: 'Chat' },
];

interface SidebarProps {
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar = ({ onClose, collapsed = false, onToggleCollapse }: SidebarProps) => {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const menuItems = (user?.role === 'CLIENT' || user?.role === 'STORE')
    ? clientMenu
    : distributorMenu;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside
      className="bg-slate-900 flex flex-col h-full fixed left-0 top-0 z-50 shadow-2xl transition-all duration-300 overflow-hidden"
      style={{ width: collapsed ? 64 : 256 }}
    >
      {/* Brand */}
      <div className={`border-b border-white/5 flex items-center gap-3 ${collapsed ? 'px-3 py-5 justify-center' : 'px-6 py-6 justify-between'}`}>
        <div
          className="flex items-center gap-3 group cursor-pointer min-w-0"
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 shrink-0 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 overflow-hidden">
              <span className="text-white font-black text-xl tracking-tighter leading-none whitespace-nowrap">
                Doko<span className="text-indigo-400 font-bold">nect</span>
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 whitespace-nowrap">
                {(user?.role === 'CLIENT' || user?.role === 'STORE') ? "Do'kon egasi" : 'Platforma v3.0'}
              </span>
            </div>
          )}
        </div>

        {onToggleCollapse && !collapsed && (
          <button
            onClick={onToggleCollapse}
            className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {onToggleCollapse && collapsed && (
        <button
          onClick={onToggleCollapse}
          className="mx-auto mt-3 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Navigation */}
      <nav className={`flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden ${collapsed ? 'px-2' : 'px-4'}`}>
        {!collapsed && (
          <p className="px-3 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-50">Asosiy menyu</p>
        )}
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center rounded-xl text-sm font-bold transition-all duration-200 group ${
                collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-3'
              } ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 active:scale-95'
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="tracking-tight whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className={`border-t border-white/5 bg-slate-950/30 ${collapsed ? 'p-2' : 'p-4'}`}>
        <button
          onClick={handleLogout}
          title={collapsed ? 'Chiqish' : undefined}
          className={`w-full flex items-center rounded-xl text-sm font-bold text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all active:scale-95 group ${
            collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-3'
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
          {!collapsed && <span className="tracking-widest uppercase text-[11px]">Chiqish</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
