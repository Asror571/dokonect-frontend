import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Users, TrendingUp,
  LogOut, Zap, Truck, Store, Package, CreditCard,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const menu = [
  { to: '/admin/dashboard',     icon: LayoutDashboard, label: 'Dashboard'       },
  { to: '/admin/orders',        icon: ShoppingCart,    label: 'Buyurtmalar'     },
  { to: '/admin/users',         icon: Users,           label: 'Foydalanuvchilar'},
  { to: '/admin/distributors',  icon: Truck,           label: 'Distribyutorlar' },
  { to: '/admin/stores',        icon: Store,           label: "Do'konlar"       },
  { to: '/admin/products',      icon: Package,         label: 'Mahsulotlar'     },
  { to: '/admin/payments',      icon: CreditCard,      label: "To'lovlar"       },
  { to: '/admin/analytics',     icon: TrendingUp,      label: 'Analitika'       },
];

const AdminSidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  return (
    <aside className="w-64 bg-slate-950 flex flex-col h-full fixed left-0 top-0 z-50 border-r border-slate-800">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg tracking-tight">
              Doko<span className="text-violet-400">nect</span>
            </span>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {menu.map((item) => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-slate-800 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center font-bold text-sm">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Admin'}</p>
            <p className="text-[10px] text-slate-500">Admin</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut className="w-4 h-4 shrink-0" /> Chiqish
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;