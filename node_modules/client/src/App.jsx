import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/index.js';
import { LandingLayout, TracklyLayout, AveroLayout, PlatformLayout } from './layouts/index.js';
import { ToastHost } from './components/ui/index.js';
import {
  LandingPage,
  TracklyDashboardPage,
  PantryScanPage,
  ExpiryIntelligencePage,
  RecipesPage,
  ProductDetailPage,
  TracklyAuthPage,
  AveroDashboardPage,
  InventoryPage,
  SalvagePage,
  PosPage,
  ServiceQueuePage,
  AveroAuthPage,
  IdentityPage,
  MarketplacePage,
  AnalyticsPage,
  DemoPage,
  NotFoundPage,
} from './pages/index.js';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Landing Page Route */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* Dedicated Trackly Consumer App */}
        <Route path="/trackly" element={<TracklyLayout />}>
          <Route index element={<Navigate to="/trackly/dashboard" replace />} />
          <Route path="dashboard" element={<TracklyDashboardPage />} />
          <Route path="pantry" element={<PantryScanPage />} />
          <Route path="expiry" element={<ExpiryIntelligencePage />} />
          <Route path="recipes" element={<RecipesPage />} />
          <Route path="product/:wadn" element={<ProductDetailPage />} />
          <Route path="auth" element={<TracklyAuthPage />} />
        </Route>

        {/* Dedicated Avero Retailer OS */}
        <Route path="/avero" element={<AveroLayout />}>
          <Route index element={<Navigate to="/avero/dashboard" replace />} />
          <Route path="dashboard" element={<AveroDashboardPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="salvage" element={<SalvagePage />} />
          <Route path="pos" element={<PosPage />} />
          <Route path="service-queue" element={<ServiceQueuePage />} />
          <Route path="auth" element={<AveroAuthPage />} />
        </Route>

        {/* Shared Platform Infrastructure */}
        <Route element={<PlatformLayout />}>
          <Route path="/identity" element={<IdentityPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/demo" element={<DemoPage />} />
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastHost />
    </AuthProvider>
  );
}
