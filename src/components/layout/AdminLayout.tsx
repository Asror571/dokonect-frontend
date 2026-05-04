import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuthStore } from '../../store/authStore';

const AdminLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN')      return <Navigate to="/"     replace />;

  return (
    <div className="flex min-h-screen bg-slate-950">
      <AdminSidebar />
      {/* ml matches sidebar width — sidebar handles its own collapse */}
      <main className="flex-1 min-w-0 overflow-y-auto" style={{ marginLeft: 64 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;