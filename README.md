# BatchTrack Pro

BatchTrack Pro is a Supabase-backed inventory, product traceability, retailer rewards, consumer credit, billing-machine, and survey workspace. The main application is a browser app contained in `index.html` and served through a local HTTP server.

## Features

- Retailer accounts with local sign-in and profile records
- Consumer accounts using phone number or email and password
- Billing-machine accounts connected to a retailer
- Explicit billing-machine setup with a unique machine code and password
- Retailer overview, inventory, profile, and billing-machine pages
- CSV, XLSX, and XLS inventory upload
- Inventory parsing from row 2 using the documented eight-column schema
- QR and Aztec payload generation in the same printable PDF
- Camera-based QR and Aztec scanning through a multi-format reader
- Retailer-defined percentage and fixed reward credits
- Consumer purchase history and credit balance
- Desktop and phone presentation modes
- Supabase persistence through application-server restarts and across devices
- Survey response storage in Supabase with CSV download fallback

## Project Structure

```text
.
├── index.html               Main BatchTrack Pro application
├── form.html                Final research survey
├── database/
│   ├── local-db.js          Supabase table adapter
│   └── README.md             Supabase persistence notes
├── supabase/
│   └── migrations/           PostgreSQL schema migrations
├── api/config.js             Vercel runtime configuration endpoint
├── vercel.json               Vercel routes and security headers
├── gate-entry.html          Separate gate-entry prototype
└── README.md                Project documentation
```

## Run the App

### Local HTTP server

1. Open PowerShell in the project folder:

```powershell
cd /workspaces/BatchTrack-Pro
```

2. Start the local HTTP server:

```powershell
python -m http.server 8000
```

3. Open the app in your browser:

```text
http://localhost:8000/index.html
```

Keep the PowerShell window running while using the app. Stop the server with `Ctrl+C`.

Do not open the pages directly with a `file://` URL. The application loads the database adapter and external browser libraries through HTTP, and camera access is more reliable from a local HTTP origin.

## Main Workflows

### Retailer

1. Select **Retailer login** or **Create account**.
2. Create or sign in to a retailer account.
3. Use the retailer navigation to open:
   - **Overview** for store metrics and quick actions
   - **Inventory** for CSV/XLSX upload, inventory records, scanning, and QR PDF generation
   - **Profile** for store information and reward settings
   - **Billing machine** for creating connected cashier stations
4. When creating a billing machine, save its machine code and password. The machine code is the billing login ID.

### Consumer

1. Select **Consumer login** or create a consumer account.
2. Sign in using the phone number or email and password.
3. View the credit balance and purchase ledger.
4. Use the Aztec scanner to add products to Trackly. Official purchases link their tax invoice and RAD history; unmatched scans create standalone tracked items.

### Billing Machine

1. Create a billing machine from a retailer account.
2. Sign in using the saved machine code and password.
3. Enter or scan products, enter the consumer phone number, and add items to the cart.
4. Finalize the sale to create a transaction, invoice, RAD dossiers, inventory decrement, reward credit, and any petty-cash change debt.

### Survey

Open `http://localhost:8000/form.html` to collect responses. Each submission downloads a CSV copy and inserts the response into the Supabase `survey_responses` table.

## Inventory Upload Schema

The first worksheet is read from row 2. The columns are expected in this order:

```text
Batch Number | Quantity | Price | Expiry | Warranty Months | Mfg Date | Category | WADN
```

Rows without a batch number are ignored. Categories are normalized to `pharma`, `consumables`, or `electronics`. A blank WADN is generated as `WADN-<BATCH>-<INDEX>`.

## Supabase Database

The application uses Supabase tables through the adapter in [database/local-db.js](database/local-db.js). The initial migration creates:

- `retailers`
- `consumers`
- `machines`
- `inventory`
- `transactions`
- `documents`
- `credit_notes`
- `support_tickets`
- `sessions`
- `survey_responses`

The adapter preserves the table-level `read`, `put`, `remove`, and `find` API used by the UI. Records are stored as JSONB in the `record` column so the prototype can evolve without changing the browser contract.

The browser uses the Supabase URL and anon key configured in `.env` during setup. The anon key is safe to ship to a browser; access control must come from Supabase RLS. The initial prototype migration allows anonymous CRUD for the app tables and anonymous inserts for survey responses. Replace these policies with authenticated, tenant-scoped policies before production use.

Data survives:

- Python server restarts
- Page reloads
- Browser restarts
- Switching browsers or devices

The app still needs an HTTP origin for its scripts and camera access, but its records are no longer tied to browser storage.

## Vercel Deployment

Import the repository into Vercel as a static project. Add these Vercel environment variables for Production, Preview, and Development:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

The `/api/config` function serves only these public client values at runtime, so the same build works locally and on Vercel. The `vercel.json` routes `/app` to the main app and `/survey` to the survey. Never configure a Supabase service-role key as a browser environment variable.

## Supabase Setup

The browser uses the public Supabase URL and anon key configured for this project. The anon key is intended for browser use; never put a service-role key in HTML or `.env`.

The first migration is [supabase/migrations/20260910000000_create_batchtrack_tables.sql](supabase/migrations/20260910000000_create_batchtrack_tables.sql). It creates the application tables, indexes, updated-at triggers, and prototype RLS policies.

For GitHub deployment, add these repository secrets:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF` = `bwiytslmkiyzdaijjtka`

Pushes to `main` that touch `supabase/migrations/` run [.github/workflows/supabase-migrations.yml](.github/workflows/supabase-migrations.yml).

The current prototype policies allow anonymous CRUD for application tables so the existing local sign-in flow can operate. Replace them with Supabase Auth and tenant-scoped `auth.uid()` policies before production use.

## External Browser Libraries

The page currently loads these libraries from jsDelivr CDN:

- SheetJS for CSV/XLSX parsing
- QRCode for QR image generation
- ZXing Browser for camera-based QR and Aztec decoding
- bwip-js for Aztec image generation
- jsPDF for QR-grid PDF files
- jsQR as a QR compatibility fallback

An internet connection is required when the browser has not cached these scripts. These dependencies can later be moved into a bundled build.

## Prototype Boundaries

This local prototype intentionally does not include:

- OTP verification
- Email verification
- Backend authentication
- Password hashing
- Server-side backups
- Server-side transaction validation

Passwords are still stored in the prototype's application records and are not hashed. Do not use production credentials or sensitive customer data until Supabase Auth and tenant-scoped RLS policies are enabled.

## Automatic Migrations

The Supabase CLI is installed by the workflow, so no local compilation step is required.
