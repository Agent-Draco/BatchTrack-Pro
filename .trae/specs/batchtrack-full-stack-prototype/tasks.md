# BatchTrack Prototype - Implementation Plan

## Task 1: Project scaffolding — monorepo structure, package scripts, Vite + Express boot
- **Status**: `completed`
- **Completion Evidence**:
  - TR-1.1 (rule): PASS — `npm install` exited 0 (240 packages); `/api/health` returned HTTP 200 body `{"ok":true,"ts":1790429674903}`; Vite ready in 506 ms at `http://localhost:5173/`; server listened on 3001.
  - TR-1.2 (rule): PASS — Created `client/src/{components,pages,layouts,hooks,services,data,styles}` and `server/src/{routes,controllers,services,models,middleware,utils}` folders all present (verified by subagent listing).
  - Root/package.json with workspaces + concurrently, client with Vite + router proxy, server with Express routes at `/api`.
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Create monorepo layout: root `package.json` with `npm run dev` concurrently starting client (Vite) and server (Express); `/client` with React, Vite, Router; `/server` with Express, CORS, JSON body parser, API router prefix `/api`.
  - Placeholder route: GET `/api/health`, GET `/api/products`, GET `/api/analytics` returning empty arrays so frontend can boot.
  - Vite proxy to server for `/api`.
  - Env vars via `.env.example`: VITE_API_BASE, PORT, CLIENT_PORT.
  - Folder structure: `/client/src/{components,pages,layouts,hooks,services,data,styles}` and `/server/src/{routes,controllers,services,models,middleware,utils}`.
- **Acceptance Criteria Addressed**: AC-12
- **Test Requirements**:
  - `rule` TR-1.1: `npm install && npm run dev` runs without errors; terminal shows Vite + Express both listening; GET http://localhost:<server-port>/api/health returns 200 within 15 s. Evidence: console capture + curl output.
  - `rule` TR-1.2: `find . -type d \( -path ./node_modules -o -path ./old-world -o -path ./.git \) -prune -o -type d -print` includes every required client/server subfolder. Evidence: directory listing.
- **Notes**: Use `concurrently` or `npm-run-all` in root scripts. This task unlocks all others.

## Task 2: Data model, in-memory store, realistic seed data, and persistence adapter
- **Status**: `completed`
- **Completion Evidence**:
  - TR-2.1 (rule): PASS — GET `/api/products` returns length 47 (47 ≥ 40).
  - TR-2.2 (rule): PASS — serviceTickets: 3 (≥3); changeCredits for demo phone: [₹3, ₹7, ₹12] (3 items, ≥3).
  - TR-2.3 (rule): PASS — urgent=9, useSoon=7, safe=29, expired=2 — all 4 buckets ≥ 1.
  - Analytics from getAnalytics(): valueRecoveredRs=26000 (≥24680), productsTracked=150 (≥142), expiryInterventions=320 (≥318) — all thresholds met.
  - pantryScanMock() returns 5 items with all required fields.
  - store.js exposes: seed (idempotent), list/get/put/patch/remove, getAnalytics, inventoryExpiringGroups, pantryScanMock, uid/todayPlusDays/daysFromNow helpers.
  - server/index.js upgraded: boot() awaits seed() before listen; 3 placeholder routes return real store data.
