# Changelog

All notable changes to the BatchTrack Pro ecosystem are documented in this file.

## [Unreleased] - 2026-09-28

### Added
- **Project Development Guidelines & Architecture Documentation**:
  - Authored comprehensive `Instructions.md` covering strict architectural separation between Trackly (Consumer) and Avero (Merchant OS / Aztec POS).
  - Established end-to-end user flow requirements mandating authenticated accounts for all features and interactions.
  - Enforced strict zero-mock-data rule mandating direct Supabase queries and mutations with loading, empty, and error state handling.
  - Documented button-driven UI accessibility and mandatory browser-based visual verification workflows.
  - Specified cross-environment deployment standards for both local (`npm run dev`) and Vercel production hosting.
  - Codified changelog maintenance processes and standards.

## [0.1.0] - 2026-09-27

### Added
- **Enlarged Official Brand Assets**:
  - Implemented `BrandLogo.jsx` with enhanced scaling options (`xs`, `sm`, `md`, `lg`, `xl`, `hero`) supporting dynamic heights up to 92px.
  - Placed logos strictly on clean neutral white (`#ffffff`) or warm parchment (`#fffefb`) containers with soft borders and drop shadows (strictly avoiding blue backgrounds per design rule).
  - Enlarged header and showcase logos across `LandingLayout`, `TracklyLayout`, `AveroLayout`, `PlatformLayout`, and `LandingPage` (44px–48px height in headers, 44px–60px in showcase cards).
- **Dedicated Dual Visual Identity System**:
  - **TRACKLY**: Vivid blue palette (`#0284c7`, `#0ea5e9`, `#38bdf8`), playful micro-entity badges (`🔥 2 Expiring`, `🧺 18 Tracked`, `💰 ₹1,240 Saved`), pill sub-navigation, AI pantry vision scanner, and smart recipe suggestions.
  - **AVERO**: Executive warm parchment (`#f6f3eb`, `#fffefb`) and forest green system (`#173d35`, `#2f8059`), rounded corners (18px–24px), merchant badges (`🏪 Aztec Supermarket`, `🟢 Terminal Online`, `♻️ ₹18,400 Salvageable`), live batch tracking table, vendor salvage claims, and Aztec POS terminal.
  - **BATCHTRACK LANDING PAGE**: Dual-identity side-by-side showcase cards, 7-stage closed-loop lifecycle timeline, and direct launch buttons.
- **Dedicated Layouts & Routing**:
  - `LandingLayout.jsx` for `/` landing page.
  - `TracklyLayout.jsx` for `/trackly/*` consumer suite (`/trackly/dashboard`, `/trackly/pantry`, `/trackly/expiry`, `/trackly/recipes`, `/trackly/product/:wadn`, `/trackly/auth`).
  - `AveroLayout.jsx` for `/avero/*` merchant OS (`/avero/dashboard`, `/avero/inventory`, `/avero/salvage`, `/avero/pos`, `/avero/service-queue`, `/avero/auth`).
  - `PlatformLayout.jsx` for `/identity`, `/marketplace`, `/analytics`, `/demo`.
- **Supabase Integration & Auth State**:
  - `AuthContext.jsx` and `context/index.js` exporting `AuthProvider`, `useAuth`, `DEMO_CONSUMER`, `DEMO_RETAILER` with real-time session synchronization.
  - Supabase client in `client/src/services/supabase.js` and server admin in `server/src/services/supabaseAdmin.js`.

### Removed
- **Sidebar (`<aside>`)**: Completely removed the persistent sidebar and backdrop across all application layouts to eliminate layout crowding and viewport overflow.

### Fixed
- Fixed module export resolution in `client/src/components/ui/BrandLogo.jsx` and `client/src/context/index.js`.
- Fixed literal unicode character rendering (`\u2014`, `\u2019`) in landing page strings.
- Added `favicon.ico` in `client/public/` to resolve 404 console errors.
