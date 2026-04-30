import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppLayout from './components/layout/AppLayout';
import { useAuthStore } from './store/authStore';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Distributor Pages
import { DistributorDashboard } from './pages/distributor/DistributorDashboard';
import OrdersPage from './pages/distributor/OrdersPage';
import OrderDetailPage from './pages/distributor/OrderDetailPage';
import { ProductsPage } from './pages/distributor/ProductsPage';
import AddProductPage from './pages/distributor/AddProductPage';
import DriversPage from './pages/distributor/DriversPage';
import InventoryPage from './pages/distributor/InventoryPage';
import AnalyticsPage from './pages/distributor/AnalyticsPage';
import SettingsPage from './pages/distributor/SettingsPage';
import DistributorChatPage from './pages/distributor/ChatPage';
import PricingPage from './pages/distributor/PricingPage';

// Store Pages
import StoreDashboard from './pages/store/StoreDashboard';
import StoreOrdersPage from './pages/store/StoreOrdersPage';
import StoreOrderDetailPage from './pages/store/StoreOrderDetailPage';
import CatalogPage from './pages/store/CatalogPage';
import CartPage from './pages/store/CartPage';
import DistributorsPage from './pages/store/DistributorsPage';
import FinancePage from './pages/store/FinancePage';
import StoreChatPage from './pages/store/ChatPage';
import CategoriesPage from './pages/distributor/CategoriesPage';
import ConnectionRequestsPage from './pages/distributor/ConnectionRequestsPage';

// Admin Pages
import AdminLayout from './components/layout/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminDistributorsPage from './pages/admin/AdminDistributorsPage';
import AdminProducts from './pages/admin/AdminProducts';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
const ProtectedRoute = ({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: string[];
}) => {
  const { isAuthenticated, user } = useAuthStore();

  // Token va user yo'q → login sahifasiga
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role tekshiruvi
  if (roles && user?.role && !roles.includes(user.role)) {
    // Role mos kelmasa — o'z dashboardiga yo'naltirish
    if (user.role === 'DISTRIBUTOR') return <Navigate to="/distributor/dashboard" replace />;
    if (user.role === 'CLIENT')      return <Navigate to="/store/dashboard" replace />;
    if (user.role === 'ADMIN')       return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// ─── HomeRedirect — rolga qarab yo'naltirish ──────────────────────────────────
const HomeRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.role === 'DISTRIBUTOR') return <Navigate to="/distributor/dashboard" replace />;
  if (user?.role === 'CLIENT')      return <Navigate to="/store/dashboard" replace />;
  if (user?.role === 'ADMIN')       return <Navigate to="/admin/dashboard" replace />;

  return <Navigate to="/login" replace />;
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <Toaster position="top-right" />

      <Routes>

        {/* PUBLIC — token kerak emas */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* APP LAYOUT WRAPPER */}
        <Route element={<AppLayout />}>

          {/* HOME */}
          <Route path="/" element={<HomeRedirect />} />

          {/* ── DISTRIBUTOR ── */}
          <Route path="/distributor/dashboard" element={<ProtectedRoute roles={['DISTRIBUTOR', 'ADMIN']}><DistributorDashboard /></ProtectedRoute>} />
          <Route path="/distributor/orders"    element={<ProtectedRoute roles={['DISTRIBUTOR', 'ADMIN']}><OrdersPage /></ProtectedRoute>} />
          <Route path="/distributor/orders/:id" element={<ProtectedRoute roles={['DISTRIBUTOR', 'ADMIN']}><OrderDetailPage /></ProtectedRoute>} />
          <Route path="/distributor/products"  element={<ProtectedRoute roles={['DISTRIBUTOR', 'ADMIN']}><ProductsPage /></ProtectedRoute>} />
          <Route path="/distributor/products/add" element={<ProtectedRoute roles={['DISTRIBUTOR', 'ADMIN']}><AddProductPage /></ProtectedRoute>} />
          <Route path="/distributor/drivers"   element={<ProtectedRoute roles={['DISTRIBUTOR', 'ADMIN']}><DriversPage /></ProtectedRoute>} />
          <Route path="/distributor/inventory" element={<ProtectedRoute roles={['DISTRIBUTOR', 'ADMIN']}><InventoryPage /></ProtectedRoute>} />
          <Route path="/distributor/analytics" element={<ProtectedRoute roles={['DISTRIBUTOR', 'ADMIN']}><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/distributor/pricing"   element={<ProtectedRoute roles={['DISTRIBUTOR', 'ADMIN']}><PricingPage /></ProtectedRoute>} />
          <Route path="/distributor/chat"      element={<ProtectedRoute roles={['DISTRIBUTOR', 'ADMIN']}><DistributorChatPage /></ProtectedRoute>} />
          <Route path="/distributor/settings"  element={<ProtectedRoute roles={['DISTRIBUTOR', 'ADMIN']}><SettingsPage /></ProtectedRoute>} />
          <Route path="/distributor/categories"   element={<ProtectedRoute roles={['DISTRIBUTOR', 'ADMIN']}><CategoriesPage /></ProtectedRoute>} />
          <Route path="/distributor/connections"  element={<ProtectedRoute roles={['DISTRIBUTOR', 'ADMIN']}><ConnectionRequestsPage /></ProtectedRoute>} />

        </Route>

        {/* ── ADMIN (o'z layouti bilan) ── */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard"    element={<AdminDashboard />} />
          <Route path="/admin/distributors" element={<AdminDistributorsPage />} />
          <Route path="/admin/users"        element={<AdminUsers />} />
          <Route path="/admin/orders"       element={<AdminOrders />} />
          <Route path="/admin/products"     element={<AdminProducts />} />
          <Route path="/admin/analytics"    element={<AdminAnalyticsPage />} />
        </Route>

        {/* APP LAYOUT WRAPPER — store/client */}
        <Route element={<AppLayout />}>

          {/* ── STORE / CLIENT ── */}
          <Route path="/store/dashboard"    element={<ProtectedRoute roles={['CLIENT', 'STORE', 'ADMIN']}><StoreDashboard /></ProtectedRoute>} />
          <Route path="/store/orders"       element={<ProtectedRoute roles={['CLIENT', 'STORE', 'ADMIN']}><StoreOrdersPage /></ProtectedRoute>} />
          <Route path="/store/orders/:id"   element={<ProtectedRoute roles={['CLIENT', 'STORE', 'ADMIN']}><StoreOrderDetailPage /></ProtectedRoute>} />
          <Route path="/store/catalog"      element={<ProtectedRoute roles={['CLIENT', 'STORE', 'ADMIN']}><CatalogPage /></ProtectedRoute>} />
          <Route path="/store/cart"         element={<ProtectedRoute roles={['CLIENT', 'STORE', 'ADMIN']}><CartPage /></ProtectedRoute>} />
          <Route path="/store/distributors" element={<ProtectedRoute roles={['CLIENT', 'STORE', 'ADMIN']}><DistributorsPage /></ProtectedRoute>} />
          <Route path="/store/finance"      element={<ProtectedRoute roles={['CLIENT', 'STORE', 'ADMIN']}><FinancePage /></ProtectedRoute>} />
          <Route path="/store/chat"         element={<ProtectedRoute roles={['CLIENT', 'STORE', 'ADMIN']}><StoreChatPage /></ProtectedRoute>} />

        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;