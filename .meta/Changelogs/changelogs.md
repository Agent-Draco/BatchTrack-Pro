# Changelog

All notable changes to the BatchTrack Pro ecosystem are documented in this file.

## [Unreleased] - 2026-10-06

### Added
- **Database Schema Templates (`/database/`)**:
  - Generated all 21 RFC-4180 CSV schema files representing the complete database architecture (`organizations`, `profiles`, `customers`, `products`, `batches`, `wadns`, `wadn_history`, `inventory_movements`, `sales`, `sale_items`, `payments`, `change_credits`, `returns`, `return_items`, `refunds`, `terminals`, `pos_sessions`, `audit_logs`, `invoice_sequences`, `payment_providers`, `salvage_tickets`).
  - Added comprehensive `README.md` with entity relationship documentation and sample data definitions.
- **Resilient Data Service Engine (`server/src/services/db.js`)**:
  - Implemented automatic in-memory data store seeded directly from `/database/*.csv` files, providing high availability and zero-downtime fallback when PostgreSQL tables or network connections are initializing.
- **Dedicated Standalone Aztec POS Portal**:
  - Standalone POS layout and flow at `/pos` (`PosTerminalPage.jsx`, `PosLoginPage.jsx`, `PosReturnPage.jsx`) isolated from enterprise navigation.
  - Dedicated POS API client (`client/src/services/pos/posApi.js`) and token authorization middleware (`server/src/middleware/authPos.js`).

### Fixed
- **Fixed "Launch Avero Retailer OS" Not Working**:
  - Restored `switchRole`, `isRetailer`, `isConsumer`, `loginAsDemo`, `DEMO_RETAILER`, and `DEMO_CONSUMER` in `AuthContext.jsx` and exported them in `context/index.js`, eliminating `TypeError: switchRole is not a function`.
  - Updated `EnterpriseAuthGuard.jsx` to recognize active retailer sessions and allow seamless entry into the Avero Retailer OS.
  - Enhanced `AveroAuthPage.jsx` with an instant "Sign in as Aztec Supermarket Manager" one-click entrance alongside standard Supabase authentication.
- **UI Component & Table Compatibility**:
  - Enhanced `DataTable.jsx` to transparently accept both `data` and `rows` arrays, as well as `accessor`/`header` and `key`/`label` column definitions.
  - Normalized `useToast` calls across all Avero and POS pages to use `toast.push(msg, type)` instead of deprecated `addToast`.
- **API & Data Mapping Alignment**:
  - Enriched `dashboardController.js` to return live aggregated KPIs, formatted currency strings, attention alerts, and audit logs.
  - Mapped fields across `productsController.js` (stock, price), `inventoryController.js` (item array), `salesController.js` (total_amount), `returnsController.js` (refund_amount), `customersController.js` (credit_balance), and `terminalsController.js` (name, location, cashier).
- **Environment & Server Configuration**:
  - Synchronized credentials in `server/.env` with root `.env`.
  - Added `--use-system-ca` compatibility for secure Supabase TLS connections on Windows.

### Changed
- Refined `AveroLayout.jsx`:
  - Completely removed all Trackly buttons and references from the Avero management interface.
  - Added official Avero brand logo, Aztec Supermarket store badge, and live terminal indicator.
  - Added Profile navigation linking to `/avero/profile` which includes a dedicated "Return to BatchTrack Home" action.

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
