# BatchTrack Prototype - Product Requirements Document

## Overview
- **Summary**: Build a polished, functional full-stack prototype of BatchTrack — a connected retail and consumer product-intelligence platform consisting of three interconnected layers: Trackly (consumer intelligence), Avero (retailer POS/inventory), and WADN (digital product identity). The prototype must demonstrate a closed-loop lifecycle from product → identity → inventory → purchase → ownership → monitoring → intelligence → action → service/recovery.
- **Purpose**: Communicate the BatchTrack product concept convincingly through a working, interactive demo that a viewer can walk through in 3–5 minutes.
- **Target Users**: Demo audiences (investors, stakeholders, pilot customers); two in-app personas: Consumer (Trackly) and Retailer (Avero).

## Goals
1. A working Trackly consumer dashboard with product tracking, expiry intelligence, recipe suggestions, action panels, and pantry scan simulation.
2. A working Avero retailer OS with inventory management, Aztec POS checkout, digital change credits, and salvage/expiry intelligence.
3. WADN product identity layer: every physical product has a persistent, searchable digital record that flows across Trackly ↔ Avero.
4. Closed-loop flow: product in Avero inventory → POS purchase → ownership in Trackly → expiry/warranty intel → service ticket or rescue offer → appears in Avero or Marketplace → analytics update.
5. Marketplace + Analytics secondary screens populated with realistic demo data.
6. A landing/overview page and a Demo Mode that guides a walkthrough of the full ecosystem.
7. Clean, premium, modern product aesthetic (deep teal / gold accent / blue cyan / warm off-white) with smooth motion, responsive layouts, strong info hierarchy.

## Non-Goals
- Real production authentication, payments, deployment infrastructure, or enterprise security.
- Real AI vision APIs for pantry scan (use simulated/mock recognition).
- Real geolocation or real-world transactions for the marketplace.
- Microservices or multi-repo architecture (keep it a single, easy-to-run monorepo with two vite entrypoints or one shared app shell).
- Mobile-native builds; responsive browser view and phone-mode CSS is sufficient.
- Persistence that survives server restarts across sessions — an in-memory store or simple JSON/SQLite file is fine.
- Real Supabase dependency for the prototype core; use local abstraction that can be swapped.

## Background & Context
- Existing static prototype lives in `old-world/` (index.html, avero.html, trackly.html with common.css/common.js, Supabase-migration baseline, localStorage-backed DB).
- Visual identity already defined in `old-world/assets/css/common.css`: deep teal `#173d35`, gold `#f5d65c`, brand `#e56b38`, blue `#0284c7`, warm off-white bg, Space Grotesk + DM Sans fonts.
- Core product principles:
  1. BatchTrack ≠ just an expiry reminder.
  2. Trackly ≠ just a pantry app.
  3. Avero ≠ just a POS.
  4. WADN is the identity layer.
  5. Strongest concept is the closed loop.

## Functional Requirements

### L1 - Application Shell & Navigation
- **FR-1**: Central React app shell with routing between Landing, Trackly, Avero, Product Identity (WADN), Marketplace, and Analytics pages.
- **FR-2**: Mode switch between Consumer view and Retailer view that reconfigures navigation, sidebar, and theme accents.
- **FR-3**: Phone view toggle (preserved from old-world prototype) for responsive consumer-facing screens.
- **FR-4**: Demo Mode entry point with three guided flows: [Consumer Demo], [Retailer Demo], [Product Identity Demo], each ~60–90 seconds.
- **FR-5**: Global toast notifications for action feedback.

### L2 - Trackly (Consumer App)
- **FR-6**: Dashboard summary cards: Total products, Expiring soon, Fresh products, Warranty items, Potential savings, Recent activity.
- **FR-7**: Interactive "Scan My Pantry" flow: click → simulated scanning UI → mock AI detection list (5+ realistic products with qty/expiry/WADN) → user confirmations → products added to Trackly inventory.
- **FR-8**: Smart Expiry screen grouping items into URGENT / USE SOON / SAFE / EXPIRED buckets with per-item action hints (cook, share, replace, etc.).
- **FR-9**: Recipe recommendation engine that reads current inventory and suggests recipes weighted by at-risk ingredients ("Use these first" section), showing ingredients available vs missing, prep time, and recommendation rationale.
- **FR-10**: "What Should I Do?" action panel for every at-risk/warranty product: USE / COOK / SHARE / SELL / SERVICE / REPLACE buttons with contextual copy.
- **FR-11**: Product detail page: image, name, category, prominent WADN, purchase date/location/price, expiry, warranty, lifecycle timeline (PURCHASED → ADDED → CHECKED → WARRANTY ACTIVE → ACTION REQUIRED), "View Digital Passport" CTA.
- **FR-12**: Service-ticket creation flow: pick product → describe issue → auto-attaches WADN, purchase record, invoice, warranty, prior history.

