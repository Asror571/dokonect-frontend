import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Users, TrendingUp,
  LogOut, Zap, Truck, Store, Package, CreditCard,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const menu = [
  { to: '/admin/dashboard',    icon: LayoutDashboard, label: 'Dashboard'        },
  { to: '/admin/orders',       icon: ShoppingCart,    label: 'Buyurtmalar'      },
  { to: '/admin/users',        icon: Users,           label: 'Foydalanuvchilar' },
  { to: '/admin/distributors', icon: Truck,           label: 'Distribyutorlar'  },
  { to: '/admin/stores',       icon: Store,           label: "Do'konlar"        },
  { to: '/admin/products',     icon: Package,         label: 'Mahsulotlar'      },
  { to: '/admin/payments',     icon: CreditCard,      label: "To'lovlar"        },
  { to: '/admin/analytics',    icon: TrendingUp,      label: 'Analitika'        },
];

interface Props {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const AdminSidebar = ({ collapsed, onToggleCollapse }: Props) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  return (
    <aside
      className="bg-slate-950 flex flex-col h-full fixed left-0 top-0 z-50 border-r border-slate-800 transition-all duration-300 overflow-hidden"
      style={{ width: collapsed ? 64 : 240 }}
    >
      {/* Logo */}
      <div className={`border-b border-slate-800 flex items-center gap-2.5 ${collapsed ? 'px-3 py-5 justify-center' : 'px-5 py-5 justify-between'}`}>
        <div className="flex items-center gap-2.5 min-w-0 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="text-white font-bold text-base tracking-tight whitespace-nowrap">
                Doko<span className="text-violet-400">nect</span>
              </span>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest">Admin Panel</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button onClick={onToggleCollapse}
            className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button onClick={onToggleCollapse}
          className="mx-auto mt-3 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all">
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Nav */}
      <nav className={`flex-1 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden ${collapsed ? 'px-2' : 'px-3'}`}>
        {!collapsed && (
          <p className="px-3 mb-3 text-[9px] font-bold text-slate-600 uppercase tracking-widest">Menyu</p>
        )}
        {menu.map((item) => (
          <NavLink key={item.to} to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center rounded-lg text-sm font-medium transition-all ${
                collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className={`border-t border-slate-800 ${collapsed ? 'p-2' : 'px-3 py-4'} space-y-1`}>
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center font-bold text-sm shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-slate-500">Admin</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout}
          title={collapsed ? 'Chiqish' : undefined}
          className={`w-full flex items-center rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all ${
            collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
          }`}>
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && 'Chiqish'}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;