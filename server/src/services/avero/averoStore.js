/**
 * AVERO CORE RETAIL & OPERATIONAL ENGINE
 * Implements clean 3-level inventory (Product -> Batch -> WADN Unit),
 * Immutable transaction records, Multi-tender Split Payments,
 * Change Credit Ledger, Multi-stage Return & Inspection Workflow,
 * Salvage & Distributor Return Intelligence, POS Terminals, and Audit Logging.
 */

function uid(prefix = '') {
  const rand = Math.random().toString(36).slice(2, 9);
  const ts = Date.now().toString(36);
  return prefix ? `${prefix}_${ts}_${rand}` : `${ts}_${rand}`;
}

function todayPlusDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

function daysDiffFromNow(isoDate) {
  if (!isoDate) return 999;
  const target = new Date(isoDate);
  const now = new Date();
  target.setHours(12, 0, 0, 0);
  now.setHours(12, 0, 0, 0);
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

class AveroStore {
  constructor() {
    this.products = [];
    this.batches = [];
    this.wadns = [];
    this.inventoryMovements = [];
    this.sales = [];
    this.saleItems = [];
    this.payments = [];
    this.changeCredits = [];
    this.returns = [];
    this.returnItems = [];
    this.refunds = [];
    this.terminals = [];
    this.auditLogs = [];
    this.customers = [];
    this._seeded = false;
  }

  async seed() {
    if (this._seeded) return;
    this._seeded = true;

    // 1. Terminals
    const defaultTerminals = [
      {
        id: 'term_01',
        storeId: 'store_aztec_01',
        terminalCode: 'POS-01',
        terminalName: 'Express Lane 1',
        counterLocation: 'Ground Floor Checkout A',
        pin: '1234',
        managerPin: '9999',
        status: 'ONLINE',
        activeCashier: 'Ramesh K. (Cashier #104)',
        allowedOperations: ['SCAN', 'CHECKOUT', 'SPLIT_PAYMENT', 'ISSUE_CREDIT', 'REDEEM_CREDIT', 'RETURNS', 'VOID'],
        lastActive: new Date().toISOString(),
        createdAt: todayPlusDays(-30),
      },
      {
        id: 'term_02',
        storeId: 'store_aztec_01',
        terminalCode: 'POS-02',
        terminalName: 'Main Counter 2',
        counterLocation: 'Ground Floor Checkout B',
        pin: '2345',
        managerPin: '9999',
        status: 'ONLINE',
        activeCashier: 'Pooja V. (Cashier #108)',
        allowedOperations: ['SCAN', 'CHECKOUT', 'SPLIT_PAYMENT', 'ISSUE_CREDIT', 'REDEEM_CREDIT', 'RETURNS'],
        lastActive: new Date().toISOString(),
        createdAt: todayPlusDays(-30),
      },
      {
        id: 'term_03',
        storeId: 'store_aztec_01',
        terminalCode: 'POS-03',
        terminalName: 'Customer Service Counter',
        counterLocation: 'Return & Helpdesk Lounge',
        pin: '3456',
        managerPin: '9999',
        status: 'ONLINE',
        activeCashier: 'Sunil Rao (Service Supervisor)',
        allowedOperations: ['SCAN', 'CHECKOUT', 'SPLIT_PAYMENT', 'ISSUE_CREDIT', 'REDEEM_CREDIT', 'RETURNS', 'INSPECTION', 'REFUND'],
        lastActive: new Date().toISOString(),
        createdAt: todayPlusDays(-30),
      },
    ];
    this.terminals = defaultTerminals;

    // 2. Customers
    const defaultCustomers = [
      { id: 'cust_01', name: 'Rahul Sharma', phone: '+919000000000', email: 'rahul.sharma@example.com', availableChangeCredit: 45.0, createdAt: todayPlusDays(-40) },
      { id: 'cust_02', name: 'Priya Sundaram', phone: '+919876543210', email: 'priya.s@example.com', availableChangeCredit: 18.0, createdAt: todayPlusDays(-35) },
      { id: 'cust_03', name: 'Arjun Mehta', phone: '+919811223344', email: 'arjun.m@example.com', availableChangeCredit: 0.0, createdAt: todayPlusDays(-20) },
      { id: 'cust_04', name: 'Ananya Deshmukh', phone: '+919822334455', email: 'ananya.d@example.com', availableChangeCredit: 62.5, createdAt: todayPlusDays(-15) },
    ];
    this.customers = defaultCustomers;

    // 3. Products
    const seedProducts = [
      { id: 'prod_amul_milk_1l', sku: 'SKU-AMUL-MLK-1L', barcode: '8901262010014', name: 'Amul Taaza Homogenised Milk 1L', brand: 'Amul', category: 'Dairy & Chilled', unit: 'Pack', basePrice: 42, taxRate: 0, isSerialized: false, minStockThreshold: 15 },
      { id: 'prod_amul_paneer_200g', sku: 'SKU-AMUL-PAN-200', barcode: '8901262020020', name: 'Amul Fresh Malai Paneer 200g', brand: 'Amul', category: 'Dairy & Chilled', unit: 'Pack', basePrice: 92, taxRate: 0, isSerialized: false, minStockThreshold: 10 },
      { id: 'prod_amul_curd_500g', sku: 'SKU-AMUL-CRD-500', barcode: '8901262030037', name: 'Amul Masti Dahi Curd 500g', brand: 'Amul', category: 'Dairy & Chilled', unit: 'Cup', basePrice: 52, taxRate: 0, isSerialized: false, minStockThreshold: 8 },
      { id: 'prod_brit_bread', sku: 'SKU-BRIT-BRD-400', barcode: '8901063012012', name: 'Britannia 100% Whole Wheat Bread 400g', brand: 'Britannia', category: 'Bakery', unit: 'Pack', basePrice: 45, taxRate: 0, isSerialized: false, minStockThreshold: 12 },
      { id: 'prod_tata_salt', sku: 'SKU-TATA-SALT-1K', barcode: '8901030010011', name: 'Tata Salt Vacuum Evaporated Iodised 1kg', brand: 'Tata', category: 'Staples & Grains', unit: 'Pack', basePrice: 30, taxRate: 5, isSerialized: false, minStockThreshold: 20 },
      { id: 'prod_ig_rice_5kg', sku: 'SKU-IG-RICE-5KG', barcode: '8901112233445', name: 'India Gate Feast Rozzana Basmati Rice 5kg', brand: 'India Gate', category: 'Staples & Grains', unit: 'Bag', basePrice: 699, taxRate: 5, isSerialized: false, minStockThreshold: 5 },
      { id: 'prod_ash_flour_5kg', sku: 'SKU-ASH-ATA-5KG', barcode: '8901030055012', name: 'Aashirvaad Superior MP Sharbati Atta 5kg', brand: 'Aashirvaad', category: 'Staples & Grains', unit: 'Bag', basePrice: 325, taxRate: 5, isSerialized: false, minStockThreshold: 6 },
      { id: 'prod_maggi_70g', sku: 'SKU-MAG-NDL-70', barcode: '8901058852210', name: 'Maggi 2-Minute Masala Instant Noodles 70g', brand: 'Maggi', category: 'Packaged Foods', unit: 'Pack', basePrice: 16, taxRate: 12, isSerialized: false, minStockThreshold: 30 },
      { id: 'prod_kellogg_cf', sku: 'SKU-KEL-CF-475', barcode: '8901499011234', name: "Kellogg's Real Honey Almond Corn Flakes 475g", brand: "Kellogg's", category: 'Breakfast Cereals', unit: 'Box', basePrice: 165, taxRate: 12, isSerialized: false, minStockThreshold: 8 },
      { id: 'prod_dettol_soap', sku: 'SKU-DET-SOAP-75', barcode: '8901396011122', name: 'Dettol Original Germ Protection Bathing Bar 75g', brand: 'Dettol', category: 'Personal Care', unit: 'Bar', basePrice: 42, taxRate: 18, isSerialized: false, minStockThreshold: 15 },
      { id: 'prod_coke_125l', sku: 'SKU-COKE-125L', barcode: '8901764012015', name: 'Coca-Cola Original Taste Soft Drink 1.25L', brand: 'Coca-Cola', category: 'Beverages', unit: 'Bottle', basePrice: 72, taxRate: 28, isSerialized: false, minStockThreshold: 10 },
      { id: 'prod_boat_earbuds', sku: 'SKU-BOAT-AP141', barcode: '8904123514101', name: 'boAt Airdopes 141 True Wireless Earbuds', brand: 'boAt', category: 'Electronics & Audio', unit: 'Unit', basePrice: 1499, taxRate: 18, isSerialized: true, minStockThreshold: 4 },
      { id: 'prod_philips_trimmer', sku: 'SKU-PHIL-BT1230', barcode: '8710103851230', name: 'Philips BT1230/15 Cordless Beard Trimmer', brand: 'Philips', category: 'Personal Appliances', unit: 'Unit', basePrice: 1699, taxRate: 18, isSerialized: true, minStockThreshold: 3 },
      { id: 'prod_mi_powerbank', sku: 'SKU-MI-PB20K', barcode: '8906085120202', name: 'Mi 20000mAh 18W Fast Charging Power Bank 3i', brand: 'Mi', category: 'Electronics & Audio', unit: 'Unit', basePrice: 1999, taxRate: 18, isSerialized: true, minStockThreshold: 3 },
    ];
    this.products = seedProducts;

    // 4. Batches
    const seedBatches = [
      // Fast-expiring milk & bread with imminent distributor return deadlines
      {
        id: 'batch_amul_mk01',
        productId: 'prod_amul_milk_1l',
        batchNumber: 'B-AMUL-0926-A',
        mfgDate: todayPlusDays(-5),
        expiryDate: todayPlusDays(2),
        distributorReturnDeadline: todayPlusDays(1), // 1 day left to return to Amul distributor!
        costPrice: 38,
        mrp: 44,
        sellingPrice: 42,
        initialQty: 40,
        currentQty: 18,
        supplierName: 'Gujarat Milk Federation Hub',
        status: 'RETURN_WINDOW_CLOSING',
      },
      {
        id: 'batch_amul_mk02',
        productId: 'prod_amul_milk_1l',
        batchNumber: 'B-AMUL-0928-B',
        mfgDate: todayPlusDays(-1),
        expiryDate: todayPlusDays(5),
        distributorReturnDeadline: todayPlusDays(4),
        costPrice: 38,
        mrp: 44,
        sellingPrice: 42,
        initialQty: 50,
        currentQty: 46,
        supplierName: 'Gujarat Milk Federation Hub',
        status: 'ACTIVE',
      },
      {
        id: 'batch_amul_pan01',
        productId: 'prod_amul_paneer_200g',
        batchNumber: 'B-PAN-0925-P1',
        mfgDate: todayPlusDays(-7),
        expiryDate: todayPlusDays(3),
        distributorReturnDeadline: todayPlusDays(2), // Urgent salvage / return
        costPrice: 78,
        mrp: 95,
        sellingPrice: 92,
        initialQty: 25,
        currentQty: 8,
        supplierName: 'Gujarat Milk Federation Hub',
        status: 'NEAR_EXPIRY',
      },
      {
        id: 'batch_amul_crd01',
        productId: 'prod_amul_curd_500g',
        batchNumber: 'B-CRD-0924-C1',
        mfgDate: todayPlusDays(-8),
        expiryDate: todayPlusDays(2),
        distributorReturnDeadline: todayPlusDays(1),
        costPrice: 42,
        mrp: 55,
        sellingPrice: 52,
        initialQty: 30,
        currentQty: 12,
        supplierName: 'Gujarat Milk Federation Hub',
        status: 'RETURN_WINDOW_CLOSING',
      },
      {
        id: 'batch_brit_br01',
        productId: 'prod_brit_bread',
        batchNumber: 'B-BRD-0926-20',
        mfgDate: todayPlusDays(-3),
        expiryDate: todayPlusDays(2),
        distributorReturnDeadline: todayPlusDays(1),
        costPrice: 38,
        mrp: 48,
        sellingPrice: 45,
        initialQty: 35,
        currentQty: 14,
        supplierName: 'Britannia Bakeries South Hub',
        status: 'RETURN_WINDOW_CLOSING',
      },
      {
        id: 'batch_tata_salt01',
        productId: 'prod_tata_salt',
        batchNumber: 'B-SALT-0826-03',
        mfgDate: todayPlusDays(-40),
        expiryDate: todayPlusDays(320),
        distributorReturnDeadline: todayPlusDays(180),
        costPrice: 24,
        mrp: 32,
        sellingPrice: 30,
        initialQty: 80,
        currentQty: 54,
        supplierName: 'Tata Consumer Products Logistics',
        status: 'ACTIVE',
      },
      {
        id: 'batch_ig_rice01',
        productId: 'prod_ig_rice_5kg',
        batchNumber: 'B-RICE-0726-15',
        mfgDate: todayPlusDays(-60),
        expiryDate: todayPlusDays(300),
        distributorReturnDeadline: todayPlusDays(120),
        costPrice: 620,
        mrp: 750,
        sellingPrice: 699,
        initialQty: 30,
        currentQty: 19,
        supplierName: 'KRBL Agri Logistics',
        status: 'ACTIVE',
      },
      {
        id: 'batch_ash_flour01',
        productId: 'prod_ash_flour_5kg',
        batchNumber: 'B-ATA-0826-09',
        mfgDate: todayPlusDays(-45),
        expiryDate: todayPlusDays(200),
        distributorReturnDeadline: todayPlusDays(60),
        costPrice: 280,
        mrp: 345,
        sellingPrice: 325,
        initialQty: 25,
        currentQty: 16,
        supplierName: 'ITC Limited Foods Division',
        status: 'ACTIVE',
      },
      {
        id: 'batch_maggi01',
        productId: 'prod_maggi_70g',
        batchNumber: 'B-MAG-0915-05',
        mfgDate: todayPlusDays(-20),
        expiryDate: todayPlusDays(160),
        distributorReturnDeadline: todayPlusDays(45),
        costPrice: 12,
        mrp: 18,
        sellingPrice: 16,
        initialQty: 120,
        currentQty: 74,
        supplierName: 'Nestlé India Distribution Center',
        status: 'ACTIVE',
      },
      {
        id: 'batch_kellogg01',
        productId: 'prod_kellogg_cf',
        batchNumber: 'B-KF-0910-01',
        mfgDate: todayPlusDays(-30),
        expiryDate: todayPlusDays(45),
        distributorReturnDeadline: todayPlusDays(12),
        costPrice: 140,
        mrp: 175,
        sellingPrice: 165,
        initialQty: 20,
        currentQty: 9,
        supplierName: 'Kellogg India Hub',
        status: 'ACTIVE',
      },
      {
        id: 'batch_dettol01',
        productId: 'prod_dettol_soap',
        batchNumber: 'B-DET-0815-12',
        mfgDate: todayPlusDays(-50),
        expiryDate: todayPlusDays(300),
        distributorReturnDeadline: todayPlusDays(90),
        costPrice: 34,
        mrp: 45,
        sellingPrice: 42,
        initialQty: 50,
        currentQty: 32,
        supplierName: 'Reckitt Benckiser India',
        status: 'ACTIVE',
      },
      {
        id: 'batch_coke01',
        productId: 'prod_coke_125l',
        batchNumber: 'B-COKE-0915-14',
        mfgDate: todayPlusDays(-15),
        expiryDate: todayPlusDays(75),
        distributorReturnDeadline: todayPlusDays(20),
        costPrice: 58,
        mrp: 75,
        sellingPrice: 72,
        initialQty: 40,
        currentQty: 26,
        supplierName: 'Hindustan Coca-Cola Beverages',
        status: 'ACTIVE',
      },
      // Electronics Batches (Serialized units)
      {
        id: 'batch_boat_eb01',
        productId: 'prod_boat_earbuds',
        batchNumber: 'B-BOAT-0826-W1',
        mfgDate: todayPlusDays(-60),
        expiryDate: todayPlusDays(730),
        distributorReturnDeadline: todayPlusDays(15),
        costPrice: 1200,
        mrp: 1699,
        sellingPrice: 1499,
        initialQty: 10,
        currentQty: 6,
        supplierName: 'Imagine Marketing (boAt Official)',
        status: 'ACTIVE',
      },
      {
        id: 'batch_phil_tr01',
        productId: 'prod_philips_trimmer',
        batchNumber: 'B-PHIL-0826-T2',
        mfgDate: todayPlusDays(-70),
        expiryDate: todayPlusDays(1095),
        distributorReturnDeadline: todayPlusDays(20),
        costPrice: 1400,
        mrp: 1899,
        sellingPrice: 1699,
        initialQty: 8,
        currentQty: 5,
        supplierName: 'Philips India Consumer Care',
        status: 'ACTIVE',
      },
      {
        id: 'batch_mi_pb01',
        productId: 'prod_mi_powerbank',
        batchNumber: 'B-MI-0826-P3',
        mfgDate: todayPlusDays(-90),
        expiryDate: todayPlusDays(1460),
        distributorReturnDeadline: todayPlusDays(30),
        costPrice: 1650,
        mrp: 2199,
        sellingPrice: 1999,
        initialQty: 6,
        currentQty: 4,
        supplierName: 'Xiaomi India Logistics',
        status: 'ACTIVE',
      },
    ];
    this.batches = seedBatches;

    // 5. WADNs / Serialized Unit Tracking
    const seedWadns = [
      // In-stock electronics units
      {
        id: 'wadn_boat_01',
        wadn: 'WADN-IND-2026-BOAT-1001',
        productId: 'prod_boat_earbuds',
        batchId: 'batch_boat_eb01',
        serialNumber: 'SN-BOAT-99210',
        status: 'IN_STOCK',
        warrantyEnd: todayPlusDays(365),
        history: [{ ts: todayPlusDays(-30), event: 'INVENTORY_RECEIVE', detail: 'Received into stock from vendor', actor: 'Supervisor Anil' }],
      },
      {
        id: 'wadn_boat_02',
        wadn: 'WADN-IND-2026-BOAT-1002',
        productId: 'prod_boat_earbuds',
        batchId: 'batch_boat_eb01',
        serialNumber: 'SN-BOAT-99211',
        status: 'IN_STOCK',
        warrantyEnd: todayPlusDays(365),
        history: [{ ts: todayPlusDays(-30), event: 'INVENTORY_RECEIVE', detail: 'Received into stock from vendor', actor: 'Supervisor Anil' }],
      },
      {
        id: 'wadn_boat_03',
        wadn: 'WADN-IND-2026-BOAT-1003',
        productId: 'prod_boat_earbuds',
        batchId: 'batch_boat_eb01',
        serialNumber: 'SN-BOAT-99212',
        status: 'IN_STOCK',
        warrantyEnd: todayPlusDays(365),
        history: [{ ts: todayPlusDays(-30), event: 'INVENTORY_RECEIVE', detail: 'Received into stock from vendor', actor: 'Supervisor Anil' }],
      },
      // Sold units with active warranties & customer link
      {
        id: 'wadn_boat_sold01',
        wadn: 'WADN-IND-2026-BOAT-9001',
        productId: 'prod_boat_earbuds',
        batchId: 'batch_boat_eb01',
        serialNumber: 'SN-BOAT-88101',
        status: 'SOLD',
        warrantyEnd: todayPlusDays(350),
        ownerId: 'cust_01',
        ownerPhone: '+919000000000',
        history: [
          { ts: todayPlusDays(-60), event: 'INVENTORY_RECEIVE', detail: 'Received into stock', actor: 'Supervisor Anil' },
          { ts: todayPlusDays(-15), event: 'SALE_CHECKOUT', detail: 'Sold on Invoice #INV-2026-1001 to Rahul Sharma', actor: 'POS-01 Ramesh' },
        ],
      },
      {
        id: 'wadn_philips_sold01',
        wadn: 'WADN-IND-2026-PHIL-8001',
        productId: 'prod_philips_trimmer',
        batchId: 'batch_phil_tr01',
        serialNumber: 'SN-PHIL-77301',
        status: 'SOLD',
        warrantyEnd: todayPlusDays(710),
        ownerId: 'cust_02',
        ownerPhone: '+919876543210',
        history: [
          { ts: todayPlusDays(-70), event: 'INVENTORY_RECEIVE', detail: 'Received into stock', actor: 'Supervisor Anil' },
          { ts: todayPlusDays(-10), event: 'SALE_CHECKOUT', detail: 'Sold on Invoice #INV-2026-1002 to Priya Sundaram', actor: 'POS-02 Pooja' },
        ],
      },
      {
        id: 'wadn_mi_sold01',
        wadn: 'WADN-IND-2026-MI-7001',
        productId: 'prod_mi_powerbank',
        batchId: 'batch_mi_pb01',
        serialNumber: 'SN-MI-66201',
        status: 'SOLD',
        warrantyEnd: todayPlusDays(340),
        ownerId: 'cust_01',
        ownerPhone: '+919000000000',
        history: [
          { ts: todayPlusDays(-90), event: 'INVENTORY_RECEIVE', detail: 'Received into stock', actor: 'Supervisor Anil' },
          { ts: todayPlusDays(-25), event: 'SALE_CHECKOUT', detail: 'Sold on Invoice #INV-2026-1003 to Rahul Sharma', actor: 'POS-01 Ramesh' },
        ],
      },
      // Units in return & triage inspection pipeline
      {
        id: 'wadn_boat_returned01',
        wadn: 'WADN-IND-2026-BOAT-9099',
        productId: 'prod_boat_earbuds',
        batchId: 'batch_boat_eb01',
        serialNumber: 'SN-BOAT-88199',
        status: 'INSPECTION',
        warrantyEnd: todayPlusDays(355),
        history: [
          { ts: todayPlusDays(-40), event: 'SALE_CHECKOUT', detail: 'Sold to customer', actor: 'POS-01 Ramesh' },
          { ts: todayPlusDays(-2), event: 'RETURN_INTAKE', detail: 'Returned by customer (Issue: right earbud low volume). Awaiting repair triage.', actor: 'Desk Supervisor Sunil' },
        ],
      },
      {
        id: 'wadn_philips_damaged01',
        wadn: 'WADN-IND-2026-PHIL-8099',
        productId: 'prod_philips_trimmer',
        batchId: 'batch_phil_tr01',
        serialNumber: 'SN-PHIL-77399',
        status: 'DAMAGED',
        warrantyEnd: todayPlusDays(700),
        history: [
          { ts: todayPlusDays(-50), event: 'SALE_CHECKOUT', detail: 'Sold to customer', actor: 'POS-02 Pooja' },
          { ts: todayPlusDays(-5), event: 'RETURN_INTAKE', detail: 'Returned with physical cracked casing', actor: 'Desk Supervisor Sunil' },
          { ts: todayPlusDays(-4), event: 'INSPECTION_DAMAGED', detail: 'Classified DAMAGED; scheduled for salvage recovery', actor: 'Manager Vikram' },
        ],
      },
    ];
    this.wadns = seedWadns;

    // 6. Initial Inventory Movements Ledger
    const seedMovements = [
      {
        id: 'mov_01',
        movementNumber: 'MOV-2026-0001',
        timestamp: todayPlusDays(-30),
        productId: 'prod_amul_milk_1l',
        productName: 'Amul Taaza Homogenised Milk 1L',
        batchId: 'batch_amul_mk01',
        batchNumber: 'B-AMUL-0926-A',
        wadn: null,
        qty: 40,
        fromState: 'SUPPLIER_SHIPMENT',
        toState: 'IN_STOCK',
        movementType: 'RECEIVE',
        referenceType: 'PURCHASE_ORDER',
        referenceId: 'PO-2026-0901',
        reason: 'Initial intake from Gujarat Milk Federation',
        performedBy: 'Warehouse Clerk Suresh',
        notes: 'Cold chain temperature verified 4°C',
      },
      {
        id: 'mov_02',
        movementNumber: 'MOV-2026-0002',
        timestamp: todayPlusDays(-20),
        productId: 'prod_boat_earbuds',
        productName: 'boAt Airdopes 141 True Wireless Earbuds',
        batchId: 'batch_boat_eb01',
        batchNumber: 'B-BOAT-0826-W1',
        wadn: 'WADN-IND-2026-BOAT-9001',
        qty: 1,
        fromState: 'IN_STOCK',
        toState: 'SOLD',
        movementType: 'SALE',
        referenceType: 'SALE',
        referenceId: 'sale_1001',
        reason: 'Customer purchase at POS-01',
        performedBy: 'Cashier Ramesh',
        notes: 'Invoice #INV-2026-1001',
      },
      {
        id: 'mov_03',
        movementNumber: 'MOV-2026-0003',
        timestamp: todayPlusDays(-2),
        productId: 'prod_boat_earbuds',
        productName: 'boAt Airdopes 141 True Wireless Earbuds',
        batchId: 'batch_boat_eb01',
        batchNumber: 'B-BOAT-0826-W1',
        wadn: 'WADN-IND-2026-BOAT-9099',
        qty: 1,
        fromState: 'SOLD',
        toState: 'INSPECTION',
        movementType: 'RETURN_INTAKE',
        referenceType: 'RETURN',
        referenceId: 'ret_2001',
        reason: 'Customer return due to low volume in right earbud',
        performedBy: 'Supervisor Sunil',
        notes: 'Held in quarantine zone for technical inspection',
      },
    ];
    this.inventoryMovements = seedMovements;

    // 7. Completed Sales (Immutable Invoices)
    const sale1Id = 'sale_1001';
    const sale2Id = 'sale_1002';
    const sale3Id = 'sale_1003';

    this.sales = [
      {
        id: sale1Id,
        invoiceNumber: 'INV-2026-1001',
        storeId: 'store_aztec_01',
        terminalId: 'term_01',
        cashierId: 'cashier_104',
        cashierName: 'Ramesh K.',
        customerId: 'cust_01',
        customerName: 'Rahul Sharma',
        customerPhone: '+919000000000',
        subtotal: 1610.0,
        discount: 30.0,
        tax: 81.0,
        total: 1661.0,
        totalPaid: 1700.0,
        changeGiven: 30.0,
        changeCreditIssued: 9.0, // Retained ₹9 as Store Change Credit
        changeCreditRedeemed: 0.0,
        status: 'COMPLETED',
        createdAt: todayPlusDays(-15),
      },
      {
        id: sale2Id,
        invoiceNumber: 'INV-2026-1002',
        storeId: 'store_aztec_01',
        terminalId: 'term_02',
        cashierId: 'cashier_108',
        cashierName: 'Pooja V.',
        customerId: 'cust_02',
        customerName: 'Priya Sundaram',
        customerPhone: '+919876543210',
        subtotal: 1836.0,
        discount: 50.0,
        tax: 91.8,
        total: 1877.8,
        totalPaid: 1878.0,
        changeGiven: 0.0,
        changeCreditIssued: 0.2,
        changeCreditRedeemed: 0.0,
        status: 'COMPLETED',
        createdAt: todayPlusDays(-10),
      },
      {
        id: sale3Id,
        invoiceNumber: 'INV-2026-1003',
        storeId: 'store_aztec_01',
        terminalId: 'term_01',
        cashierId: 'cashier_104',
        cashierName: 'Ramesh K.',
        customerId: 'cust_01',
        customerName: 'Rahul Sharma',
        customerPhone: '+919000000000',
        subtotal: 2164.0,
        discount: 64.0,
        tax: 108.2,
        total: 2208.2,
        totalPaid: 2208.2,
        changeGiven: 0.0,
        changeCreditIssued: 0.0,
        changeCreditRedeemed: 9.0, // Redeemed ₹9 change credit from previous sale
        status: 'COMPLETED',
        createdAt: todayPlusDays(-5),
      },
    ];

    // 8. Sale Items
    this.saleItems = [
      {
        id: 'sitem_1001_1',
        saleId: sale1Id,
        productId: 'prod_boat_earbuds',
        batchId: 'batch_boat_eb01',
        wadn: 'WADN-IND-2026-BOAT-9001',
        sku: 'SKU-BOAT-AP141',
        productName: 'boAt Airdopes 141 True Wireless Earbuds',
        brand: 'boAt',
        category: 'Electronics & Audio',
        unitPrice: 1499.0,
        qty: 1,
        discount: 30.0,
        total: 1469.0,
        returnedQty: 0,
        status: 'SOLD',
      },
      {
        id: 'sitem_1001_2',
        saleId: sale1Id,
        productId: 'prod_amul_milk_1l',
        batchId: 'batch_amul_mk01',
        wadn: null,
        sku: 'SKU-AMUL-MLK-1L',
        productName: 'Amul Taaza Homogenised Milk 1L',
        brand: 'Amul',
        category: 'Dairy & Chilled',
        unitPrice: 42.0,
        qty: 2,
        discount: 0.0,
        total: 84.0,
        returnedQty: 0,
        status: 'SOLD',
      },
      {
        id: 'sitem_1001_3',
        saleId: sale1Id,
        productId: 'prod_brit_bread',
        batchId: 'batch_brit_br01',
        wadn: null,
        sku: 'SKU-BRIT-BRD-400',
        productName: 'Britannia 100% Whole Wheat Bread 400g',
        brand: 'Britannia',
        category: 'Bakery',
        unitPrice: 45.0,
        qty: 1,
        discount: 0.0,
        total: 45.0,
        returnedQty: 0,
        status: 'SOLD',
      },
      // Sale 2 items
      {
        id: 'sitem_1002_1',
        saleId: sale2Id,
        productId: 'prod_philips_trimmer',
        batchId: 'batch_phil_tr01',
        wadn: 'WADN-IND-2026-PHIL-8001',
        sku: 'SKU-PHIL-BT1230',
        productName: 'Philips BT1230/15 Cordless Beard Trimmer',
        brand: 'Philips',
        category: 'Personal Appliances',
        unitPrice: 1699.0,
        qty: 1,
        discount: 50.0,
        total: 1649.0,
        returnedQty: 0,
        status: 'SOLD',
      },
      {
        id: 'sitem_1002_2',
        saleId: sale2Id,
        productId: 'prod_amul_paneer_200g',
        batchId: 'batch_amul_pan01',
        wadn: null,
        sku: 'SKU-AMUL-PAN-200',
        productName: 'Amul Fresh Malai Paneer 200g',
        brand: 'Amul',
        category: 'Dairy & Chilled',
        unitPrice: 92.0,
        qty: 1,
        discount: 0.0,
        total: 92.0,
        returnedQty: 0,
        status: 'SOLD',
      },
    ];

    // 9. Multi-tender Split Payments
    this.payments = [
      // Sale 1: Split between Cash ₹700 + UPI ₹1000 = ₹1700
      {
        id: 'pay_1001_1',
        saleId: sale1Id,
        method: 'CASH',
        amount: 700.0,
        status: 'COMPLETED',
        reference: 'CASH-DRAWER-01',
        metadata: { tender: 700, changeGiven: 30, changeCreditIssued: 9 },
        createdAt: todayPlusDays(-15),
      },
      {
        id: 'pay_1001_2',
        saleId: sale1Id,
        method: 'UPI',
        amount: 1000.0,
        status: 'COMPLETED',
        reference: 'UPI/20260913/992817263',
        metadata: { vpa: 'rahul@okhdfcbank', provider: 'HDFC_UPI' },
        createdAt: todayPlusDays(-15),
      },
      // Sale 2: Card
      {
        id: 'pay_1002_1',
        saleId: sale2Id,
        method: 'CARD',
        amount: 1878.0,
        status: 'COMPLETED',
        reference: 'POS-TXN-PINELABS-882192',
        metadata: { cardNetwork: 'VISA', cardLast4: '4129', terminal: 'PINELABS-02' },
        createdAt: todayPlusDays(-10),
      },
      // Sale 3: Split Tender (Change Credit ₹9 + UPI ₹2199.2)
      {
        id: 'pay_1003_1',
        saleId: sale3Id,
        method: 'CHANGE_CREDIT',
        amount: 9.0,
        status: 'COMPLETED',
        reference: 'CREDIT-REDEMPTION-CC-1001',
        metadata: { creditId: 'cc_1001', customerPhone: '+919000000000' },
        createdAt: todayPlusDays(-5),
      },
      {
        id: 'pay_1003_2',
        saleId: sale3Id,
        method: 'UPI',
        amount: 2199.2,
        status: 'COMPLETED',
        reference: 'UPI/20260923/110293847',
        metadata: { vpa: 'rahul@okhdfcbank' },
        createdAt: todayPlusDays(-5),
      },
    ];

    // 10. Change Credits Ledger
    this.changeCredits = [
      {
        id: 'cc_1001',
        creditNumber: 'CC-2026-0001',
        customerPhone: '+919000000000',
        customerName: 'Rahul Sharma',
        storeId: 'store_aztec_01',
        originalSaleId: sale1Id,
        amount: 9.0,
        balance: 0.0,
        type: 'ISSUED_ON_CHANGE',
        status: 'REDEEMED',
        notes: 'Change of ₹9 saved from Sale #INV-2026-1001 (Fully redeemed on INV-2026-1003)',
        createdAt: todayPlusDays(-15),
      },
      {
        id: 'cc_1002',
        creditNumber: 'CC-2026-0002',
        customerPhone: '+919000000000',
        customerName: 'Rahul Sharma',
        storeId: 'store_aztec_01',
        originalSaleId: sale1Id,
        amount: 45.0,
        balance: 45.0,
        type: 'ISSUED_ON_CHANGE',
        status: 'ACTIVE',
        notes: 'Active store credit balance for regular purchases',
        createdAt: todayPlusDays(-8),
      },
      {
        id: 'cc_1003',
        creditNumber: 'CC-2026-0003',
        customerPhone: '+919876543210',
        customerName: 'Priya Sundaram',
        storeId: 'store_aztec_01',
        originalSaleId: sale2Id,
        amount: 18.0,
        balance: 18.0,
        type: 'ISSUED_ON_CHANGE',
        status: 'ACTIVE',
        notes: 'Change saved during cashier transaction at POS-02',
        createdAt: todayPlusDays(-10),
      },
    ];

    // 11. Returns Workflow (First-Class Business Entity)
    const return1Id = 'ret_2001';
    this.returns = [
      {
        id: return1Id,
        returnNumber: 'RET-2026-0101',
        originalSaleId: sale1Id,
        invoiceNumber: 'INV-2026-1001',
        storeId: 'store_aztec_01',
        terminalId: 'term_03',
        customerPhone: '+919000000000',
        customerName: 'Rahul Sharma',
        returnReason: 'Audio output distortion in right earbud',
        totalRefundAmount: 1469.0,
        status: 'INSPECTED',
        managerId: 'mgr_vikram_01',
        managerName: 'Vikram Joshi (Store Manager)',
        createdAt: todayPlusDays(-2),
        completedAt: null,
      },
    ];

    this.returnItems = [
      {
        id: 'ritem_2001_1',
        returnId: return1Id,
        saleItemId: 'sitem_1001_1',
        productId: 'prod_boat_earbuds',
        batchId: 'batch_boat_eb01',
        wadn: 'WADN-IND-2026-BOAT-9099',
        productName: 'boAt Airdopes 141 True Wireless Earbuds',
        sku: 'SKU-BOAT-AP141',
        qty: 1,
        returnUnitPrice: 1469.0,
        refundAmount: 1469.0,
        reason: 'Audio output distortion in right earbud',
        condition: 'DEFECTIVE',
        disposition: 'REPAIR', // Sent to service queue / repair triage rather than automatic restock!
        status: 'INSPECTION_COMPLETED',
      },
    ];

    // 12. Refunds
    this.refunds = [
      {
        id: 'ref_3001',
        refundNumber: 'REF-2026-0001',
        returnId: return1Id,
        saleId: sale1Id,
        invoiceNumber: 'INV-2026-1001',
        customerPhone: '+919000000000',
        method: 'UPI',
        amount: 1469.0,
        status: 'COMPLETED',
        reference: 'UPI/REFUND/20260926/88392019',
        originalTenderBreakdown: { cashRefund: 469.0, upiRefund: 1000.0 },
        createdAt: todayPlusDays(-2),
      },
    ];

    // 13. Audit Log stream
    this.auditLogs = [
      {
        id: 'audit_01',
        timestamp: todayPlusDays(-15),
        entityType: 'SALE',
        entityId: sale1Id,
        event: 'SALE_COMPLETED',
        detail: 'Completed sale #INV-2026-1001 of ₹1,661 with Split Tenders (Cash ₹700 + UPI ₹1000)',
        actor: 'Cashier Ramesh (POS-01)',
        metadata: { invoice: 'INV-2026-1001', total: 1661 },
      },
      {
        id: 'audit_02',
        timestamp: todayPlusDays(-15),
        entityType: 'CHANGE_CREDIT',
        entityId: 'cc_1001',
        event: 'CREDIT_ISSUED',
        detail: 'Saved change ₹9.00 as store change credit for +919000000000',
        actor: 'Cashier Ramesh (POS-01)',
        metadata: { creditNumber: 'CC-2026-0001', amount: 9 },
      },
      {
        id: 'audit_03',
        timestamp: todayPlusDays(-5),
        entityType: 'SALE',
        entityId: sale3Id,
        event: 'CREDIT_REDEEMED',
        detail: 'Redeemed ₹9.00 change credit against Invoice #INV-2026-1003',
        actor: 'Cashier Ramesh (POS-01)',
        metadata: { creditId: 'cc_1001', saleId: sale3Id },
      },
      {
        id: 'audit_04',
        timestamp: todayPlusDays(-2),
        entityType: 'RETURN',
        entityId: return1Id,
        event: 'RETURN_INSPECTED',
        detail: 'Manager Vikram approved return for boAt Earbuds. Disposition set to REPAIR (Quarantined)',
        actor: 'Manager Vikram Joshi',
        metadata: { returnNumber: 'RET-2026-0101', disposition: 'REPAIR' },
      },
      {
        id: 'audit_05',
        timestamp: todayPlusDays(-2),
        entityType: 'REFUND',
        entityId: 'ref_3001',
        event: 'REFUND_PROCESSED',
        detail: 'Processed refund ₹1,469 via UPI to +919000000000 (Ref: UPI/REFUND/20260926/88392019)',
        actor: 'Manager Vikram Joshi',
        metadata: { amount: 1469, method: 'UPI' },
      },
    ];
  }

  // ==========================================
  // QUERY METHODS
  // ==========================================

  getDashboardOverview() {
    const todaySales = this.sales
      .filter(s => s.status === 'COMPLETED' || s.status === 'PARTIALLY_RETURNED')
      .reduce((sum, s) => sum + s.total, 0);

    const totalInventoryValue = this.batches.reduce((sum, b) => sum + (b.currentQty * b.sellingPrice), 0);
    const totalCostValue = this.batches.reduce((sum, b) => sum + (b.currentQty * b.costPrice), 0);

    // Attention calculations
    const attentionItems = [];

    // 1. Imminent Distributor Return Deadlines (<= 3 days)
    this.batches.forEach(b => {
      const prod = this.products.find(p => p.id === b.productId);
      const daysToDistReturn = daysDiffFromNow(b.distributorReturnDeadline);
      if (b.currentQty > 0 && daysToDistReturn <= 3) {
        const recoverable = b.currentQty * b.costPrice;
        attentionItems.push({
          id: `att_dist_${b.id}`,
          type: 'DISTRIBUTOR_RETURN_URGENT',
          severity: daysToDistReturn <= 1 ? 'CRITICAL' : 'HIGH',
          title: `Distributor Return Deadline: ${daysToDistReturn <= 0 ? 'CLOSING TODAY' : `In ${daysToDistReturn} Days`}`,
          description: `${b.currentQty} units of ${prod?.name || b.productId} (${b.batchNumber}) must be returned to ${b.supplierName || 'Distributor'} for 100% credit.`,
          batchId: b.id,
          batchNumber: b.batchNumber,
          productName: prod?.name,
          currentQty: b.currentQty,
          deadline: b.distributorReturnDeadline,
          recoverableValue: recoverable,
          action: 'DISPATCH_VENDOR_RETURN',
        });
      }
    });

    // 2. Near Expiry Risk Items (<= 5 days)
    this.batches.forEach(b => {
      const prod = this.products.find(p => p.id === b.productId);
      const daysToExpiry = daysDiffFromNow(b.expiryDate);
      if (b.currentQty > 0 && daysToExpiry <= 5) {
        const atRisk = b.currentQty * b.sellingPrice;
        attentionItems.push({
          id: `att_exp_${b.id}`,
          type: 'NEAR_EXPIRY_RISK',
          severity: daysToExpiry <= 2 ? 'CRITICAL' : 'MEDIUM',
          title: `Near Expiry Alert: Expires in ${daysToExpiry <= 0 ? 'EXPIRED' : `${daysToExpiry} Days`}`,
          description: `${b.currentQty} units of ${prod?.name || b.productId} (${b.batchNumber}) need dynamic markdown or salvage dispatch.`,
          batchId: b.id,
          batchNumber: b.batchNumber,
          productName: prod?.name,
          currentQty: b.currentQty,
          expiryDate: b.expiryDate,
          atRiskValue: atRisk,
          action: 'APPLY_DYNAMIC_MARKDOWN',
        });
      }
    });

    // 3. Pending Returns & Inspections
    const pendingReturns = this.returns.filter(r => r.status === 'REQUESTED' || r.status === 'INSPECTED');
    pendingReturns.forEach(r => {
      attentionItems.push({
        id: `att_ret_${r.id}`,
        type: 'RETURN_DISPOSITION_PENDING',
        severity: 'MEDIUM',
        title: `Return Triage Pending: #${r.returnNumber}`,
        description: `Customer ${r.customerName} (${r.customerPhone}) returned items against Invoice #${r.invoiceNumber}. Requires manager disposition.`,
        returnId: r.id,
        returnNumber: r.returnNumber,
        refundAmount: r.totalRefundAmount,
        action: 'INSPECT_AND_DISPOSE',
      });
    });

    // Recoverable salvage value total
    const totalRecoverableSalvage = attentionItems.reduce((sum, item) => sum + (item.recoverableValue || item.atRiskValue || 0), 0);

    return {
      kpis: {
        todaySalesINR: Math.round(todaySales),
        totalInventoryValueINR: Math.round(totalInventoryValue),
        totalCostValueINR: Math.round(totalCostValue),
        recoverableSalvageValueINR: Math.round(totalRecoverableSalvage),
        activeSkusCount: this.products.length,
        activeBatchesCount: this.batches.filter(b => b.currentQty > 0).length,
        openReturnsCount: pendingReturns.length,
        activeTerminalsCount: this.terminals.filter(t => t.status === 'ONLINE').length,
      },
      attentionItems,
      recentAudits: this.auditLogs.slice(-6).reverse(),
      activeTerminals: this.terminals,
    };
  }

  getProductsWithStock() {
    return this.products.map(prod => {
      const prodBatches = this.batches.filter(b => b.productId === prod.id);
      const totalStock = prodBatches.reduce((sum, b) => sum + b.currentQty, 0);
      const nearestExpiry = prodBatches
        .filter(b => b.currentQty > 0 && b.expiryDate)
        .map(b => b.expiryDate)
        .sort()[0] || null;

      const prodWadns = this.wadns.filter(w => w.productId === prod.id);

      return {
        ...prod,
        totalStock,
        nearestExpiry,
        batches: prodBatches,
        wadns: prodWadns,
      };
    });
  }

  getInventoryTree() {
    return this.products.map(product => {
      const batches = this.batches.filter(b => b.productId === product.id).map(batch => {
        const units = this.wadns.filter(w => w.batchId === batch.id);
        const daysToExpiry = daysDiffFromNow(batch.expiryDate);
        const daysToDistReturn = daysDiffFromNow(batch.distributorReturnDeadline);
        return {
          ...batch,
          daysToExpiry,
          daysToDistReturn,
          units,
        };
      });

      const totalQty = batches.reduce((sum, b) => sum + b.currentQty, 0);
      return {
        product,
        totalQty,
        batches,
      };
    });
  }

  getSalesList(filters = {}) {
    let list = this.sales.slice().reverse();
    if (filters.customerPhone) {
      list = list.filter(s => s.customerPhone.includes(filters.customerPhone));
    }
    if (filters.invoiceNumber) {
      list = list.filter(s => s.invoiceNumber.toLowerCase().includes(filters.invoiceNumber.toLowerCase()));
    }
    return list.map(s => {
      const items = this.saleItems.filter(item => item.saleId === s.id);
      const salePayments = this.payments.filter(p => p.saleId === s.id);
      const saleReturns = this.returns.filter(r => r.originalSaleId === s.id);
      return {
        ...s,
        items,
        payments: salePayments,
        returns: saleReturns,
      };
    });
  }

  getSaleDetail(saleId) {
    const sale = this.sales.find(s => s.id === saleId || s.invoiceNumber === saleId);
    if (!sale) return null;
    const items = this.saleItems.filter(item => item.saleId === sale.id);
    const salePayments = this.payments.filter(p => p.saleId === sale.id);
    const saleReturns = this.returns.filter(r => r.originalSaleId === sale.id);
    const movements = this.inventoryMovements.filter(m => m.referenceId === sale.id);
    return {
      ...sale,
      items,
      payments: salePayments,
      returns: saleReturns,
      movements,
    };
  }

  getCustomerCredits(phone) {
    const records = this.changeCredits.filter(c => c.customerPhone === phone);
    const activeBalance = records.filter(c => c.status === 'ACTIVE').reduce((sum, c) => sum + c.balance, 0);
    return {
      customerPhone: phone,
      availableBalance: activeBalance,
      history: records.slice().reverse(),
    };
  }

  // ==========================================
  // POS SCAN-FIRST CHECKOUT ENGINE
  // ==========================================

  processPosCheckout({
    terminalId,
    cashierName = 'Terminal Cashier',
    customerPhone = '+919000000000',
    customerName = 'Walk-in Customer',
    items, // [{ productId, batchId, wadn, qty, unitPrice, discount }]
    payments, // [{ method: 'CASH'|'UPI'|'CARD'|'CHANGE_CREDIT', amount, reference }]
    changeCreditToIssue = 0,
    storeId = 'store_aztec_01',
  }) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('POS Checkout requires at least one cart item');
    }
    if (!Array.isArray(payments) || payments.length === 0) {
      throw new Error('POS Checkout requires at least one payment tender');
    }

    const saleId = uid('sale');
    const invoiceNumber = 'INV-2026-' + (1000 + this.sales.length + 1);

    // Calculate subtotal, discounts, tax
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    const createdSaleItems = [];
    const movementsCreated = [];

    // Verify and decrement stock across Batches / WADNs
    for (const item of items) {
      const product = this.products.find(p => p.id === item.productId || p.sku === item.sku || p.barcode === item.barcode);
      if (!product) {
        throw new Error(`Product not found: ${item.productId || item.productName || item.sku}`);
      }

      // Find appropriate batch
      let batch = null;
      if (item.batchId) {
        batch = this.batches.find(b => b.id === item.batchId);
      } else {
        // Auto-select nearest-expiry active batch (FEFO - First Expire First Out)
        batch = this.batches
          .filter(b => b.productId === product.id && b.currentQty >= (item.qty || 1))
          .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))[0];
        if (!batch) {
          batch = this.batches.filter(b => b.productId === product.id)[0];
        }
      }

      const qty = item.qty || 1;
      const unitPrice = item.unitPrice !== undefined ? Number(item.unitPrice) : (batch?.sellingPrice || product.basePrice);
      const discount = item.discount ? Number(item.discount) : 0;
      const itemSubtotal = (unitPrice * qty) - discount;
      const itemTax = (itemSubtotal * (product.taxRate || 0)) / 100;

      subtotal += (unitPrice * qty);
      totalDiscount += discount;
      totalTax += itemTax;

      // Decrement Batch Quantity
      if (batch) {
        batch.currentQty = Math.max(0, batch.currentQty - qty);
      }

      // WADN serialization handling
      let matchedWadn = item.wadn || null;
      if (product.isSerialized) {
        let wadnRecord = null;
        if (matchedWadn) {
          wadnRecord = this.wadns.find(w => w.wadn === matchedWadn);
        } else {
          wadnRecord = this.wadns.find(w => w.productId === product.id && w.status === 'IN_STOCK');
          if (wadnRecord) matchedWadn = wadnRecord.wadn;
        }

        if (wadnRecord) {
          wadnRecord.status = 'SOLD';
          wadnRecord.ownerPhone = customerPhone;
          wadnRecord.ownerId = customerPhone;
          wadnRecord.history.push({
            ts: new Date().toISOString(),
            event: 'SALE_CHECKOUT',
            detail: `Sold on Invoice #${invoiceNumber} to ${customerName} (${customerPhone})`,
            actor: cashierName,
          });
        }
      }

      // Record Sale Item
      const saleItemId = uid('sitem');
      const saleItem = {
        id: saleItemId,
        saleId,
        productId: product.id,
        batchId: batch?.id || null,
        wadn: matchedWadn,
        sku: product.sku,
        productName: product.name,
        brand: product.brand,
        category: product.category,
        unitPrice,
        qty,
        discount,
        total: itemSubtotal + itemTax,
        returnedQty: 0,
        status: 'SOLD',
      };
      this.saleItems.push(saleItem);
      createdSaleItems.push(saleItem);

      // Record Immutable Inventory Movement
      const movement = {
        id: uid('mov'),
        movementNumber: 'MOV-2026-' + (this.inventoryMovements.length + 1).toString().padStart(4, '0'),
        timestamp: new Date().toISOString(),
        productId: product.id,
        productName: product.name,
        batchId: batch?.id || null,
        batchNumber: batch?.batchNumber || 'N/A',
        wadn: matchedWadn,
        qty,
        fromState: 'IN_STOCK',
        toState: 'SOLD',
        movementType: 'SALE',
        referenceType: 'SALE',
        referenceId: saleId,
        reason: `POS sale checkout to ${customerName}`,
        performedBy: cashierName,
        notes: `Invoice #${invoiceNumber} at ${terminalId}`,
      };
      this.inventoryMovements.push(movement);
      movementsCreated.push(movement);
    }

    const grandTotal = Math.round((subtotal - totalDiscount + totalTax) * 100) / 100;
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Check Change Credit Redemptions
    let changeCreditRedeemed = 0;
    payments.forEach(p => {
      if (p.method === 'CHANGE_CREDIT') {
        const amt = Number(p.amount);
        changeCreditRedeemed += amt;
        // Deduct from customer's active credit records
        let remainingToDeduct = amt;
        const custCredits = this.changeCredits.filter(c => c.customerPhone === customerPhone && c.status === 'ACTIVE');
        for (const c of custCredits) {
          if (remainingToDeduct <= 0) break;
          if (c.balance <= remainingToDeduct) {
            remainingToDeduct -= c.balance;
            c.balance = 0;
            c.status = 'REDEEMED';
          } else {
            c.balance -= remainingToDeduct;
            c.status = 'PARTIALLY_REDEEMED';
            remainingToDeduct = 0;
          }
        }
      }
    });

    // Record Payments
    const createdPayments = [];
    payments.forEach(p => {
      const paymentRecord = {
        id: uid('pay'),
        saleId,
        method: p.method,
        amount: Number(p.amount),
        status: 'COMPLETED',
        reference: p.reference || `${p.method}-TENDER-${Date.now().toString(36).toUpperCase()}`,
        metadata: p.metadata || {},
        createdAt: new Date().toISOString(),
      };
      this.payments.push(paymentRecord);
      createdPayments.push(paymentRecord);
    });

    // Issue Store Change Credit if applicable
    let changeCreditIssued = 0;
    if (changeCreditToIssue > 0) {
      changeCreditIssued = Number(changeCreditToIssue);
      const creditRecord = {
        id: uid('cc'),
        creditNumber: 'CC-2026-' + (this.changeCredits.length + 1).toString().padStart(4, '0'),
        customerPhone,
        customerName,
        storeId,
        originalSaleId: saleId,
        amount: changeCreditIssued,
        balance: changeCreditIssued,
        type: 'ISSUED_ON_CHANGE',
        status: 'ACTIVE',
        notes: `Retained change of ₹${changeCreditIssued} on Invoice #${invoiceNumber}`,
        createdAt: new Date().toISOString(),
      };
      this.changeCredits.push(creditRecord);

      // Update customer record
      let cust = this.customers.find(c => c.phone === customerPhone);
      if (cust) {
        cust.availableChangeCredit = (cust.availableChangeCredit || 0) + changeCreditIssued;
      } else {
        this.customers.push({
          id: uid('cust'),
          name: customerName,
          phone: customerPhone,
          availableChangeCredit: changeCreditIssued,
          createdAt: new Date().toISOString(),
        });
      }
    }

    const changeGiven = Math.max(0, totalPaid - grandTotal - changeCreditIssued);

    // Create Immutable Sale
    const saleRecord = {
      id: saleId,
      invoiceNumber,
      storeId,
      terminalId,
      cashierId: uid('csh'),
      cashierName,
      customerId: customerPhone,
      customerName,
      customerPhone,
      subtotal,
      discount: totalDiscount,
      tax: totalTax,
      total: grandTotal,
      totalPaid,
      changeGiven,
      changeCreditIssued,
      changeCreditRedeemed,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    };
    this.sales.push(saleRecord);

    // Record Audit
    this.auditLogs.push({
      id: uid('audit'),
      timestamp: new Date().toISOString(),
      entityType: 'SALE',
      entityId: saleId,
      event: 'SALE_COMPLETED',
      detail: `Completed sale #${invoiceNumber} for ₹${grandTotal} with ${createdPayments.length} tender(s)`,
      actor: `${cashierName} (${terminalId})`,
      metadata: { invoiceNumber, grandTotal, tenders: createdPayments.map(p => `${p.method}: ₹${p.amount}`).join(', ') },
    });

    return {
      sale: saleRecord,
      items: createdSaleItems,
      payments: createdPayments,
      movements: movementsCreated,
      changeGiven,
      changeCreditIssued,
    };
  }

  // ==========================================
  // RETURNS & REFUNDS MULTI-STAGE ENGINE
  // ==========================================

  createReturnRequest({
    originalSaleId,
    customerPhone,
    customerName,
    reason,
    managerName = 'Store Manager',
    items, // [{ saleItemId, returnQty, reason, condition: 'UNOPENED'|'DAMAGED'|'DEFECTIVE'|'EXPIRED' }]
    terminalId = 'POS-01',
    storeId = 'store_aztec_01',
  }) {
    const sale = this.sales.find(s => s.id === originalSaleId || s.invoiceNumber === originalSaleId);
    if (!sale) {
      throw new Error(`Original sale transaction not found: ${originalSaleId}`);
    }

    const returnId = uid('ret');
    const returnNumber = 'RET-2026-' + (this.returns.length + 101);

    let totalRefundAmount = 0;
    const createdReturnItems = [];
    const movementsCreated = [];

    for (const item of items) {
      const saleItem = this.saleItems.find(si => si.id === item.saleItemId);
      if (!saleItem) {
        throw new Error(`Sale item not found: ${item.saleItemId}`);
      }

      const returnQty = item.returnQty || 1;
      const returnUnitPrice = saleItem.unitPrice;
      const refundAmount = (returnUnitPrice * returnQty) - (saleItem.discount ? (saleItem.discount / saleItem.qty) * returnQty : 0);
      totalRefundAmount += refundAmount;

      saleItem.returnedQty = (saleItem.returnedQty || 0) + returnQty;
      saleItem.status = saleItem.returnedQty >= saleItem.qty ? 'RETURNED' : 'PARTIALLY_RETURNED';

      // Determine initial triage disposition based on condition
      let initialDisposition = 'INSPECTION_PENDING';
      let toMovementState = 'INSPECTION';

      if (item.condition === 'UNOPENED') {
        initialDisposition = 'RESTOCK';
        toMovementState = 'IN_STOCK';
        // If unopened, restock batch immediately
        const batch = this.batches.find(b => b.id === saleItem.batchId);
        if (batch) batch.currentQty += returnQty;
      } else if (item.condition === 'DAMAGED') {
        initialDisposition = 'DAMAGED';
        toMovementState = 'DAMAGED';
      } else if (item.condition === 'DEFECTIVE') {
        initialDisposition = 'REPAIR';
        toMovementState = 'REPAIR';
      } else if (item.condition === 'EXPIRED') {
        initialDisposition = 'SALVAGE';
        toMovementState = 'SALVAGE';
      }

      // Update WADN if serialized
      if (saleItem.wadn) {
        const wadnRecord = this.wadns.find(w => w.wadn === saleItem.wadn);
        if (wadnRecord) {
          wadnRecord.status = toMovementState;
          wadnRecord.history.push({
            ts: new Date().toISOString(),
            event: 'RETURN_INTAKE',
            detail: `Returned against Return #${returnNumber}. Condition: ${item.condition}. Disposition: ${initialDisposition}`,
            actor: managerName,
          });
        }
      }

      const rItem = {
        id: uid('ritem'),
        returnId,
        saleItemId: saleItem.id,
        productId: saleItem.productId,
        batchId: saleItem.batchId,
        wadn: saleItem.wadn,
        productName: saleItem.productName,
        sku: saleItem.sku,
        qty: returnQty,
        returnUnitPrice,
        refundAmount,
        reason: item.reason || reason,
        condition: item.condition || 'UNOPENED',
        disposition: initialDisposition,
        status: 'INSPECTION_COMPLETED',
      };
      this.returnItems.push(rItem);
      createdReturnItems.push(rItem);

      // Immutable Inventory Movement for Return
      const movement = {
        id: uid('mov'),
        movementNumber: 'MOV-2026-' + (this.inventoryMovements.length + 1).toString().padStart(4, '0'),
        timestamp: new Date().toISOString(),
        productId: saleItem.productId,
        productName: saleItem.productName,
        batchId: saleItem.batchId,
        batchNumber: this.batches.find(b => b.id === saleItem.batchId)?.batchNumber || 'N/A',
        wadn: saleItem.wadn,
        qty: returnQty,
        fromState: 'SOLD',
        toState: toMovementState,
        movementType: 'RETURN_INTAKE',
        referenceType: 'RETURN',
        referenceId: returnId,
        reason: `Customer return: ${item.reason || reason}`,
        performedBy: managerName,
        notes: `Condition: ${item.condition}. Return #${returnNumber}`,
      };
      this.inventoryMovements.push(movement);
      movementsCreated.push(movement);
    }

    // Update original sale status
    const allSaleItems = this.saleItems.filter(si => si.saleId === sale.id);
    const allReturned = allSaleItems.every(si => si.returnedQty >= si.qty);
    sale.status = allReturned ? 'FULLY_RETURNED' : 'PARTIALLY_RETURNED';

    const returnRecord = {
      id: returnId,
      returnNumber,
      originalSaleId: sale.id,
      invoiceNumber: sale.invoiceNumber,
      storeId,
      terminalId,
      customerPhone: customerPhone || sale.customerPhone,
      customerName: customerName || sale.customerName,
      returnReason: reason,
      totalRefundAmount,
      status: 'APPROVED',
      managerId: uid('mgr'),
      managerName,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
    this.returns.push(returnRecord);

    // Calculate Split Refund Recommendation based on original tenders
    const originalPayments = this.payments.filter(p => p.saleId === sale.id);
    const refundBreakdown = {};
    let remainingRefund = totalRefundAmount;

    originalPayments.forEach(op => {
      if (remainingRefund <= 0) return;
      const refundFromThisMethod = Math.min(op.amount, remainingRefund);
      refundBreakdown[op.method] = (refundBreakdown[op.method] || 0) + refundFromThisMethod;
      remainingRefund -= refundFromThisMethod;
    });

    // Create Refund Record
    const refundRecord = {
      id: uid('ref'),
      refundNumber: 'REF-2026-' + (this.refunds.length + 1).toString().padStart(4, '0'),
      returnId,
      saleId: sale.id,
      invoiceNumber: sale.invoiceNumber,
      customerPhone: returnRecord.customerPhone,
      method: Object.keys(refundBreakdown)[0] || 'CASH',
      amount: totalRefundAmount,
      status: 'COMPLETED',
      reference: `REFUND-${Date.now().toString(36).toUpperCase()}`,
      originalTenderBreakdown: refundBreakdown,
      createdAt: new Date().toISOString(),
    };
    this.refunds.push(refundRecord);

    // Audit Log
    this.auditLogs.push({
      id: uid('audit'),
      timestamp: new Date().toISOString(),
      entityType: 'RETURN',
      entityId: returnId,
      event: 'RETURN_APPROVED_AND_REFUNDED',
      detail: `Approved return #${returnNumber} against Invoice #${sale.invoiceNumber} for ₹${totalRefundAmount}. Refund issued via ${refundRecord.method}`,
      actor: managerName,
      metadata: { returnNumber, refundAmount: totalRefundAmount, refundId: refundRecord.id },
    });

    return {
      returnRecord,
      returnItems: createdReturnItems,
      refundRecord,
      movements: movementsCreated,
    };
  }

  // Triage & Change Disposition of Returned Item
  updateItemDisposition(returnItemId, newDisposition, managerName = 'Manager') {
    const rItem = this.returnItems.find(ri => ri.id === returnItemId);
    if (!rItem) throw new Error('Return item not found');

    const oldDisposition = rItem.disposition;
    rItem.disposition = newDisposition;

    let targetState = 'IN_STOCK';
    if (newDisposition === 'RESTOCK') targetState = 'IN_STOCK';
    else if (newDisposition === 'REPAIR') targetState = 'REPAIR';
    else if (newDisposition === 'DAMAGED') targetState = 'DAMAGED';
    else if (newDisposition === 'QUARANTINE') targetState = 'QUARANTINE';
    else if (newDisposition === 'SALVAGE') targetState = 'SALVAGE';
    else if (newDisposition === 'DISPOSAL') targetState = 'DISPOSED';

    if (newDisposition === 'RESTOCK' && oldDisposition !== 'RESTOCK') {
      const batch = this.batches.find(b => b.id === rItem.batchId);
      if (batch) batch.currentQty += rItem.qty;
    }

    if (rItem.wadn) {
      const wadnRecord = this.wadns.find(w => w.wadn === rItem.wadn);
      if (wadnRecord) {
        wadnRecord.status = targetState;
        wadnRecord.history.push({
          ts: new Date().toISOString(),
          event: `DISPOSITION_${newDisposition}`,
          detail: `Disposition changed from ${oldDisposition} to ${newDisposition}`,
          actor: managerName,
        });
      }
    }

    const movement = {
      id: uid('mov'),
      movementNumber: 'MOV-2026-' + (this.inventoryMovements.length + 1).toString().padStart(4, '0'),
      timestamp: new Date().toISOString(),
      productId: rItem.productId,
      productName: rItem.productName,
      batchId: rItem.batchId,
      batchNumber: this.batches.find(b => b.id === rItem.batchId)?.batchNumber || 'N/A',
      wadn: rItem.wadn,
      qty: rItem.qty,
      fromState: 'RETURNED',
      toState: targetState,
      movementType: `INSPECTION_${newDisposition}`,
      referenceType: 'DISPOSITION',
      referenceId: rItem.returnId,
      reason: `Manager disposition update to ${newDisposition}`,
      performedBy: managerName,
      notes: `Item condition was ${rItem.condition}`,
    };
    this.inventoryMovements.push(movement);

    this.auditLogs.push({
      id: uid('audit'),
      timestamp: new Date().toISOString(),
      entityType: 'INVENTORY',
      entityId: rItem.id,
      event: 'ITEM_DISPOSITION_UPDATED',
      detail: `Disposition for ${rItem.productName} updated to ${newDisposition} (${targetState})`,
      actor: managerName,
      metadata: { returnItemId, oldDisposition, newDisposition },
    });

    return { rItem, movement };
  }

  // Stock Adjustments with Full Movement Audit Trail
  adjustBatchStock({ batchId, newQty, reason, managerName = 'Inventory Manager' }) {
    const batch = this.batches.find(b => b.id === batchId);
    if (!batch) throw new Error('Batch not found');

    const oldQty = batch.currentQty;
    const diff = Number(newQty) - oldQty;
    batch.currentQty = Number(newQty);

    const prod = this.products.find(p => p.id === batch.productId);

    const movement = {
      id: uid('mov'),
      movementNumber: 'MOV-2026-' + (this.inventoryMovements.length + 1).toString().padStart(4, '0'),
      timestamp: new Date().toISOString(),
      productId: batch.productId,
      productName: prod?.name || batch.productId,
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      wadn: null,
      qty: Math.abs(diff),
      fromState: diff > 0 ? 'ADJUSTMENT_IN' : 'IN_STOCK',
      toState: diff > 0 ? 'IN_STOCK' : 'ADJUSTMENT_OUT',
      movementType: 'ADJUSTMENT',
      referenceType: 'MANUAL_ADJUSTMENT',
      referenceId: batch.id,
      reason: reason || 'Physical stock reconciliation discrepancy',
      performedBy: managerName,
      notes: `Quantity changed from ${oldQty} to ${newQty} (${diff >= 0 ? `+${diff}` : diff})`,
    };
    this.inventoryMovements.push(movement);

    this.auditLogs.push({
      id: uid('audit'),
      timestamp: new Date().toISOString(),
      entityType: 'INVENTORY_ADJUSTMENT',
      entityId: batch.id,
      event: 'STOCK_ADJUSTED',
      detail: `Adjusted stock for ${prod?.name} (${batch.batchNumber}) from ${oldQty} to ${newQty}. Reason: ${reason}`,
      actor: managerName,
      metadata: { batchId, oldQty, newQty, diff },
    });

    return { batch, movement };
  }

  // Terminal Management
  verifyTerminalPin(terminalCode, pin) {
    const term = this.terminals.find(t => t.terminalCode === terminalCode || t.id === terminalCode);
    if (!term) return { authorized: false, error: 'Terminal not registered' };
    if (term.pin === pin || term.managerPin === pin) {
      term.lastActive = new Date().toISOString();
      term.status = 'ONLINE';
      return {
        authorized: true,
        terminal: term,
        isManager: term.managerPin === pin,
      };
    }
    return { authorized: false, error: 'Invalid terminal authorization PIN' };
  }

  createOrUpdateTerminal(terminalData) {
    let term = this.terminals.find(t => t.id === terminalData.id || t.terminalCode === terminalData.terminalCode);
    if (term) {
      Object.assign(term, terminalData, { lastActive: new Date().toISOString() });
    } else {
      term = {
        id: uid('term'),
        storeId: terminalData.storeId || 'store_aztec_01',
        terminalCode: terminalData.terminalCode || `POS-0${this.terminals.length + 1}`,
        terminalName: terminalData.terminalName || 'Cashier Counter',
        counterLocation: terminalData.counterLocation || 'Main Floor',
        pin: terminalData.pin || '1234',
        managerPin: terminalData.managerPin || '9999',
        status: 'ONLINE',
        activeCashier: terminalData.activeCashier || 'Authorized Cashier',
        allowedOperations: ['SCAN', 'CHECKOUT', 'SPLIT_PAYMENT', 'ISSUE_CREDIT', 'REDEEM_CREDIT', 'RETURNS'],
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      this.terminals.push(term);
    }
    return term;
  }
}

const averoStore = new AveroStore();

module.exports = averoStore;
module.exports.AveroStore = AveroStore;
module.exports.uid = uid;
module.exports.todayPlusDays = todayPlusDays;
module.exports.daysDiffFromNow = daysDiffFromNow;
