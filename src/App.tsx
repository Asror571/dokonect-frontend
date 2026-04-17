import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppLayout from './components/layout/AppLayout';

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
import CatalogPage from './pages/store/CatalogPage';
import DistributorsPage from './pages/store/DistributorsPage';
import FinancePage from './pages/store/FinancePage';

// 🔐 Protected Route — vaqtinchalik o'chirilgan
const ProtectedRoute = ({ children }: { children: React.ReactNode; roles?: string[] }) => {
  return <>{children}</>;
};

// 🔥 HOME — to'g'ridan distributor dashboardga
const HomeRedirect = () => {
  return <Navigate to="/distributor/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />

      <Routes>

        {/* PUBLIC */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* APP LAYOUT WRAPPER */}
        <Route element={<AppLayout />}>

          {/* HOME */}
          <Route path="/" element={<HomeRedirect />} />

          {/* DISTRIBUTOR */}
          <Route path="/distributor/dashboard" element={<ProtectedRoute><DistributorDashboard /></ProtectedRoute>} />
          <Route path="/distributor/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/distributor/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
          <Route path="/distributor/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
          <Route path="/distributor/products/add" element={<ProtectedRoute><AddProductPage /></ProtectedRoute>} />
          <Route path="/distributor/drivers" element={<ProtectedRoute><DriversPage /></ProtectedRoute>} />
          <Route path="/distributor/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
          <Route path="/distributor/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/distributor/pricing" element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
          <Route path="/distributor/chat" element={<ProtectedRoute><DistributorChatPage /></ProtectedRoute>} />
          <Route path="/distributor/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          {/* STORE */}
          <Route path="/store/dashboard" element={<ProtectedRoute><StoreDashboard /></ProtectedRoute>} />
          <Route path="/store/orders" element={<ProtectedRoute><StoreOrdersPage /></ProtectedRoute>} />
          <Route path="/store/catalog" element={<ProtectedRoute><CatalogPage /></ProtectedRoute>} />
          <Route path="/store/distributors" element={<ProtectedRoute><DistributorsPage /></ProtectedRoute>} />
          <Route path="/store/finance" element={<ProtectedRoute><FinancePage /></ProtectedRoute>} />

        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;