### L3 - Avero (Retailer OS)
- **FR-13**: Retailer Dashboard KPI cards: Today's sales, Inventory value, Items expiring soon, Return opportunities / recoverable value, Low-stock products, Recent transactions.
- **FR-14**: Inventory table with columns: Product, SKU, WADN, Batch, Quantity, Purchase Price, Selling Price, Expiry, Return Deadline, Status. Supports search, filter by status (IN STOCK / LOW STOCK / EXPIRING / RETURNABLE / EXPIRED), and sort.
- **FR-15**: Expiry & Salvage Intelligence page: per-row Product / Qty / Expiry / Return deadline / Potential recoverable value / Recommendation + [Start Return] action.
- **FR-16**: Aztec POS screen: [SCAN PRODUCT] button → simulated scan confirms WADN, price, adds to cart → qty/price/discount/total → customer phone entry → digital change credit prompt when exact change unavailable → complete transaction.
- **FR-17**: Digital change credit persisted against customer phone (demo number), visible in customer profile and Trackly wallet.
- **FR-18**: Service queue: tickets created by Trackly consumers appear here with WADN, customer, warranty status, [Accept Ticket] action.

### L4 - WADN / Product Identity
- **FR-19**: Dedicated Product Identity page showing the lifecycle flow diagram: PHYSICAL PRODUCT → WADN → DIGITAL RECORD → INVENTORY → PURCHASE → OWNERSHIP → WARRANTY → SERVICE.
- **FR-20**: WADN search: user enters a WADN identifier → loads the full digital record (product, owner, purchase date, retailer, batch, warranty, service history, current status).
- **FR-21**: Every product in Trackly and Avero exposes its WADN with a clickable link to the identity page.

### L5 - Closed-Loop Integration
- **FR-22**: When a POS transaction is completed in Avero with a customer phone, the purchased products transfer ownership to that consumer's Trackly inventory immediately.
- **FR-23**: A Trackly-created service ticket appears in Avero's service queue with all attached data and a status field synced between both sides.
- **FR-24**: Product status changes (expiry detected, returned, serviced) update dashboards, counts, and analytics aggregates.

### L6 - Marketplace & Analytics
- **FR-25**: Community Rescue Marketplace: cards of products approaching expiry offered by nearby users (mock location/distance), with [Offer] / [Claim] / [View Product] actions.
- **FR-26**: Analytics dashboard: product waste prevented, inventory value recovered, products tracked, expiry interventions, warranty claims, retailer inventory accuracy, digital change credits. Clean charts; sample totals like ₹24,680 value recovered / 142 products rescued / 318 expiry interventions.

### L7 - Data, API, Interactivity
- **FR-27**: REST API exposing at minimum: GET/POST/PATCH products, GET inventory (with /expiring sub-route), GET user products, GET/POST transactions, GET/POST/PATCH service-tickets, GET/POST change-credits, GET analytics, POST pantry/scan.
- **FR-28**: Seeded demo data on startup: ≥15 consumer products, ≥25 retailer inventory records, ≥5 transactions, ≥5 expiring products, ≥3 warranty records, ≥3 service tickets, ≥3 digital change credits, ≥5 marketplace products — all realistic Indian retail examples with INR pricing.
- **FR-29**: Every major UI action is functional (not fake): add product → inventory update, scan → POS cart, complete transaction → analytics update, add change credit → customer balance, create ticket → Avero visible, confirm pantry scan → Trackly add, status change → dashboard counts reflect, WADN search → correct record load.

### L8 - Landing / Overview
- **FR-30**: Landing page with hero "BATCHTRACK / Make Sense of What You Know.", three cards for Trackly | Avero | WADN, visual lifecycle diagram, two CTAs [Explore Trackly] [Open Avero].

