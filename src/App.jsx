import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { CartProvider } from './context/CartContext';

import DesktopLayout from './components/layout/DesktopLayout';
import MenuHome from './pages/MenuHome';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrders from './pages/MyOrders';
import KitchenPanel from './pages/KitchenPanel';
import DeliveryPanel from './pages/DeliveryPanel';
import AdminPanel from './pages/AdminPanel';
import ManageProducts from './pages/admin/ManageProducts';
import ManageCategories from './pages/admin/ManageCategories';
import AdminOrders from './pages/admin/AdminOrders';
import RestaurantSettings from './pages/admin/RestaurantSettings';
import KitchenTicketPrint from './pages/KitchenTicketPrint';
import DeliveryTicketPrint from './pages/DeliveryTicketPrint';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <CartProvider>
      <Routes>
        {/* Customer-facing pages — use DesktopLayout (sidebar on desktop, bottom nav on mobile) */}
        <Route element={<DesktopLayout />}>
          <Route path="/" element={<MenuHome />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/orders" element={<MyOrders />} />
        </Route>

        {/* Staff / admin pages — no layout wrapper */}
        <Route path="/kitchen" element={<KitchenPanel />} />
        <Route path="/delivery" element={<DeliveryPanel />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/products" element={<ManageProducts />} />
        <Route path="/admin/categories" element={<ManageCategories />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/settings" element={<RestaurantSettings />} />
        <Route path="/ticket/kitchen/:id" element={<KitchenTicketPrint />} />
        <Route path="/ticket/delivery/:id" element={<DeliveryTicketPrint />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </CartProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App