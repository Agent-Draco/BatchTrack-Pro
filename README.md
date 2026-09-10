# BatchTrack Pro

BatchTrack Pro is a local-first inventory, product traceability, retailer rewards, consumer credit, and billing-machine workspace. The main application is a browser app contained in `index0.html` and served through a local HTTP server.

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
- IndexedDB persistence through application-server restarts

## Project Structure

```text
.
├── index0.html              Main BatchTrack Pro application
├── database/
│   ├── local-db.js          IndexedDB adapter
│   └── README.md             Local database persistence notes
├── gate-entry.html          Separate gate-entry prototype
└── README.md                Project documentation
```

## Run the App

### Windows PowerShell

1. Open PowerShell in the project folder:

```powershell
cd M:\DevProjects-B1\Eureka_codes
```

2. Start the local HTTP server:

```powershell
python -m http.server 8000
```

3. Open the app in your browser:

```text
http://localhost:8000/index0.html
```

Keep the PowerShell window running while using the app. Stop the server with `Ctrl+C`.

Do not open `index0.html` directly with a `file://` URL. The application loads the database adapter and external browser libraries through HTTP, and camera access is more reliable from a local HTTP origin.

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
4. Use the QR scanner when a product record needs to be inspected.

### Billing Machine

1. Create a billing machine from a retailer account.
2. Sign in using the saved machine code and password.
3. Enter or scan products, enter the consumer phone number, and add items to the cart.
4. Finalize the sale to create a transaction and issue the retailer's configured credit to the consumer account.

## Inventory Upload Schema

The first worksheet is read from row 2. The columns are expected in this order:

```text
Batch number | Quantity | Price | Expiry | Warranty | Mfg date | Mfg place | Warranty number
```

Rows without a batch number are ignored. Uploaded records are saved to the retailer's local inventory table.

## Local Database

The application uses the browser's IndexedDB database named `batchtrack_local_db`. It contains these stores:

- `retailers`
- `consumers`
- `machines`
- `inventory`
- `transactions`
- `sessions`

The persistence adapter is [database/local-db.js](database/local-db.js). It exposes table-level `read`, `put`, `remove`, and `find` operations so a future cloud repository can follow the same boundary.

Data survives:

- Python server restarts
- Page reloads
- Browser restarts

Keep the same origin, including `http://localhost:8000`. Changing the scheme, host, port, or browser profile creates a separate browser storage area. Clearing site data deletes the local records.

This is browser-local storage. It is not a shared server database. A multi-device deployment will need a backend API and a durable server database such as SQLite or Postgres.

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
- Multi-user synchronization
- Server-side backups
- Cloud database access

Passwords are currently stored in browser-local IndexedDB for prototype operation. Do not use production credentials or sensitive customer data until a backend authentication and security layer is added.

## Future Cloud Migration

The UI calls the local persistence layer through small table operations rather than accessing IndexedDB directly. A cloud migration can preserve the UI contract by replacing the local adapter with a repository that calls an API, then adding:

1. Server-side authentication and authorization
2. SQLite or Postgres persistence
3. Password hashing and session management
4. Conflict handling and synchronization
5. Database migrations and backups
6. Server-side QR and transaction validation
