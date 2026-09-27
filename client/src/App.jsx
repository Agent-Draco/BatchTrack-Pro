import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppShell } from './layouts/index.js';
import { ToastHost } from './components/ui/index.js';
import {
  LandingPage,
  TracklyDashboardPage,
  PantryScanPage,
  ExpiryIntelligencePage,
  RecipesPage,
  ProductDetailPage,
  AveroDashboardPage,
  InventoryPage,
  SalvagePage,
  PosPage,
  ServiceQueuePage,
  IdentityPage,
  MarketplacePage,
  AnalyticsPage,
  DemoPage,
  NotFoundPage,
} from './pages/index.js';

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/trackly/dashboard" element={<TracklyDashboardPage />} />
          <Route path="/trackly/pantry" element={<PantryScanPage />} />
          <Route path="/trackly/expiry" element={<ExpiryIntelligencePage />} />
          <Route path="/trackly/recipes" element={<RecipesPage />} />
          <Route path="/trackly/product/:wadn" element={<ProductDetailPage />} />
          <Route path="/avero/dashboard" element={<AveroDashboardPage />} />
          <Route path="/avero/inventory" element={<InventoryPage />} />
          <Route path="/avero/salvage" element={<SalvagePage />} />
          <Route path="/avero/pos" element={<PosPage />} />
          <Route path="/avero/service-queue" element={<ServiceQueuePage />} />
          <Route path="/identity" element={<IdentityPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/demo" element={<DemoPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastHost />
    </>
  );
}
