import { Navigate, useLocation } from 'react-router-dom';
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();

  // Read from localStorage
  const token = localStorage.getItem('accessToken');
  const userStr = localStorage.getItem('user');

  let user = null;

  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('User parse error:', error);
    user = null;
  }

  const isAuthenticated = !!token && !!user;

  console.log('🛡️ ProtectedRoute:', {
    isAuthenticated,
    user,
    allowedRoles,
    path: location.pathname,
  });

  // ❌ NOT AUTHENTICATED → LOGIN
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // ❌ ROLE CHECK
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // ✅ ALLOWED
  return <>{children}</>;
};