import { Routes, Route, Navigate } from 'react-router-dom';
import RootLayout, {
  AppContext,
  HomePage,
  ShopPage,
  ProductPage,
  DashboardPage,
  LogoutPage,
  StudioPublishWizard,
  CreatorPage,
  CheckoutPage,
  PaymentPlaceholderPage,
  PaymentPage,
  AdminDashboard,
} from './components/ReferenceApp';

export default function App() {
  return (
    <Routes>
      <Route path="logout" element={<LogoutPage />} />
      {/* RootLayout is the shell: TopNav, Cart, Auth overlays, global CSS */}
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="product/:id" element={<ProductPage />} />
        <Route path="product" element={<ProductPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="studio/upload" element={<StudioPublishWizard />} />
        <Route path="studio/pricing" element={<Navigate to="/studio/upload" replace />} />
        <Route path="studio/review" element={<Navigate to="/studio/upload" replace />} />
        <Route path="creator/:id" element={<CreatorPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="payment" element={<PaymentPage />} />
        <Route path="admin" element={<AdminDashboard />} />
        {/* Catch-all → home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
