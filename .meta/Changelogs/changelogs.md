# Changelog

All notable changes to the BatchTrack Pro ecosystem are documented in this file.

## [Unreleased] - 2026-09-28

### Added
- **Full Avero Enterprise & Scan-First POS Redesign & Rebuild**:
  - Rebuilt Avero logic from scratch around the core principle: *"Avero records and orchestrates retail operations; it does not need to be the payment processor."*
  - **3-Level Inventory Hierarchy**: Segregated Products & SKUs $\rightarrow$ Batches (with expiry windows, cost basis, MRP) $\rightarrow$ Serialized WADNs & unit instances with an append-only stock movement ledger (`InventoryPage.jsx`).
  - **Scan-First Aztec POS Terminal (`PosPage.jsx`)**: Built ultra-fast countertop POS optimized for physical barcode scanners (sub-45ms autofocus), multi-tender split payments (Cash, UPI, Card, Change Credit), change credit digital wallet ledger toggle, manager PIN overrides (`1234` / `9999`), and printable thermal receipts.
  - **Dual Access & Authentication Model**:
    - **Avero Enterprise Portal (`/avero/*`)**: Gatekept by merchant account authentication context.
    - **Avero POS Portal (`/avero/pos` & `/pos`)**: Operates independently with 4-digit station PIN authorization without requiring enterprise login.
  - **Immutable Sales Ledger (`SalesPage.jsx`)**: Full transaction audit history, itemized receipt breakdown modals, split payment audit logs, and direct return intake triggers.
  - **Customer Returns & Service Queue Desk (`ServiceQueuePage.jsx`)**: Customer intake workflow with 6-way disposition routing (`RESTOCK` to batch, `SALVAGE` to vendor claim, `DAMAGED` write-off, `QUARANTINE` QA, `REPAIR`, `DISPOSAL`), with manager authorization.
  - **Store Change Credit Digital Wallet Ledger (`ChangeCreditsPage.jsx`)**: Phone-linked customer wallet float engine with full transaction history ledger (`POS_CHANGE_CREDIT`, `POS_CHECKOUT_REDEEM`, `RETURN_REFUND_CREDIT`) eliminating coin shortage friction.
  - **Terminal Management & Surveillance (`TerminalsPage.jsx`)**: Counter station provisioning, PIN configuration, live heartbeat surveillance, and cashier assignment.
  - **Cryptographic Audit Stream (`AuditPage.jsx`)**: Tamper-evident immutable event stream with SHA-256 signatures, action filters, and JSON metadata payload inspection.
  - **Operational Gateway (`AveroPortalPage.jsx`)**: Quick portal switcher between Enterprise OS, Aztec POS Counter, and Trackly consumer pantry.
  - **API Client & Backend Subsystem**:
    - `client/src/services/avero/averoApi.js`: Complete typed API client library for all Avero operations.
    - `server/src/services/avero/averoStore.js`: Centralized business engine maintaining 3-level inventory, split checkout, change credit ledger, return triage, and audit streams.
    - `server/src/routes/avero/averoRouter.js` & `server/src/controllers/avero/averoController.js`: RESTful endpoints mounted under `/api/avero`.
- **Segregated Source Trees**:
  - `client/src/pages/trackly/`: Dedicated consumer pantry suite (`TracklyDashboardPage`, `PantryScanPage`, `ExpiryIntelligencePage`, `RecipesPage`, `ProductDetailPage`, `ShoppingListPage`, `TracklyAuthPage`, `TracklyPortalPage`).
  - `client/src/pages/avero/`: Dedicated merchant enterprise suite (`AveroDashboardPage`, `InventoryPage`, `SalvagePage`, `PosPage`, `SalesPage`, `ServiceQueuePage`, `ChangeCreditsPage`, `TerminalsPage`, `AuditPage`, `AveroAuthPage`, `AveroPortalPage`).
  - `client/src/pages/platform/`: Platform shared pages (`LandingPage`, `IdentityPage`, `MarketplacePage`, `AnalyticsPage`, `DemoPage`, `NotFoundPage`).

### Changed
- Updated `client/src/layouts/AveroLayout.jsx` with full sub-navigation tabs across all Avero enterprise modules.
- Updated `client/src/App.jsx` and `client/src/pages/index.js` with comprehensive routing and export mappings.

### Fixed
- Resolved all syntax/export issues across `client/src/pages/avero/` modules (`PosPage.jsx`, `SalesPage.jsx`, `ServiceQueuePage.jsx`, `ChangeCreditsPage.jsx`, `TerminalsPage.jsx`, `AuditPage.jsx`, `AveroPortalPage.jsx`).
- Verified zero-error client production compilation (`npm run build`).

## [0.1.0] - 2026-09-27

### Added
- **Enlarged Official Brand Assets**:
  - Implemented `BrandLogo.jsx` with enhanced scaling options (`xs`, `sm`, `md`, `lg`, `xl`, `hero`) supporting dynamic heights up to 92px.
  - Placed logos strictly on clean neutral white (`#ffffff`) or warm parchment (`#fffefb`) containers with soft borders and drop shadows.
- **Dedicated Dual Visual Identity System**:
  - **TRACKLY**: Vivid blue palette (`#0284c7`, `#0ea5e9`, `#38bdf8`), playful micro-entity badges, pill sub-navigation, AI pantry vision scanner.
  - **AVERO**: Executive warm parchment (`#f6f3eb`, `#fffefb`) and forest green system (`#173d35`, `#2f8059`), rounded corners, merchant badges, live batch tracking table, vendor salvage claims, and Aztec POS terminal.
- **Supabase Integration & Auth State**:
  - `AuthContext.jsx` and `context/index.js` exporting `AuthProvider`, `useAuth`, `DEMO_CONSUMER`, `DEMO_RETAILER` with real-time session synchronization.

### Removed
- **Sidebar (`<aside>`)**: Completely removed persistent sidebar across layouts to prevent layout crowding.