## Non-Functional Requirements
- **NFR-1 (Architecture)**: Clean monorepo: `/client` (React + Vite, components/pages/layouts/hooks/services/data/styles) and `/server` (Express routes/controllers/services/models/middleware/utils).
- **NFR-2 (Run)**: `npm install` + `npm run dev` starts both client and backend concurrently (no extra steps).
- **NFR-3 (Separation)**: Centralised API service on the client; no hardcoded URLs inside components; env vars for configuration.
- **NFR-4 (UX Quality)**: Premium modern aesthetic matching existing BatchTrack palette (deep teal `#173d35`, gold `#f5d65c`, trackly blue `#0284c7`, warm off-white backgrounds). DM Sans + Space Grotesk typography. Subtle motion on page transitions, card hover, status changes, scan animations, inventory updates, and toasts.
- **NFR-5 (Responsive)**: Excellent desktop layout + mobile-friendly Trackly.
- **NFR-6 (Engineering)**: Reusable React components, proper routing, error handling, loading states, empty states, accessible buttons/forms, sensible separation of UI vs API vs data.
- **NFR-7 (Empty States)**: No empty dashboards at startup — demo data loads immediately.

## Constraints
- **Technical**: Node.js, Express.js, React, Vite, REST (WebSocket optional for live updates). Replaceable persistence layer (JSON/SQLite/in-memory). TypeScript is optional but encouraged.
- **Business**: This is a prototype/demo. Prioritize coherent interactive experience over enterprise infrastructure.
- **Dependencies**: Avoid real paid SaaS APIs. Pantry scan, barcode scanning, and location are simulated.

## Assumptions
- Single "demo consumer" and "demo retailer" identities are acceptable; no multi-user auth flow required.
- INR currency and Indian retail product names/brands.
- WADN format is `WADN-IND-YYYY-XXXXXXXX` or short forms as in the existing code.
- "Start Return" and "Claim" in marketplace can be optimistic local actions; no external fulfillment system.
- Existing `old-world/` assets can be copied or re-implemented as React components (palette, spacing, fonts, badges/pills reusable).

## Open Questions
- [ ] Use TypeScript or plain JavaScript? *(JS acceptable; TS optional)*
- [ ] Single Vite React app with consumer/retailer routing, or two separate client entrypoints? *(Single app, single router, mode switch)*
- [ ] SQLite (better-sqlite3) or in-memory JSON store? *(In-memory with optional JSON dump is fine for a prototype)*

## Acceptance Criteria

### AC-1: Trackly Dashboard is populated and interactive
- **Type**: `rule`
- **Given**: App is freshly started with demo data.
- **When**: User navigates to Trackly Dashboard.
- **Then**: Summary cards display non-zero counts for products, expiring, warranty, savings; a recent activity list is visible; card KPI numbers reflect actual seeded inventory counts.
- **Pass Condition**: All five summary cards are present with non-zero values from real seeded data (not hardcoded placeholders), and at least three activity list items are shown.
- **Evidence**: Visual screenshot of Trackly Dashboard + dev server log confirming seeded inventory size matches totals.

### AC-2: Pantry scan simulation flow works end-to-end
- **Type**: `rule`
- **Given**: User is in Trackly with any inventory state.
- **When**: User clicks "Scan Pantry", runs through the simulated scan UI, sees detected products, and confirms at least 3 of them.
- **Then**: Confirmed products appear in Trackly inventory with correct WADN, category, qty, and expiry; dashboard "Total products" count increments by exactly the number confirmed.
- **Pass Condition**: Before/after counts differ by confirmed count; new product records are retrievable via the products API.
- **Evidence**: Screenshot of confirmation step + inventory view after confirm + API response listing the new items.

### AC-3: Smart Expiry groups items with action hints
- **Type**: `rule`
- **Given**: Seeded data includes at least 5 expiring products across date ranges.
- **When**: User opens Smart Expiry.
- **Then**: Items are partitioned into URGENT / USE SOON / SAFE / EXPIRED buckets with product-appropriate action hints.
- **Pass Condition**: Each of the four buckets contains at least one item (or empty state with copy), and every item in URGENT/USE SOON has an action hint displayed next to it.
- **Evidence**: Screenshot of Smart Expiry page showing all four buckets and action hints.

