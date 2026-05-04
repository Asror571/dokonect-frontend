import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuthStore } from '../../store/authStore';

const AdminLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN')      return <Navigate to="/"     replace />;

  return (
    <div className="flex min-h-screen bg-slate-950">
      <AdminSidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(p => !p)} />
      <main
        className="flex-1 min-w-0 overflow-y-auto transition-all duration-300"
        style={{ marginLeft: collapsed ? 64 : 240 }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;