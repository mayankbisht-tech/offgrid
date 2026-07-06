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
} from './components/ReferenceApp';

// Admin dashboard has been removed from this app.
// All admin functionality now lives in CRM-offgrid at /admin/offgrid/*

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
        {/* /admin is intentionally gone — managed in CRM-offgrid */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