### AC-4: Recipe engine recommends from at-risk inventory
- **Type**: `rule`
- **Given**: Trackly inventory contains tomatoes, bread, cheese or similar seeded perishables.
- **When**: User opens Recipe engine.
- **Then**: "Use these first" section lists ingredients matching soon-to-expire items, and a suggested recipe card shows ingredients available, missing count, prep time, and rationale.
- **Pass Condition**: At least one recipe card references inventory data (available ingredients > 0) and rationale mentions expiry context.
- **Evidence**: Screenshot of recipe page + console/network payload of the recommendation request including inventory input.

### AC-5: What Should I Do? service ticket creation flows to Avero
- **Type**: `rule`
- **Given**: Trackly has a product with warranty and a demo retailer association.
- **When**: User opens product → action panel → [Service Product] → enters issue "Left earbud not charging" → submits.
- **Then**: (a) Service ticket created in Trackly product history with WADN/invoice/warranty attached; (b) same ticket appears in Avero Service Queue with matching product, customer, and "Active" warranty; (c) Analytics ticket counter increments by 1.
- **Pass Condition**: Ticket visible on both sides with same WADN; Avero queue length increases by one; analytics widget value matches.
- **Evidence**: Two side screenshots (Trackly ticket + Avero queue) and analytics after value compared to before.

### AC-6: Avero POS checkout creates Trackly ownership and digital change credit
- **Type**: `rule`
- **Given**: Avero inventory contains Britannia Bread (WADN: WADN-IND-9238F1, ₹45) and one more product; demo customer phone +91-9XXXXXXXXX exists.
- **When**: Retailer clicks [SCAN PRODUCT] twice to build a cart (total ₹87); customer pays ₹100; change available is ₹10; system offers to record ₹3 as Digital Change Credit; user accepts and completes transaction.
- **Then**: (a) Both products appear in Trackly inventory for demo customer with ownership set; (b) Customer credit balance shows +₹3; (c) Inventory qty in Avero reduces accordingly; (d) Transaction is visible in Avero recent transactions.
- **Pass Condition**: Trackly product list now contains two new WADNs; change credit API returns ₹3 for that phone; Avero inventory qty for bread decremented by 1; transaction row present with same total.
- **Evidence**: POS completion screenshot + Trackly inventory after + change credit API response JSON + Avero inventory/transaction after.

### AC-7: Inventory table and salvage intelligence are filterable
- **Type**: `rule`
- **Given**: Retailer inventory seeded with ≥25 items across statuses.
- **When**: In Avero Inventory page user filters by EXPIRING, sorts by Expiry asc, and searches "Amul".
- **Then**: Filtered rows match both EXPIRING status and search term; sort puts earliest expiry first. On Salvage page, clicking [Start Return] on any row removes it from returnable list and increments "Inventory value recovered" KPI.
- **Pass Condition**: Row count changes correctly with each filter/sort/search; start-return action changes KPI by the row's recoverable value amount.
- **Evidence**: Screenshots of filtered inventory, salvage page before/after [Start Return], and KPI value delta.

### AC-8: WADN identity search retrieves correct product record
- **Type**: `rule`
- **Given**: Seeded data has a known WADN (e.g., WADN-IND-2026-8F4A91C2).
- **When**: User goes to Product Identity page, enters WADN, clicks Search.
- **Then**: Full digital record loads (product, owner, purchase date, retailer, batch, warranty, service history, status) and matches seeded data.
- **Pass Condition**: Every field from the WADN record spec is displayed with the exact value from the seed (or empty state with copy if not applicable).
- **Evidence**: Screenshot of identity page after search.

### AC-9: Closed-loop 10-step acceptance scenario works end-to-end
- **Type**: `rule`
- **Given**: Freshly seeded system.
- **When**: User walks through: (1) product exists in Avero, (2) has WADN, (3) purchased via POS with customer phone, (4) associated with customer, (5) appears in Trackly, (6) Trackly flags expiry/warranty, (7) recommends action, (8) user creates service ticket / offers rescue, (9) action visible in Avero / Marketplace, (10) analytics update.
- **Then**: All 10 steps execute with observable state changes at each step.
- **Pass Condition**: Screenshots or evidence for every step, with counts and IDs matching across steps.
- **Evidence**: Step-by-step run log (screenshots + key API call results) showing the end-to-end loop.

