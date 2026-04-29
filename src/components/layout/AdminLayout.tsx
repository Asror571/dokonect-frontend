import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import { useAuthStore } from '../../store/authStore';

const AdminLayout: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Auth check
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN')         return <Navigate to="/"      replace />;

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 lg:hidden"
          >
            <AdminSidebar />
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:ml-64">

        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b px-4 py-3 flex justify-between items-center sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-1">
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <span className="font-bold text-slate-900">Admin Panel</span>
          <button
            onClick={() => { logout(); window.location.href = '/login'; }}
            className="p-1 text-slate-400 hover:text-red-500"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;