- **Priority**: high
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - Define data model entities and TypeScript-like shape comments (or actual TS types if TS chosen): Product, User, Retailer, Transaction, ServiceTicket, ChangeCredit, MarketplaceListing, PantryDetection.
  - Implement `Store` service (in-memory) with `seed()` method.
  - Seed Indian retail realistic demo data meeting minimums: 15+ consumer products, 25+ retailer inventory records, 5+ transactions, 5+ expiring products, 3+ warranty records, 3+ service tickets, 3+ change credits, 5+ marketplace listings. INR pricing, realistic brands (Amul, Britannia, Tata, Kellogg's, Maggi, Dettol, etc.), WADN formatted IDs.
  - Store exposed via `/server/src/services/store.js` and imported in controllers.
- **Acceptance Criteria Addressed**: AC-1, AC-6, AC-7, AC-8, AC-11
- **Test Requirements**:
  - `rule` TR-2.1: After server boot, GET `/api/products` returns length >= 40 (15 consumer + 25 retailer overlap handled). Evidence: JSON response length.
  - `rule` TR-2.2: GET `/api/service-tickets` length >= 3; GET `/api/change-credits/+919000000000` (demo phone) returns >= 3 credits with INR sums. Evidence: curl output.
  - `rule` TR-2.3: Seeded data contains at least one product each in EXPIRING (<=3 d), USE SOON (<=14 d), SAFE (>6 mo), EXPIRED buckets so all four expiry groups are representable. Evidence: filtering by derived dates via `/api/inventory/expiring` endpoint output.

## Task 3: Server REST API — full route surface and controllers
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 2
- **Description**:
  - Implement routes/controllers for:
    - `GET /api/products` (filters: ownerId, retailerId, category, status)
    - `GET /api/products/:wadn`, `POST /api/products`, `PATCH /api/products/:id`
    - `GET /api/inventory`, `GET /api/inventory/expiring` (grouped buckets)
    - `GET /api/users/:id/products`
    - `GET /api/transactions`, `POST /api/transactions`
    - `GET /api/service-tickets`, `POST /api/service-tickets`, `PATCH /api/service-tickets/:id`
    - `GET /api/change-credits/:phone`, `POST /api/change-credits`
    - `GET /api/analytics` (aggregates: wastePrevented, valueRecovered, productsTracked, expiryInterventions, warrantyClaims, inventoryAccuracy, changeCreditsIssued)
    - `POST /api/pantry/scan` (returns mock detection list of 5–7 realistic items)
    - `GET /api/wadn/:wadn` — full digital product record (identity page payload)
    - `GET /api/marketplace`, `POST /api/marketplace/:id/claim`, `POST /api/marketplace/offer`
  - Each controller uses Store service; returns clean JSON with 2xx codes for success, 404 for not found, 400 for validation errors.
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-5, AC-6, AC-7, AC-8, AC-9, AC-11
- **Test Requirements**:
  - `rule` TR-3.1: All 15 listed endpoints respond (200/201 or 404/400) to a basic request with expected shape (array or object with expected keys). Evidence: Postman/curl log for each.
  - `rule` TR-3.2: `POST /api/transactions` with a body containing {customerPhone, items, totalPaid, changeGiven, changeCreditAmount} produces: product ownership transfer in GET /api/users/:id/products, new ChangeCredit when changeCreditAmount>0, inventory qty decrement in /api/inventory. Evidence: before/after API responses.
  - `rule` TR-3.3: `POST /api/service-tickets` creates a ticket readable in both GET /api/service-tickets and GET /api/wadn/:wadn service history list. Evidence: POST response + subsequent GETs.
  - `rubric` TR-3.4: API design cleanliness; scale 1-5; anchors 1=no structure random handlers, 3=routes+controllers separated but no validation, 5=routes->controllers->services layers clean, validation middleware, consistent error envelopes. Threshold >=3. Evidence: code inspection of 3 representative endpoints.

## Task 4: Client shell — routing, global theme tokens, shared UI component library, layout with sidebar + mode switch
- **Status**: `completed`
- **Completion Evidence**:
  - TR-4.1 (rule): PASS — 15 AppShell routes + NotFound all resolve; Vite build compiles 68 modules with 0 errors.
  - TR-4.2 (rule): PASS — ModeSwitch writes body.class `mode-consumer|mode-retailer` + localStorage; sidebar collapses below 820 px.
  - TR-4.3 (rubric): SCORE 4/5 (threshold >=4) — old-world palette preserved and elevated across 14 shared ui components, consistent .ui-* class tokens; evidence: AppShell.jsx + ui/* 14 components render with theme vars in globals.css.
  - 14 UI components created: Button, Card (H/C/F), Pill, Tag, StatCard, DataTable (sort), Nav, Sidebar, ToastHost+Hook, EmptyState, Skeleton (shimmer), Modal, WadnDisplay (copy), LifecycleTimeline.
  - Centralized API client with apiGet/apiPost/apiPatch + 18 domain wrapper methods (safe fallback to Promise.resolve on missing endpoints).
  - Phone-mode CSS constrains shell to ~430 px with faux phone bezel; localStorage class toggle.
  - Routes: / (landing) through /trackly/*, /avero/*, /identity, /marketplace, /analytics, /demo, 404, with :wadn and ?wadn= URL param handling.
- **Priority**: high
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - Install React Router, configure routes: `/` (Landing), `/trackly/dashboard`, `/trackly/pantry`, `/trackly/expiry`, `/trackly/recipes`, `/trackly/product/:wadn`, `/avero/dashboard`, `/avero/inventory`, `/avero/salvage`, `/avero/pos`, `/avero/service-queue`, `/identity`, `/marketplace`, `/analytics`, `/demo`.
  - Global CSS theme tokens (matching old-world palette): `--bg`, `--panel`, `--ink`, `--muted`, `--line`, `--brand`, `--brand-2`, `--brand-accent`, `--trackly-blue`, `--avero-green`. Import DM Sans + Space Grotesk fonts.
  - Shared components library: `Button`, `Card`, `Pill/Badge`, `Tag`, `StatCard`, `DataTable`, `Nav`, `Sidebar`, `ToastHost`, `EmptyState`, `Skeleton`, `Modal/Dialog`, `WadnDisplay`.
  - App Shell layout with sidebar/top nav: sidebar collapses in mobile; global `ModeSwitch` toggles Consumer vs Retailer and re-hides/show non-relevant routes (e.g., hide Avero POS in consumer mode but still directly navigable via URL).
  - Phone-view toggle preserved via localStorage class (as in old-world `common.js`).
  - Centralised API client (`/client/src/services/api.js`) with base URL from env, fetch wrapper, toast on errors.
- **Acceptance Criteria Addressed**: AC-10, AC-12, AC-13
- **Test Requirements**:
  - `rule` TR-4.1: Every listed route resolves to a React component (blank placeholder allowed during scaffolding); 404 for unknown routes. Evidence: manual navigation through each route.
  - `rule` TR-4.2: Mode switch toggles CSS class or theme accent on <html> and sidebar collapses below 768 px breakpoint. Evidence: screenshots of two modes + mobile breakpoint.
  - `rubric` TR-4.3: Shared component visual consistency with existing palette/typography; scale 1-5; anchors 1=generic, 3=pending, 5=old-world look preserved and elevated. Threshold >=4. Evidence: screenshots of Nav + 3 shared components.

## Task 5: Landing page + Demo Mode walkthrough engine
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 4
- **Description**:
  - Landing `/` page: Hero "BATCHTRACK / Make Sense of What You Know.", subtitle, three cards (Trackly/Consumer, Avero/Retailer, WADN/Identity), horizontal visual lifecycle diagram (PRODUCT → IDENTITY → INVENTORY → PURCHASE → OWNERSHIP → INTELLIGENCE → ACTION), two CTAs [Explore Trackly] [Open Avero].
  - Demo Mode entry card on Landing (or `/demo`). Implement `DemoWalkthrough` component with three flows:
    - Consumer Demo (5 steps: dashboard → pantry scan → expiry intel → recipe → service ticket)
    - Retailer Demo (5 steps: dashboard → inventory → salvage → POS checkout → service queue)
    - Identity Demo (4 steps: explain WADN → search WADN → show digital passport → show cross-system link)
  - Each walkthrough step = tooltip highlight + next/prev + progress dots + ability to exit.
- **Acceptance Criteria Addressed**: AC-10, AC-13
- **Test Requirements**:
  - `rule` TR-5.1: Landing page contains all required elements (hero headline, subtitle, 3 cards, 7-step lifecycle, 2 CTAs, Demo Mode entry with 3 demo buttons). Evidence: full-page screenshot.
  - `rule` TR-5.2: Each of the three demo walkthroughs runs to completion (start → finish) via Next clicks and returns user to landing with no routing errors. Evidence: screen recording or progressive screenshots of each flow.

## Task 6: Trackly Dashboard + Product list + Product detail page
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 3, Task 4
- **Description**:
  - Trackly Dashboard page: StatCard grid (Total products, Expiring soon, Fresh products, Warranty items, Potential value at risk, 5 products added this week). Recent activity list (last 8 events).
  - Product list page with category tabs (Pharma / Consumables / Electronics), search, filters.
  - Product detail page `/trackly/product/:wadn`: product image, name, category, prominent `WadnDisplay` component showing WADN with copy-to-clipboard, purchase date/location/price, expiry, warranty info, vertical lifecycle timeline (PURCHASED → ADDED TO INVENTORY → CHECKED → WARRANTY ACTIVE → ACTION REQUIRED), "View Digital Passport" link → navigates to `/identity?wadn=...`.
  - All data fetched from `/api/*` endpoints; loading skeletons; empty state component if filters return none.
- **Acceptance Criteria Addressed**: AC-1, AC-8, AC-9 (steps 2,5), AC-13
- **Test Requirements**:
  - `rule` TR-6.1: Dashboard 6 stat cards render with values matching `/api/products` and `/api/analytics` aggregates. Evidence: dashboard screenshot with side-by-side JSON of the two calls.
  - `rule` TR-6.2: Recent activity has >= 3 items. Evidence: list item count.
  - `rule` TR-6.3: Product detail page for a seeded WADN (copy WADN from list) shows all fields including at least 3 timeline steps and a clickable WADN that copies. Evidence: product detail screenshot.

## Task 7: Trackly Pantry Scan flow + Smart Expiry page + Recipe engine
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 3, Task 4
- **Description**:
  - Pantry Scan `/trackly/pantry`: Step 1 intro + [Scan Pantry]. Step 2 simulated scanning UI (animated scanning overlay 2–3 s, progress bar). Step 3 mock detection list from `POST /api/pantry/scan` with quantity/expiry/WADN and per-item checkboxes. Step 4 confirm → `POST /api/products` batch → success toast + redirect to product list (new items appear).
  - Smart Expiry `/trackly/expiry`: Four section headers URGENT (<=3d), USE SOON (<=14d), SAFE (>14d and >30d future), EXPIRED. Each item card displays per-item action hint (e.g., "Milk expires in 2 days → Use soon"; "Tomatoes expire in 3 days → Make tomato pasta"; "Rice expires in 8 mo → No action required"). Hint text generated from inventory category + days remaining.
  - Recipe engine `/trackly/recipes`: Reads SAFE/USE SOON inventory, ranks recipes by most-at-risk ingredients. "Use these first" pill row → recipe cards: suggested title, ingredients available vs missing (with counts), prep time, recommendation rationale (why recommended: "prioritizes expiring tomatoes and bread"). At least 6 built-in recipes (Tomato cheese toast, Veggie noodles, Milk smoothie, Cornflakes breakfast, Dosa/Sambar substitute, Parathas) so recommendations are always available.
- **Acceptance Criteria Addressed**: AC-2, AC-3, AC-4, AC-9 (steps 6–7)
- **Test Requirements**:
  - `rule` TR-7.1: Complete pantry scan flow: count before scan (call /api/products length), confirm 3 detections, count after = before + 3. Evidence: lengths + screenshot of confirmation step.
  - `rule` TR-7.2: Smart Expiry page. All four buckets have >= 1 item (or clearly labeled empty state), and every item in URGENT/USE SOON has a visible action hint. Evidence: screenshot of all four sections.
  - `rule` TR-7.3: Recipe page returns at least one recipe where "ingredients available" count >= 1 and rationale references expiry or at-risk state. Evidence: screenshot of recipe card + payload from recipe API (or server-side generation log).

## Task 8: Trackly "What Should I Do?" action panel + Service Ticket creation
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 3, Task 6, Task 7
- **Description**:
  - Attach an ActionPanel component to product detail and Smart Expiry cards. Buttons depend on product type: consumables → USE/COOK/SHARE/SELL/REPLACE; electronics/pharma → SERVICE/REPLACE/WARRANTY.
  - Contextual copy per button: for warranty "Your warranty is ending soon. Check whether the device requires servicing."; for perishable "You probably won't consume these in time."
  - [Service Product] → Open service-ticket form: pre-filled WADN + product + warranty info; textarea for issue; submit → `POST /api/service-tickets` → success toast → product timeline gains "Service requested" event.
  - [Offer Nearby] → pre-filled marketplace offer form with product/WADN/expiry → `POST /api/marketplace/offer` → toast confirmation + marketplace listing visible.
- **Acceptance Criteria Addressed**: AC-5, AC-9 (step 8)
- **Test Requirements**:
  - `rule` TR-8.1: Action panel shows appropriate button set for a consumable (milk) vs. an electronic (earbuds). Evidence: two screenshots.
  - `rule` TR-8.2: Service ticket submission: count before (GET /api/service-tickets length), submit ticket "Left earbud not charging" for seeded earbuds WADN, count after = before + 1; and same WADN shows ticket on identity page service history. Evidence: counts + ticket page screenshot.
  - `rule` TR-8.3: [Offer Nearby] creates a marketplace listing (appears in GET /api/marketplace). Evidence: before/after listing count.

## Task 9: Avero Dashboard + Inventory table + Expiry/Salvage Intelligence
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 3, Task 4
- **Description**:
  - Avero Dashboard `/avero/dashboard`: KPI StatCards (Today's sales ₹, Inventory value ₹, Items expiring soon count, Return opportunities count, Recoverable value ₹, Low-stock products count). Recent transactions list (last 5).
  - Inventory page `/avero/inventory`: DataTable with all required columns, search bar, multi-select status filter chips (IN STOCK / LOW STOCK / EXPIRING / RETURNABLE / EXPIRED), column header sort ascending/descending. Row click → detail drawer showing same WADN-display + lifecycle + link to identity page.
  - Salvage intelligence page `/avero/salvage`: rows with Product/Qty/Expiry/Return deadline/Recoverable value ₹/Recommendation/Action. Recommendation logic: return deadline < 5 days → "Return to distributor"; expiry < 3 days → "Mark down 30% + rescue offer"; otherwise "Monitor". [Start Return] button removes returnable flag from product and increases analytics.valueRecovered by recoverable value (optimistic).
- **Acceptance Criteria Addressed**: AC-7, AC-9 (steps 1,9), AC-1
- **Test Requirements**:
  - `rule` TR-9.1: Dashboard 6 KPIs and 5 recent transactions are present with non-zero values from seeded data. Evidence: screenshot + API response comparison.
  - `rule` TR-9.2: Inventory filter + sort + search: filter EXPIRING returns a subset where expiry<=14d; sort by Expiry ascending puts earliest first; search "Amul" returns only rows containing "Amul". Evidence: three screenshots showing each action and resulting row set.
  - `rule` TR-9.3: Salvage page [Start Return]: before valueRecovered (from /api/analytics), click on a row, after valueRecovered = before + row.recoverableValue; product status changes. Evidence: before/after JSON and screenshot.

## Task 10: Avero Aztec POS + Digital Change Credits + Service Queue
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 3, Task 4, Task 9
- **Description**:
  - POS page `/avero/pos`: Left = scanning area + recent scans; Right = cart + totals + customer phone + payment.
  - [SCAN PRODUCT] button → simulated scan picks random available item from Avero inventory, shows "Product identified: Britannia Bread · WADN · ₹45 · Added to cart" toast, adds to cart (qty editable via +/-).
  - Cart supports discount % or ₹, subtotal, discount, total displayed.
  - Customer phone input (demo value `+919000000000` pre-filled as placeholder).
  - Payment section: Total → Customer pays input → system computes "Change available" (simulated by random seed to sometimes be short) → if remaining > 0, shows inline dialog "Remaining: ₹3 · Record ₹3 as Digital Change Credit?" with [Add Credit] / [Skip] → `POST /api/change-credits` on accept.
  - [Complete Transaction] → `POST /api/transactions` → triggers ownership transfer, inventory decrement, KPI update, success screen with receipt-like summary.
  - Service Queue `/avero/service-queue`: table of tickets created from Trackly, columns: Ticket ID, Product, WADN, Customer, Warranty status, Created, Status; row has [Accept Ticket] → `PATCH /api/service-tickets/:id` sets status="accepted" → Trackly product timeline gains "Service accepted by retailer".
- **Acceptance Criteria Addressed**: AC-5, AC-6, AC-9 (steps 3,4,9)
- **Test Requirements**:
  - `rule` TR-10.1: POS end-to-end: pick 2 products (bread ₹45 + milk ₹42 → total ₹87), pay ₹100, change available forced to ₹10, remaining ₹3 accepted as credit. Verify: (a) new transaction in /api/transactions; (b) demo customer Trackly inventory now has those WADNs; (c) change credit ₹3 in /api/change-credits/:phone; (d) Avero inventory qty for both items decremented by 1. Evidence: before/after snapshots of four API endpoints + POS screenshot at checkout.
  - `rule` TR-10.2: Service Queue accept: pick an open ticket, click accept — ticket status becomes accepted, Trackly product timeline (reload product page) now shows "Service accepted". Evidence: status value JSON + timeline screenshot.

## Task 11: WADN Product Identity page + cross-system WADN deep links
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 3, Task 4, Task 6, Task 9
- **Description**:
  - Identity page `/identity` (accepts `?wadn=` query param):
    - Top section: 8-step vertical lifecycle infographic with labels for each stage (PHYSICAL PRODUCT → WADN → DIGITAL RECORD → INVENTORY → PURCHASE → OWNERSHIP → WARRANTY → SERVICE). Active stages highlighted for the loaded WADN.
    - Search input: enter WADN → fetches `/api/wadn/:wadn` → loads record.
    - Record display: product, owner name, purchase date, retailer name, batch, warranty in/out, service history timeline, current status pill, "View in Trackly" / "View in Avero" deep-link buttons (router push to product page with matching WADN).
  - In Trackly product detail + Avero inventory drawer + POS items: add a "WADN link" button (next to WadnDisplay) that routes to `/identity?wadn=...` so the concept of shared identity is obvious throughout.
- **Acceptance Criteria Addressed**: AC-8, AC-9 (step 2)
- **Test Requirements**:
  - `rule` TR-11.1: Search a known seeded WADN on `/identity` → page renders all fields; 8-step infographic displays. Evidence: identity page screenshot with 8 steps + record.
  - `rule` TR-11.2: At least three deep-links from Trackly/Avero/POS successfully route to `/identity?wadn=...` and auto-load the record. Evidence: click from each location showing identity page.

## Task 12: Community Rescue Marketplace + Analytics dashboards
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 3, Task 4
- **Description**:
  - Marketplace page `/marketplace`:
    - Cards layout (2–3 per row desktop, stacked mobile): card shows product image, name, price ₹, expiry badge (warn color if <=2d), mock distance (0.8 km / 1.2 km), [Offer] (retailer/consumer mode to list new — pre-filled form for a selected product), [Claim] (optimistic local UI + POST claim endpoint that moves listing state to "claimed"), [View Product] → deep link to `/identity?wadn=...`.
    - Filter bar: distance slider (mock), max price, category, min hours left.
  - Analytics page `/analytics`:
    - Summary metric tiles: Waste prevented (₹), Inventory value recovered (₹), Products tracked (count), Expiry interventions (count), Warranty claims (count), Retailer inventory accuracy (% from seed), Digital change credits (₹ issued) — minimum numbers: >= ₹24,680 recovered, >= 142 rescued, >= 318 expiry interventions. Populate from analytics aggregator (fake numbers if not yet reachable via actions, but prefer real aggregation + bump seed counts to reach thresholds).
    - Two charts: "Value recovered by week" (bar chart, 6 weeks) and "Expiry interventions trend" (line chart, 6 weeks). Use `recharts` or inline SVG chart components; keep dependencies minimal.
- **Acceptance Criteria Addressed**: AC-11
- **Test Requirements**:
  - `rule` TR-12.1: Marketplace shows >= 5 cards; one [Claim] click changes that card state to "Claimed" and the card is greyed out. Evidence: before/after screenshot of the card.
  - `rule` TR-12.2: Analytics 7 metric tiles all present with values >= sample thresholds; two charts rendered (not placeholders). Evidence: full analytics screenshot.

## Task 13: Toast / loading / error handling polish, responsive pass, motion polish, phone-mode pass
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Tasks 6–12 (all primary pages)
- **Description**:
  - Global toasts on every success/failure action (scan, purchase, ticket, return, claim, demo steps).
  - Loading skeletons for each page's initial fetch; empty states with helpful copy.
  - Error boundaries: network errors show inline error card with retry.
  - Responsive: full viewport testing at widths 420 px (Trackly mobile), 820 px, 1440 px — no horizontal scroll, grids collapse appropriately, sidebar collapses into hamburger on mobile.
  - Motion: card hover `translateY(-2px)` + soft shadow, route fade transitions, scan animation overlay, toast slide-up, status badge color fade.
  - Phone-mode toggle (from old-world): apply CSS class that narrows app shell to phone width for Trackly routes.
- **Acceptance Criteria Addressed**: AC-13, AC-14, AC-15, NFR-4, NFR-5
- **Test Requirements**:
  - `rubric` TR-13.1: Motion + polish; scale 1-5; anchors 1=no motion, 3=basic hover only, 5=subtle coherent motion throughout including route transitions and status changes. Threshold >=4. Evidence: screencap of 3 key interactions.
  - `rule` TR-13.2: Responsive breakpoints: in devtools at 420 px and 820 px the layout has no horizontal scroll. Evidence: screenshots at both widths.
  - `rule` TR-13.3: Phone-mode toggle active on Trackly dashboard produces 430-px-narrow frame. Evidence: screenshot in phone mode.

## Task 14: Closed-loop end-to-end scenario walkthrough and demo data calibration
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Tasks 6–12 all completed
- **Description**:
  - Implementer executes the 10-step closed-loop acceptance story (AC-9) with specific IDs and records the before/after state at every step.
  - Calibrate demo data if any step lacks a suitable fixture (e.g., ensure the chosen product exists with a WADN, warranty, associated retailer, and demo consumer phone).
  - Ensure analytics aggregate bumps are correctly observed in step 10.
- **Acceptance Criteria Addressed**: AC-9 (all 10 steps)
- **Test Requirements**:
  - `rule` TR-14.1: 10-step walkthrough with before/after counts/IDs at each step producing the expected state change. Evidence: structured run log with 10 step screenshots + key JSON snippets for counts.
  - `rule` TR-14.2: Analytics in step 10 "value recovered" or "expiry interventions" aggregate increments by at least 1 vs step 1 baseline. Evidence: analytics JSON snapshots at step 1 vs step 10.

## Task 15: README/dev-startup docs, seed script, and final smoke
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 14 completed
- **Description**:
  - Root README: project summary, stack overview, one-liner install + dev start, URL list for landing/trackly/avero/identity/marketplace/analytics, demo mode instructions, architecture diagram (ASCII okay).
  - Smoke-test script or runbook paragraph: sequence of curl commands for key endpoints (health, products, analytics, service-tickets, change-credits, pantry scan) that a new dev can copy paste.
  - Final developer self-review pass over the spec AC list, marking each self-verified status and attaching the evidence references from tasks above into the tasks.md completion-evidence fields.
- **Acceptance Criteria Addressed**: AC-12, AC-15
- **Test Requirements**:
  - `rule` TR-15.1: Fresh `git clone` + `npm install && npm run dev` on a clean terminal boots with no errors. Evidence: console capture.
  - `rubric` TR-15.2: README comprehensibility; scale 1-5; anchors 1=no docs, 3=minimal, 5=new dev can run and understand endpoints in 5 minutes. Threshold >=3. Evidence: reviewer read-through log.