### AC-10: Landing page, overview cards, and Demo Mode entry are present
- **Type**: `rule`
- **Given**: App running.
- **When**: User visits `/` (landing), sees three cards (Trackly/Avero/WADN), lifecycle diagram, two CTAs, and a Demo Mode entry with three guided demo buttons.
- **Then**: Clicking [Explore Trackly] / [Open Avero] navigates to correct routes; clicking [Consumer Demo], [Retailer Demo], or [Product Identity Demo] initiates a walkthrough of ≥4 steps each.
- **Pass Condition**: Landing contains all required elements; navigation to sub-pages works; each demo walkthrough runs to completion with a progress indicator.
- **Evidence**: Landing screenshot + Demo Mode walkthrough mid-step screenshot.

### AC-11: Marketplace and Analytics pages render with data and charts
- **Type**: `rule`
- **Given**: Seeded demo data.
- **When**: User opens Marketplace and Analytics pages.
- **Then**: Marketplace displays ≥5 product cards with prices, distance, expiry, and working [Offer]/[Claim]/[View Product] buttons. Analytics shows at least 5 metric tiles and at least 2 charts (bar + line) with numbers >= the documented sample thresholds (₹24,680 / 142 / 318 or higher).
- **Pass Condition**: All tiles and charts are non-empty; clicking [Claim] on one marketplace card moves it to "claimed" state (UI changes).
- **Evidence**: Screenshots of both pages + before/after of one claim action.

### AC-12: Code structure, run script, and separation of concerns
- **Type**: `rule`
- **Given**: Cloned repository.
- **When**: `npm install && npm run dev` is run from the repo root.
- **Then**: Server starts Express API on a known port, Vite client starts on another port (or proxied together), and API smoke tests (GET /api/products, GET /api/analytics) return valid JSON within 15 seconds.
- **Pass Condition**: Both processes running, no unhandled errors in console, two API calls return 200 with JSON arrays/objects. Project structure matches `/client/src/{components,pages,layouts,hooks,services,data,styles}` and `/server/src/{routes,controllers,services,models,middleware,utils}`.
- **Evidence**: `npm run dev` console output, curl results for two endpoints, `ls` tree of the created structure.

### AC-13: Aesthetic and UX quality
- **Type**: `rubric`
- **Dimension**: Visual polish, consistency with BatchTrack palette/typography, motion, info hierarchy.
- **Scale**: 1-5
- **Anchors**: 1 = raw Bootstrap / generic look, mismatched colors, no hierarchy, no motion; 3 = functional components with some palette matching, average spacing, basic hover states only; 5 = premium product-demo aesthetic with full palette adoption, consistent spacing, strong typographic hierarchy, subtle transitions on cards/buttons/statuses, loading and empty states.
- **Pass Threshold**: >= 4
- **Evidence**: Screenshots of Trackly Dashboard, Avero Dashboard, Product Identity, and Landing.

### AC-14: Interactivity completeness (avoid fake buttons)
- **Type**: `rubric`
- **Dimension**: Proportion of primary CTAs that trigger real state changes vs no-ops or toast stubs.
- **Scale**: 1-5
- **Anchors**: 1 = most buttons are decorative / toast-only stubs; 3 = about half functional; 5 = every primary CTA in scope (scan, add, confirm, purchase, return, create, claim, search, accept) produces a state change that reflects across the relevant UI and API.
- **Pass Threshold**: >= 4
- **Evidence**: Walkthrough log of 10+ primary CTA actions each followed by a visible state/UI change.

### AC-15: Performance and startup experience
- **Type**: `rubric`
- **Dimension**: Startup time, initial load, perceived responsiveness.
- **Scale**: 1-5
- **Anchors**: 1 = >30 s to interactive, broken lazy loads, constant jank; 3 = ~15 s startup, acceptable responsiveness, one or two loader gaps; 5 = `npm run dev` to first-meaningful-paint in <10 s, screens render with skeleton/loader states, transitions smooth, no visible layout shift on data load.
- **Pass Threshold**: >= 3
- **Evidence**: Startup timestamps from the terminal, screenshots of skeleton/loading states.
