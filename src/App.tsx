import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';
import { useAuthStore } from './store/authStore';

// Auth
import { LoginPage }  from './pages/auth/LoginPage';
import RegisterPage   from './pages/auth/RegisterPage';

// Admin
import GlobalDashboard   from './pages/admin/GlobalDashboard';
import { OrdersPage as AdminOrdersPage } from './pages/admin/OrdersPage';
import { UsersPage }     from './pages/admin/UsersPage';

// Distributor
import { DistributorDashboard } from './pages/distributor/DistributorDashboard';
import OrdersPage               from './pages/distributor/OrdersPage';
import OrderDetailPage          from './pages/distributor/OrderDetailPage';
import { ProductsPage }         from './pages/distributor/ProductsPage';
import AddProductPage           from './pages/distributor/AddProductPage';
import DriversPage              from './pages/distributor/DriversPage';
import InventoryPage            from './pages/distributor/InventoryPage';
import AnalyticsPage            from './pages/distributor/AnalyticsPage';
import SettingsPage             from './pages/distributor/SettingsPage';
import DistributorChatPage      from './pages/distributor/ChatPage';
import PricingPage              from './pages/distributor/PricingPage';

// Store
import StoreDashboard   from './pages/store/StoreDashboard';
import StoreOrdersPage  from './pages/store/StoreOrdersPage';
import CatalogPage      from './pages/store/CatalogPage';
import DistributorsPage from './pages/store/DistributorsPage';
import FinancePage      from './pages/store/FinancePage';
import StoreChatPage    from './pages/store/ChatPage';
import CartPage         from './pages/store/CartPage';

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
const ProtectedRoute = ({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: string[];
}) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roles && user?.role && !roles.includes(user.role)) {
    // Role mos kelmasa — o'z dashboardiga
    if (user.role === 'ADMIN')        return <Navigate to="/admin/dashboard"       replace />;
    if (user.role === 'DISTRIBUTOR')  return <Navigate to="/distributor/dashboard" replace />;
    if (user.role === 'CLIENT' || user.role === 'STORE') return <Navigate to="/store/dashboard" replace />;
    if (user.role === 'DRIVER')       return <Navigate to="/driver/dashboard"      replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// ─── HomeRedirect ─────────────────────────────────────────────────────────────
const HomeRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.role === 'ADMIN')                           return <Navigate to="/admin/dashboard"       replace />;
  if (user?.role === 'DISTRIBUTOR')                     return <Navigate to="/distributor/dashboard" replace />;
  if (user?.role === 'CLIENT' || user?.role === 'STORE') return <Navigate to="/store/dashboard"      replace />;
  if (user?.role === 'DRIVER')                          return <Navigate to="/driver/dashboard"      replace />;

  return <Navigate to="/login" replace />;
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>

        {/* ── PUBLIC ── */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── ADMIN (o'z layout bilan) ── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index                element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"     element={<GlobalDashboard />} />
          <Route path="orders"        element={<AdminOrdersPage />} />
          <Route path="users"         element={<UsersPage />} />
        </Route>

        {/* ── APP LAYOUT ── */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomeRedirect />} />

          {/* DISTRIBUTOR */}
          <Route path="/distributor/dashboard"    element={<ProtectedRoute roles={['DISTRIBUTOR','ADMIN']}><DistributorDashboard /></ProtectedRoute>} />
          <Route path="/distributor/orders"       element={<ProtectedRoute roles={['DISTRIBUTOR','ADMIN']}><OrdersPage /></ProtectedRoute>} />
          <Route path="/distributor/orders/:id"   element={<ProtectedRoute roles={['DISTRIBUTOR','ADMIN']}><OrderDetailPage /></ProtectedRoute>} />
          <Route path="/distributor/products"     element={<ProtectedRoute roles={['DISTRIBUTOR','ADMIN']}><ProductsPage /></ProtectedRoute>} />
          <Route path="/distributor/products/add" element={<ProtectedRoute roles={['DISTRIBUTOR','ADMIN']}><AddProductPage /></ProtectedRoute>} />
          <Route path="/distributor/drivers"      element={<ProtectedRoute roles={['DISTRIBUTOR','ADMIN']}><DriversPage /></ProtectedRoute>} />
          <Route path="/distributor/inventory"    element={<ProtectedRoute roles={['DISTRIBUTOR','ADMIN']}><InventoryPage /></ProtectedRoute>} />
          <Route path="/distributor/analytics"    element={<ProtectedRoute roles={['DISTRIBUTOR','ADMIN']}><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/distributor/pricing"      element={<ProtectedRoute roles={['DISTRIBUTOR','ADMIN']}><PricingPage /></ProtectedRoute>} />
          <Route path="/distributor/chat"         element={<ProtectedRoute roles={['DISTRIBUTOR','ADMIN']}><DistributorChatPage /></ProtectedRoute>} />
          <Route path="/distributor/settings"     element={<ProtectedRoute roles={['DISTRIBUTOR','ADMIN']}><SettingsPage /></ProtectedRoute>} />

          {/* STORE / CLIENT */}
          <Route path="/store/dashboard"    element={<ProtectedRoute roles={['CLIENT','STORE','ADMIN']}><StoreDashboard /></ProtectedRoute>} />
          <Route path="/store/orders"       element={<ProtectedRoute roles={['CLIENT','STORE','ADMIN']}><StoreOrdersPage /></ProtectedRoute>} />
          <Route path="/store/catalog"      element={<ProtectedRoute roles={['CLIENT','STORE','ADMIN']}><CatalogPage /></ProtectedRoute>} />
          <Route path="/store/distributors" element={<ProtectedRoute roles={['CLIENT','STORE','ADMIN']}><DistributorsPage /></ProtectedRoute>} />
          <Route path="/store/finance"      element={<ProtectedRoute roles={['CLIENT','STORE','ADMIN']}><FinancePage /></ProtectedRoute>} />
          <Route path="/store/chat"         element={<ProtectedRoute roles={['CLIENT','STORE','ADMIN']}><StoreChatPage /></ProtectedRoute>} />
          <Route path="/store/cart"         element={<ProtectedRoute roles={['CLIENT','STORE','ADMIN']}><CartPage /></ProtectedRoute>} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;