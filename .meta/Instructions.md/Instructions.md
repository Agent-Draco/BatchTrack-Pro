# Project Development Guidelines & Instructions
This document outlines the strict core principles, architectural rules, and development standards for the **BatchTrack Pro** ecosystem (incorporating **Trackly** and **Avero**). All AI agents, contributors, and developers must strictly adhere to these instructions.
---
## 1. Strict Separation: Trackly vs. Avero
Trackly and Avero are two distinct products within the BatchTrack ecosystem. **They must remain strictly segregated across branding, visual identity, routes, data models, logic, and state.**
### Trackly (Consumer Pantry & Freshness Tracker)
- **Target Audience**: End consumers, households, and individuals managing pantry items, expiration dates, and recipes.
- **Route Prefix**: Strictly scoped to `/trackly/*` (e.g., `/trackly/dashboard`, `/trackly/pantry`, `/trackly/expiry`, `/trackly/recipes`, `/trackly/product/:wadn`, `/trackly/auth`).
- **Visual Identity**:
  - Theme: Vivid electric blue palette (`#0284c7`, `#0ea5e9`, `#38bdf8`), clean consumer UI.
  - Micro-entity badges: e.g., `🔥 2 Expiring`, `🧺 18 Tracked`, `💰 ₹1,240 Saved`.
  - Layout & Navigation: Uses `TracklyLayout.jsx` with consumer pill navigation and quick pantry vision scan triggers.
- **Features**: Consumer pantry tracking, WADN barcode scanning, recipe recommendations based on expiring items, waste reduction metrics.
### Avero (Merchant OS & Aztec POS Terminal)
- **Target Audience**: Supermarket managers, inventory clerks, grocery retail staff, and salvage vendors.
- **Route Prefix**: Strictly scoped to `/avero/*` (e.g., `/avero/dashboard`, `/avero/inventory`, `/avero/salvage`, `/avero/pos`, `/avero/service-queue`, `/avero/auth`).
- **Visual Identity**:
  - Theme: Executive warm parchment (`#f6f3eb`, `#fffefb`) with rich forest green accents (`#173d35`, `#2f8059`), refined enterprise UI.
  - Merchant badges: e.g., `🏪 Aztec Supermarket`, `🟢 Terminal Online`, `♻️ ₹18,400 Salvageable`.
  - Layout & Navigation: Uses `AveroLayout.jsx` with merchant action headers and quick workflow switchers.
- **Features**: Live inventory & batch tracking, salvage claim lifecycle, dynamic markdown pricing, Aztec POS scanner terminal, queue management.
### Rule of Separation
- ❌ **NEVER** mix Trackly consumer components, hooks, or styles into Avero, or logic vice versa.
- ❌ **NEVER** share state or crossover routes between the two without routing through the designated platform landing/switcher.
- ✅ Always use dedicated layouts (`TracklyLayout` vs. `AveroLayout`).
---
## 2. Total End-to-End User Flow & Account Integration
- **Account First**: Every capability, action, and data view must be tied to an authenticated account (Consumer account for Trackly, Retailer/Merchant account for Avero).
- **Continuous Flow**: All pages and components must be connected in a coherent, interactive journey:
  1. Entry & Auth (`/trackly/auth` or `/avero/auth`, or role-aware platform switchers).
  2. Account context persistence via `AuthContext`.
  3. Action execution (adding an item, scanning a batch, creating a salvage ticket, ringing up POS sale).
  4. Real-time feedback, state update, and persistent database record.
- **No Orphan Views**: Every page and feature must be reachable and operable through explicit navigation bars, buttons, and user interaction triggers.
---
## 3. Real Data Only — Strictly NO Mock Data

- ❌ **NO MOCK DATA**: Zero static arrays, hardcoded mock items, fake simulated databases, or placeholder dummy records in production/runtime logic.
- ✅ **Supabase Single Source of Truth**: All data (pantries, products, batches, inventory, salvage tickets, transactions, auth profiles) must be fetched directly from and written to **Supabase**.
- **Resilient Data Handling**:
  - Implement proper loading spinners/skeletons during Supabase queries.
  - Implement meaningful empty state components when tables or query results contain no rows.
  - Handle Supabase errors cleanly with user-facing alerts/notifications without breaking the UI.
---
## 4. UI Accessibility, Interactive Buttons & Verification
- **Button-Driven Accessibility**:
  - Every feature, modal, drawer, filter, and action must be accessible via visible, clickable, and touch-friendly interactive buttons and links.
  - Provide clear hover, focus, and active states.
- **Visual Verification Requirement**:
  - After making code changes, always verify that the changes render correctly and work seamlessly.
  - Test user interactions via browser tools or visual checks to confirm layouts, routes, and responsive designs are intact.
  - Ensure there is no layout overflow, unaligned elements, or console exceptions.
---
## 5. Dual Environment Compatibility: Vercel & Local (`npm run dev`)
The project must always build and run seamlessly across both environments:
### Local Development (`npm run dev`)
- Vite dev server running on localhost.
- Proxy configuration or local backend server routing to ensure seamless API and Supabase communication.
- `.env` support for local environment variable loading.
### Vercel Production Deployment
- SPA client routing configuration (e.g. `vercel.json` rewrites ensuring `/trackly/*`, `/avero/*`, and root routes resolve properly without 404s on page refresh).
- Serverless API functions compatibility if using backend serverless endpoints.
- Environment variables configured securely via Vercel Project Settings (Supabase URL, Anon Key, Service Role Key).
- Clean, zero-warning production build (`npm run build`).
---
## 6. Changelog Maintenance Rules
Whenever changes, features, or fixes are made to the codebase:
1. Update `.meta/Changelogs/changelogs.md` immediately.
2. Group changes under the current unreleased version or release tag with date: `## [Unreleased] - YYYY-MM-DD` or `## [vX.Y.Z] - YYYY-MM-DD`.
3. Categorize updates under standard Keep-a-Changelog sections:
   - `### Added` for new features, components, pages, or integrations.
   - `### Changed` for modifications in existing features, styles, or flows.
   - `### Fixed` for bug fixes, route fixes, styling patches, or runtime corrections.
   - `### Removed` for deleted code, obsolete files, or removed assets.
4. Keep entries concise, clear, and focused on functional impact.
