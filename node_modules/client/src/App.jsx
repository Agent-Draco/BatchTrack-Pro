import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, PosProvider } from './context/index.js';
import { LandingLayout, AveroLayout, PosLayout, PlatformLayout } from './layouts/index.js';
import { ToastHost } from './components/ui/index.js';
import EnterpriseAuthGuard from './guards/EnterpriseAuthGuard.jsx';
import PosAuthGuard from './guards/PosAuthGuard.jsx';
import { 
  LandingPage, IdentityPage, AnalyticsPage, DemoPage, NotFoundPage,
  AveroAuthPage, AveroDashboardPage, ProductsPage, InventoryPage, 
  SalesPage, ReturnsPage, CustomersPage, ChangeCreditsPage, 
  SalvagePage, TerminalsPage, AuditPage, SettingsPage, ProfilePage,
  PosLoginPage, PosTerminalPage, PosReturnPage
} from './pages/index.js';

export default function App() {
  return (
    <AuthProvider>
      <PosProvider>
        <Routes>
          {/* Landing */}
          <Route element={<LandingLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>

          {/* Enterprise Auth (no guard) */}
          <Route path="/avero/auth" element={<AveroAuthPage />} />

          {/* Enterprise Portal (guarded) */}
          <Route path="/avero" element={<EnterpriseAuthGuard><AveroLayout /></EnterpriseAuthGuard>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AveroDashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="returns" element={<ReturnsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="change-credits" element={<ChangeCreditsPage />} />
            <Route path="salvage" element={<SalvagePage />} />
            <Route path="terminals" element={<TerminalsPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* POS Login (no guard) */}
          <Route path="/pos/login" element={<PosLoginPage />} />

          {/* POS Terminal (guarded) */}
          <Route path="/pos" element={<PosAuthGuard><PosLayout /></PosAuthGuard>}>
            <Route index element={<PosTerminalPage />} />
            <Route path="return" element={<PosReturnPage />} />
          </Route>

          {/* Platform shared */}
          <Route element={<PlatformLayout />}>
            <Route path="/identity" element={<IdentityPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/demo" element={<DemoPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <ToastHost />
      </PosProvider>
    </AuthProvider>
  );
}
