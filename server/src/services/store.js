/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} wadn
 * @property {string} name
 * @property {string} category - 'consumables' | 'pharma' | 'electronics'
 * @property {string} brand
 * @property {string} batch
 * @property {number} quantity
 * @property {string} purchaseDate - ISO date
 * @property {string} expiryDate - ISO date
 * @property {string} [warrantyEnd] - ISO date
 * @property {number} purchasePrice - INR
 * @property {number} sellingPrice - INR
 * @property {string} retailerId
 * @property {string} ownerId
 * @property {string} status - 'in-stock' | 'low-stock' | 'expiring' | 'returnable' | 'expired' | 'sold'
 * @property {string} [sku]
 * @property {string} [returnDeadline] - ISO date
 *
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} phone
 * @property {string} type - 'consumer' | 'retailer'
 *
 * @typedef {Object} Retailer
 * @property {string} id
 * @property {string} name
 * @property {string} location
 *
 * @typedef {Object} TransactionItem
 * @property {string} wadn
 * @property {string} name
 * @property {number} price
 * @property {number} qty
 *
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {string} retailerId
 * @property {string} customerPhone
 * @property {TransactionItem[]} items
 * @property {number} subtotal
 * @property {number} discount
 * @property {number} total
 * @property {number} totalPaid
 * @property {number} changeGiven
 * @property {number} changeCreditAmount
 * @property {string} date - ISO date
 *
 * @typedef {Object} ServiceTicketHistory
 * @property {string} ts - ISO date
 * @property {string} event
 *
 * @typedef {Object} ServiceTicket
 * @property {string} id
 * @property {string} wadn
 * @property {string} productName
 * @property {string} customerId
 * @property {string} customerPhone
 * @property {string} retailerId
 * @property {string} issue
 * @property {string} status - 'open' | 'accepted' | 'in-progress' | 'closed'
 * @property {string} createdAt - ISO date
 * @property {boolean} warrantyActive
 * @property {string} [purchaseRecord]
 * @property {string} [invoiceNo]
 * @property {ServiceTicketHistory[]} history
 *
 * @typedef {Object} ChangeCredit
 * @property {string} id
 * @property {string} customerPhone
 * @property {number} amount
 * @property {string} status - 'active' | 'redeemed'
 * @property {string} createdAt - ISO date
 * @property {string} transactionId
 *
 * @typedef {Object} MarketplaceListing
 * @property {string} id
 * @property {string} wadn
 * @property {string} productName
 * @property {string} category
 * @property {number} price
 * @property {string} expiry - ISO date
 * @property {number} distanceKm
 * @property {string} offeredByPhone
 * @property {string} offeredByName
 * @property {string} status - 'available' | 'claimed' | 'offered'
 * @property {string} [claimedByPhone]
 * @property {string} createdAt - ISO date
 *
 * @typedef {Object} ActivityLog
 * @property {string} id
 * @property {string} entityId
 * @property {string} entityType
 * @property {string} event
 * @property {string} [detail]
 * @property {string} ts - ISO date
 * @property {string} actorPhone
 */

function uid() {
  return Date.now().toString(36) + Math.random().toString(16).slice(2, 10);
}

function todayPlusDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

function daysFromNow(isoDate) {
  const target = new Date(isoDate);
  const now = new Date();
  target.setHours(12, 0, 0, 0);
  now.setHours(12, 0, 0, 0);
  const ms = target.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

const TABLES = [
  'products',
  'users',
  'retailers',
  'transactions',
  'serviceTickets',
  'changeCredits',
  'marketplaceListings',
  'activityLogs',
];

class Store {
  constructor() {
    this.products = [];
    this.users = [];
    this.retailers = [];
    this.transactions = [];
    this.serviceTickets = [];
    this.changeCredits = [];
    this.marketplaceListings = [];
    this.activityLogs = [];
    this._seeded = false;
  }

  async seed() {
    if (this._seeded) return;
    this._seeded = true;

    const consumer = {
      id: 'demo-consumer-1',
      name: 'Demo Customer',
      phone: '+919000000000',
      type: 'consumer',
    };
    const retailerUser = {
      id: 'demo-retailer-1',
      name: 'Avero Provisions',
      phone: '+919876543210',
      type: 'retailer',
    };
    this.users.push(consumer, retailerUser);

    const retailer = {
      id: 'demo-retailer-1',
      name: 'Avero Provisions',
      location: 'Bengaluru, Indiranagar',
    };
    this.retailers.push(retailer);

    const consumerBase = {
      retailerId: retailer.id,
      ownerId: consumer.id,
      purchaseDate: todayPlusDays(-5),
      status: 'in-stock',
    };

    const consumerProducts = [
      {
        wadn: 'WADN-IND-2026-A1B2C3D4', name: 'Amul Taaza Milk 1L', category: 'consumables', brand: 'Amul',
        batch: 'MILK-0926-01', quantity: 2, purchasePrice: 42, sellingPrice: 42,
        expiryDate: todayPlusDays(1),
      },
      {
        wadn: 'WADN-IND-2026-E5F6G7H8', name: 'Britannia Bread', category: 'consumables', brand: 'Britannia',
        batch: 'BRD-0925-02', quantity: 1, purchasePrice: 45, sellingPrice: 45,
        expiryDate: todayPlusDays(2),
      },
      {
        wadn: 'WADN-IND-2026-I9J0K1L2', name: 'Kellogg\'s Corn Flakes', category: 'consumables', brand: 'Kellogg\'s',
        batch: 'KF-0824-11', quantity: 1, purchasePrice: 155, sellingPrice: 165,
        expiryDate: todayPlusDays(10),
      },
      {
        wadn: 'WADN-IND-2026-M3N4O5P6', name: 'Tata Salt', category: 'consumables', brand: 'Tata',
        batch: 'SALT-0726-05', quantity: 1, purchasePrice: 28, sellingPrice: 30,
        expiryDate: todayPlusDays(120),
      },
      {
        wadn: 'WADN-IND-2026-Q7R8S9T0', name: 'Maggi Noodles', category: 'consumables', brand: 'Maggi',
        batch: 'MAG-0910-08', quantity: 4, purchasePrice: 14, sellingPrice: 16,
        expiryDate: todayPlusDays(60),
      },
      {
        wadn: 'WADN-IND-2026-U1V2W3X4', name: 'Dettol Soap', category: 'consumables', brand: 'Dettol',
        batch: 'DET-0615-12', quantity: 3, purchasePrice: 38, sellingPrice: 42,
        expiryDate: todayPlusDays(200),
      },
      {
        wadn: 'WADN-IND-2026-Y5Z6A7B8', name: 'Fresh Tomatoes 500g', category: 'consumables', brand: 'Local',
        batch: 'TOM-0926-F1', quantity: 2, purchasePrice: 30, sellingPrice: 35,
        expiryDate: todayPlusDays(3),
      },
      {
        wadn: 'WADN-IND-2026-C9D0E1F2', name: 'Onion 1kg', category: 'consumables', brand: 'Local',
        batch: 'ONI-0924-F2', quantity: 1, purchasePrice: 45, sellingPrice: 50,
        expiryDate: todayPlusDays(18),
      },
      {
        wadn: 'WADN-IND-2026-G3H4I5J6', name: 'Potato 2kg', category: 'consumables', brand: 'Local',
        batch: 'POT-0920-F3', quantity: 1, purchasePrice: 55, sellingPrice: 60,
        expiryDate: todayPlusDays(25),
      },
      {
        wadn: 'WADN-IND-2026-K7L8M9N0', name: 'Amul Paneer 200g', category: 'consumables', brand: 'Amul',
        batch: 'PNR-0925-03', quantity: 1, purchasePrice: 85, sellingPrice: 92,
        expiryDate: todayPlusDays(5),
      },
      {
        wadn: 'WADN-IND-2026-O1P2Q3R4', name: 'Amul Curd 500g', category: 'consumables', brand: 'Amul',
        batch: 'CRD-0926-04', quantity: 2, purchasePrice: 48, sellingPrice: 52,
        expiryDate: todayPlusDays(4),
      },
      {
        wadn: 'WADN-IND-2026-S5T6U7V8', name: 'India Gate Basmati Rice 5kg', category: 'consumables', brand: 'India Gate',
        batch: 'RICE-0526-15', quantity: 1, purchasePrice: 650, sellingPrice: 699,
        expiryDate: todayPlusDays(180),
      },
      {
        wadn: 'WADN-IND-2026-W9X0Y1Z2', name: 'Aashirvaad Wheat Flour 5kg', category: 'consumables', brand: 'Aashirvaad',
        batch: 'ATA-0426-22', quantity: 1, purchasePrice: 300, sellingPrice: 325,
        expiryDate: todayPlusDays(240),
      },
      {
        wadn: 'WADN-IND-2026-A3B4C5D6', name: 'Parle-G Biscuits', category: 'consumables', brand: 'Parle',
        batch: 'PRL-0810-09', quantity: 5, purchasePrice: 10, sellingPrice: 12,
        expiryDate: todayPlusDays(90),
      },
      {
        wadn: 'WADN-IND-2026-E7F8G9H0', name: 'Coca Cola Soft Drink 1.25L', category: 'consumables', brand: 'Coca Cola',
        batch: 'COKE-0920-14', quantity: 2, purchasePrice: 65, sellingPrice: 72,
        expiryDate: todayPlusDays(45),
      },
      {
        wadn: 'WADN-IND-2026-I1J2K3L4', name: 'Crocin 650 Tablets', category: 'pharma', brand: 'Crocin',
        batch: 'PH-CRC-0726-01', quantity: 2, purchasePrice: 40, sellingPrice: 45,
        expiryDate: todayPlusDays(270),
      },
      {
        wadn: 'WADN-IND-2026-M5N6O7P8', name: 'Dolo 650 Tablets', category: 'pharma', brand: 'Dolo',
        batch: 'PH-DOL-0826-02', quantity: 1, purchasePrice: 32, sellingPrice: 36,
        expiryDate: todayPlusDays(-5),
      },
      {
        wadn: 'WADN-IND-2026-Q9R0S1T2', name: 'boAt Airdopes 141 Wireless Earbuds', category: 'electronics', brand: 'boAt',
        batch: 'EL-BAT-0626-W1', quantity: 1, purchasePrice: 1299, sellingPrice: 1499,
        expiryDate: todayPlusDays(730), warrantyEnd: todayPlusDays(18),
        sku: 'SKU-BOAT-AP141',
      },
      {
        wadn: 'WADN-IND-2026-U3V4W5X6', name: 'Philips BT1230 Trimmer', category: 'electronics', brand: 'Philips',
        batch: 'EL-PH-0326-T2', quantity: 1, purchasePrice: 1499, sellingPrice: 1699,
        expiryDate: todayPlusDays(1095), warrantyEnd: todayPlusDays(60),
        sku: 'SKU-PHILIPS-BT1230',
      },
      {
        wadn: 'WADN-IND-2026-Y7Z8A9B0', name: 'Mi Power Bank 20000mAh', category: 'electronics', brand: 'Mi',
        batch: 'EL-MI-0126-P3', quantity: 1, purchasePrice: 1799, sellingPrice: 1999,
        expiryDate: todayPlusDays(1460), warrantyEnd: todayPlusDays(200),
        sku: 'SKU-MI-PB20K',
      },
    ];

    consumerProducts.forEach(p => {
      this.products.push({
        id: uid(),
        ...consumerBase,
        ...p,
      });
    });

    const now = new Date();
    function makeReturnDeadline(daysAgo) {
      const d = new Date(now);
      d.setDate(d.getDate() + daysAgo);
      return d.toISOString();
    }

    const retailerInventory = [
      { wadn: 'WADN-IND-2026-INV-MK01', name: 'Amul Taaza Milk 1L', category: 'consumables', brand: 'Amul', batch: 'MILK-0926-10', quantity: 20, purchasePrice: 38, sellingPrice: 42, expiryDate: todayPlusDays(2), returnDeadline: makeReturnDeadline(1), sku: 'SKU-AMUL-MLK-1L', status: 'returnable' },
      { wadn: 'WADN-IND-2026-INV-MK02', name: 'Amul Taaza Milk 1L', category: 'consumables', brand: 'Amul', batch: 'MILK-0927-11', quantity: 24, purchasePrice: 38, sellingPrice: 42, expiryDate: todayPlusDays(3), returnDeadline: makeReturnDeadline(2), sku: 'SKU-AMUL-MLK-1L', status: 'in-stock' },
      { wadn: 'WADN-IND-2026-INV-BR01', name: 'Britannia Bread', category: 'consumables', brand: 'Britannia', batch: 'BRD-0926-20', quantity: 12, purchasePrice: 38, sellingPrice: 45, expiryDate: todayPlusDays(2), returnDeadline: makeReturnDeadline(1), sku: 'SKU-BRIT-BRD', status: 'returnable' },
      { wadn: 'WADN-IND-2026-INV-BR02', name: 'Britannia Bread', category: 'consumables', brand: 'Britannia', batch: 'BRD-0927-21', quantity: 15, purchasePrice: 38, sellingPrice: 45, expiryDate: todayPlusDays(3), returnDeadline: makeReturnDeadline(2), sku: 'SKU-BRIT-BRD', status: 'in-stock' },
      { wadn: 'WADN-IND-2026-INV-KF01', name: 'Kellogg\'s Corn Flakes 475g', category: 'consumables', brand: 'Kellogg\'s', batch: 'KF-0926-01', quantity: 8, purchasePrice: 140, sellingPrice: 165, expiryDate: todayPlusDays(50), returnDeadline: makeReturnDeadline(10), sku: 'SKU-KEL-CF-475', status: 'in-stock' },
      { wadn: 'WADN-IND-2026-INV-TS01', name: 'Tata Salt 1kg', category: 'consumables', brand: 'Tata', batch: 'SALT-0926-03', quantity: 25, purchasePrice: 24, sellingPrice: 30, expiryDate: todayPlusDays(180), returnDeadline: makeReturnDeadline(30), sku: 'SKU-TATA-SALT-1K', status: 'in-stock' },
      { wadn: 'WADN-IND-2026-INV-MG01', name: 'Maggi Masala Noodles 70g', category: 'consumables', brand: 'Maggi', batch: 'MAG-0915-05', quantity: 40, purchasePrice: 12, sellingPrice: 16, expiryDate: todayPlusDays(40), returnDeadline: makeReturnDeadline(15), sku: 'SKU-MAG-NDL-70', status: 'in-stock' },
      { wadn: 'WADN-IND-2026-INV-MG02', name: 'Maggi Masala Noodles 70g', category: 'consumables', brand: 'Maggi', batch: 'MAG-0920-06', quantity: 30, purchasePrice: 12, sellingPrice: 16, expiryDate: todayPlusDays(45), returnDeadline: makeReturnDeadline(20), sku: 'SKU-MAG-NDL-70', status: 'low-stock' },
      { wadn: 'WADN-IND-2026-INV-DT01', name: 'Dettol Soap 75g', category: 'consumables', brand: 'Dettol', batch: 'DET-0910-02', quantity: 18, purchasePrice: 34, sellingPrice: 42, expiryDate: todayPlusDays(150), returnDeadline: makeReturnDeadline(25), sku: 'SKU-DET-SOAP-75', status: 'in-stock' },
      { wadn: 'WADN-IND-2026-INV-TM01', name: 'Fresh Tomatoes 500g', category: 'consumables', brand: 'Local', batch: 'TOM-0926-10', quantity: 30, purchasePrice: 25, sellingPrice: 35, expiryDate: todayPlusDays(2), returnDeadline: makeReturnDeadline(1), sku: 'SKU-TOM-500G', status: 'expiring' },
      { wadn: 'WADN-IND-2026-INV-ON01', name: 'Onion 1kg', category: 'consumables', brand: 'Local', batch: 'ONI-0926-11', quantity: 22, purchasePrice: 38, sellingPrice: 50, expiryDate: todayPlusDays(10), returnDeadline: makeReturnDeadline(5), sku: 'SKU-ONION-1KG', status: 'in-stock' },
      { wadn: 'WADN-IND-2026-INV-PT01', name: 'Potato 2kg', category: 'consumables', brand: 'Local', batch: 'POT-0925-12', quantity: 18, purchasePrice: 45, sellingPrice: 60, expiryDate: todayPlusDays(20), returnDeadline: makeReturnDeadline(10), sku: 'SKU-POT-2KG', status: 'in-stock' },
      { wadn: 'WADN-IND-2026-INV-PN01', name: 'Amul Paneer 200g', category: 'consumables', brand: 'Amul', batch: 'PNR-0926-05', quantity: 10, purchasePrice: 78, sellingPrice: 92, expiryDate: todayPlusDays(4), returnDeadline: makeReturnDeadline(2), sku: 'SKU-AMUL-PAN-200', status: 'expiring' },
      { wadn: 'WADN-IND-2026-INV-CU01', name: 'Amul Curd 500g', category: 'consumables', brand: 'Amul', batch: 'CRD-0926-06', quantity: 12, purchasePrice: 42, sellingPrice: 52, expiryDate: todayPlusDays(3), returnDeadline: makeReturnDeadline(1), sku: 'SKU-AMUL-CURD-500', status: 'returnable' },
      { wadn: 'WADN-IND-2026-INV-RC01', name: 'India Gate Basmati Rice 5kg', category: 'consumables', brand: 'India Gate', batch: 'RICE-0826-08', quantity: 10, purchasePrice: 620, sellingPrice: 699, expiryDate: todayPlusDays(170), returnDeadline: makeReturnDeadline(40), sku: 'SKU-IG-RICE-5KG', status: 'in-stock' },
      { wadn: 'WADN-IND-2026-INV-WF01', name: 'Aashirvaad Wheat Flour 5kg', category: 'consumables', brand: 'Aashirvaad', batch: 'ATA-0826-09', quantity: 12, purchasePrice: 280, sellingPrice: 325, expiryDate: todayPlusDays(220), returnDeadline: makeReturnDeadline(50), sku: 'SKU-ASH-ATA-5KG', status: 'in-stock' },
      { wadn: 'WADN-IND-2026-INV-BS01', name: 'Parle-G Biscuits 80g', category: 'consumables', brand: 'Parle', batch: 'PRL-0920-10', quantity: 48, purchasePrice: 8, sellingPrice: 12, expiryDate: todayPlusDays(75), returnDeadline: makeReturnDeadline(20), sku: 'SKU-PARLE-G-80', status: 'in-stock' },
      { wadn: 'WADN-IND-2026-INV-SD01', name: 'Coca Cola 1.25L', category: 'consumables', brand: 'Coca Cola', batch: 'COKE-0910-14', quantity: 18, purchasePrice: 58, sellingPrice: 72, expiryDate: todayPlusDays(60), returnDeadline: makeReturnDeadline(20), sku: 'SKU-COKE-125', status: 'in-stock' },
      { wadn: 'WADN-IND-2026-INV-SD02', name: 'Sprite 1.25L', category: 'consumables', brand: 'Sprite', batch: 'SPR-0910-15', quantity: 16, purchasePrice: 58, sellingPrice: 72, expiryDate: todayPlusDays(62), returnDeadline: makeReturnDeadline(20), sku: 'SKU-SPRITE-125', status: 'in-stock' },
      { wadn: 'WADN-IND-2026-INV-CR01', name: 'Crocin 650 (10 tab)', category: 'pharma', brand: 'Crocin', batch: 'PH-CRC-0826-21', quantity: 15, purchasePrice: 35, sellingPrice: 45, expiryDate: todayPlusDays(250), returnDeadline: makeReturnDeadline(60), sku: 'SKU-CROCIN-650', status: 'in-stock' },
      { wadn: 'WADN-IND-2026-INV-DO01', name: 'Dolo 650 (10 tab)', category: 'pharma', brand: 'Dolo', batch: 'PH-DOL-0826-22', quantity: 12, purchasePrice: 28, sellingPrice: 36, expiryDate: todayPlusDays(240), returnDeadline: makeReturnDeadline(60), sku: 'SKU-DOLO-650', status: 'low-stock' },
      { wadn: 'WADN-IND-2026-INV-EB01', name: 'boAt Airdopes 141 Wireless Earbuds', category: 'electronics', brand: 'boAt', batch: 'EL-BOAT-0826-W1', quantity: 5, purchasePrice: 1200, sellingPrice: 1499, expiryDate: todayPlusDays(730), warrantyEnd: todayPlusDays(365), returnDeadline: makeReturnDeadline(7), sku: 'SKU-BOAT-AP141', status: 'in-stock' },
      { wadn: 'WADN-IND-2026-INV-TR01', name: 'Philips BT1230 Trimmer', category: 'electronics', brand: 'Philips', batch: 'EL-PHIL-0826-T2', quantity: 4, purchasePrice: 1400, sellingPrice: 1699, expiryDate: todayPlusDays(1095), warrantyEnd: todayPlusDays(720), returnDeadline: makeReturnDeadline(7), sku: 'SKU-PHILIPS-BT1230', status: 'in-stock' },
      { wadn: 'WADN-IND-2026-INV-PB01', name: 'Mi Power Bank 20000mAh', category: 'electronics', brand: 'Mi', batch: 'EL-MI-0826-P3', quantity: 3, purchasePrice: 1650, sellingPrice: 1999, expiryDate: todayPlusDays(1460), warrantyEnd: todayPlusDays(365), returnDeadline: makeReturnDeadline(7), sku: 'SKU-MI-PB20K', status: 'in-stock' },
      { wadn: 'WADN-IND-2026-INV-LF01', name: 'Lays Chips Magic Masala', category: 'consumables', brand: 'Lays', batch: 'LYS-0920-33', quantity: 20, purchasePrice: 18, sellingPrice: 25, expiryDate: todayPlusDays(12), returnDeadline: makeReturnDeadline(5), sku: 'SKU-LAYS-MM', status: 'expiring' },
      { wadn: 'WADN-IND-2026-INV-CH01', name: 'Dairy Milk Silk 150g', category: 'consumables', brand: 'Cadbury', batch: 'DB-0915-34', quantity: 15, purchasePrice: 155, sellingPrice: 180, expiryDate: todayPlusDays(8), returnDeadline: makeReturnDeadline(4), sku: 'SKU-CAD-DM-150', status: 'in-stock' },
      { wadn: 'WADN-IND-2026-INV-OLD01', name: 'Expired Old Stock Demo Item', category: 'consumables', brand: 'ExpiredBrand', batch: 'OLD-0526-00', quantity: 2, purchasePrice: 10, sellingPrice: 15, expiryDate: todayPlusDays(-10), returnDeadline: makeReturnDeadline(-15), sku: 'SKU-EXP-DEMO', status: 'expired' },
    ];

    retailerInventory.forEach(item => {
      this.products.push({
        id: uid(),
        retailerId: retailer.id,
        ownerId: retailer.id,
        purchaseDate: todayPlusDays(-3),
        ...item,
      });
    });

    const txDates = [todayPlusDays(-1), todayPlusDays(-2), todayPlusDays(-3), todayPlusDays(-5), todayPlusDays(-6)];

    const transactions = [
      {
        items: [
          { wadn: 'WADN-IND-2026-A1B2C3D4', name: 'Amul Taaza Milk 1L', price: 42, qty: 2 },
          { wadn: 'WADN-IND-2026-E5F6G7H8', name: 'Britannia Bread', price: 45, qty: 1 },
        ],
        subtotal: 129, discount: 0, total: 129, totalPaid: 150, changeGiven: 20, changeCreditAmount: 1,
      },
      {
        items: [
          { wadn: 'WADN-IND-2026-I9J0K1L2', name: 'Kellogg\'s Corn Flakes', price: 165, qty: 1 },
          { wadn: 'WADN-IND-2026-M3N4O5P6', name: 'Tata Salt', price: 30, qty: 1 },
          { wadn: 'WADN-IND-2026-U1V2W3X4', name: 'Dettol Soap', price: 42, qty: 2 },
        ],
        subtotal: 279, discount: 10, total: 269, totalPaid: 300, changeGiven: 24, changeCreditAmount: 7,
      },
      {
        items: [
          { wadn: 'WADN-IND-2026-S5T6U7V8', name: 'India Gate Basmati Rice 5kg', price: 699, qty: 1 },
          { wadn: 'WADN-IND-2026-W9X0Y1Z2', name: 'Aashirvaad Wheat Flour 5kg', price: 325, qty: 1 },
        ],
        subtotal: 1024, discount: 24, total: 1000, totalPaid: 1000, changeGiven: 0, changeCreditAmount: 0,
      },
      {
        items: [
          { wadn: 'WADN-IND-2026-Y7Z8A9B0', name: 'boAt Airdopes 141 Wireless Earbuds', price: 1499, qty: 1 },
        ],
        subtotal: 1499, discount: 0, total: 1499, totalPaid: 1500, changeGiven: 0, changeCreditAmount: 1,
      },
      {
        items: [
          { wadn: 'WADN-IND-2026-Q7R8S9T0', name: 'Maggi Noodles', price: 16, qty: 4 },
          { wadn: 'WADN-IND-2026-A3B4C5D6', name: 'Parle-G Biscuits', price: 12, qty: 5 },
          { wadn: 'WADN-IND-2026-K7L8M9N0', name: 'Amul Paneer 200g', price: 92, qty: 1 },
          { wadn: 'WADN-IND-2026-O1P2Q3R4', name: 'Amul Curd 500g', price: 52, qty: 2 },
        ],
        subtotal: 314, discount: 5, total: 309, totalPaid: 320, changeGiven: 8, changeCreditAmount: 3,
      },
    ];

    const txIds = [];
    transactions.forEach((tx, i) => {
      const id = uid();
      txIds.push(id);
      this.transactions.push({
        id,
        retailerId: retailer.id,
        customerPhone: consumer.phone,
        items: tx.items,
        subtotal: tx.subtotal,
        discount: tx.discount,
        total: tx.total,
        totalPaid: tx.totalPaid,
        changeGiven: tx.changeGiven,
        changeCreditAmount: tx.changeCreditAmount,
        date: txDates[i % txDates.length],
      });
    });

    const creditAmounts = [3, 7, 12];
    creditAmounts.forEach((amount, i) => {
      this.changeCredits.push({
        id: uid(),
        customerPhone: consumer.phone,
        amount,
        status: 'active',
        createdAt: txDates[i % txDates.length],
        transactionId: txIds[i % txIds.length],
      });
    });

    const earbudsWadn = 'WADN-IND-2026-Q9R0S1T2';
    const trimmerWadn = 'WADN-IND-2026-U3V4W5X6';
    const closedOldWadn = 'WADN-IND-2026-E7F8G9H0';

    this.serviceTickets.push(
      {
        id: uid(),
        wadn: earbudsWadn,
        productName: 'boAt Airdopes 141 Wireless Earbuds',
        customerId: consumer.id,
        customerPhone: consumer.phone,
        retailerId: retailer.id,
        issue: 'Battery drains fast. After full charge lasts only 30 mins.',
        status: 'open',
        createdAt: todayPlusDays(-2),
        warrantyActive: true,
        purchaseRecord: txIds[3],
        invoiceNo: 'INV-AV-2026-' + (1000 + Math.floor(Math.random() * 9000)),
        history: [
          { ts: todayPlusDays(-2), event: 'Ticket opened by customer' },
          { ts: todayPlusDays(-2), event: 'Warranty status verified: Active' },
        ],
      },
      {
        id: uid(),
        wadn: trimmerWadn,
        productName: 'Philips BT1230 Trimmer',
        customerId: consumer.id,
        customerPhone: consumer.phone,
        retailerId: retailer.id,
        issue: 'Blade not cutting cleanly, pulls hair even after oiling.',
        status: 'accepted',
        createdAt: todayPlusDays(-5),
        warrantyActive: true,
        purchaseRecord: txIds[2],
        invoiceNo: 'INV-AV-2026-' + (1000 + Math.floor(Math.random() * 9000)),
        history: [
          { ts: todayPlusDays(-5), event: 'Ticket opened by customer' },
          { ts: todayPlusDays(-4), event: 'Accepted by Avero service team' },
          { ts: todayPlusDays(-4), event: 'Sent to Philips authorized service center' },
        ],
      },
      {
        id: uid(),
        wadn: closedOldWadn,
        productName: 'Mi Power Bank 20000mAh',
        customerId: consumer.id,
        customerPhone: consumer.phone,
        retailerId: retailer.id,
        issue: 'USB-C port loose, not charging reliably.',
        status: 'closed',
        createdAt: todayPlusDays(-30),
        warrantyActive: true,
        purchaseRecord: uid(),
        invoiceNo: 'INV-AV-2026-' + (1000 + Math.floor(Math.random() * 9000)),
        history: [
          { ts: todayPlusDays(-30), event: 'Ticket opened by customer' },
          { ts: todayPlusDays(-29), event: 'Accepted by Avero service team' },
          { ts: todayPlusDays(-25), event: 'USB-C port replaced under warranty' },
          { ts: todayPlusDays(-22), event: 'Ready for pickup' },
          { ts: todayPlusDays(-20), event: 'Delivered to customer. Ticket closed.' },
        ],
      }
    );

    const expiringForMarketplace = consumerProducts
      .filter(p => {
        const d = daysFromNow(p.expiryDate);
        return d >= 1 && d <= 20;
      })
      .slice(0, 5);

    const distances = [0.6, 1.2, 0.9, 2.1, 1.5, 1.8];
    const prices = [25, 30, 60, 40, 55, 45];
    const neighbors = [
      { phone: '+919000000001', name: 'R. Sharma' },
      { phone: '+919000000002', name: 'Priya K.' },
      { phone: '+919000000003', name: 'Arjun M.' },
      { phone: '+919000000004', name: 'Neha S.' },
      { phone: '+919000000005', name: 'Vikram R.' },
      { phone: '+919000000006', name: 'Anita P.' },
    ];

    expiringForMarketplace.forEach((p, i) => {
      this.marketplaceListings.push({
        id: uid(),
        wadn: p.wadn,
        productName: p.name,
        category: p.category,
        price: prices[i % prices.length],
        expiry: p.expiryDate,
        distanceKm: distances[i % distances.length],
        offeredByPhone: neighbors[i % neighbors.length].phone,
        offeredByName: neighbors[i % neighbors.length].name,
        status: 'available',
        createdAt: todayPlusDays(-(i + 1)),
      });
    });

    if (this.marketplaceListings.length < 5) {
      this.marketplaceListings.push({
        id: uid(),
        wadn: 'WADN-IND-2026-MP-EXTRA1',
        productName: 'Dairy Milk Silk 150g (extra)',
        category: 'consumables',
        price: 40,
        expiry: todayPlusDays(9),
        distanceKm: 1.1,
        offeredByPhone: neighbors[5].phone,
        offeredByName: neighbors[5].name,
        status: 'available',
        createdAt: todayPlusDays(-1),
      });
    }

    for (let i = 0; i < 260; i++) {
      const pastDays = Math.floor(Math.random() * 180) + 1;
      const ts = todayPlusDays(-pastDays);
      this.activityLogs.push({
        id: uid(),
        entityId: 'hist-exp-' + i,
        entityType: 'expiry-alert',
        event: 'alert-shown',
        detail: 'Expiry alert shown for product batch #' + (i + 1),
        ts,
        actorPhone: consumer.phone,
      });
    }

    for (let i = 0; i < 60; i++) {
      const pastDays = Math.floor(Math.random() * 180) + 1;
      const ts = todayPlusDays(-pastDays);
      this.activityLogs.push({
        id: uid(),
        entityId: 'hist-exp-action-' + i,
        entityType: 'expiry-intervention',
        event: 'expiry-intervention',
        detail: 'Consumer acted on expiry advice, used item #' + (i + 1) + ' before spoilage',
        ts,
        actorPhone: consumer.phone,
      });
    }

    for (let i = 0; i < 35; i++) {
      const pastDays = Math.floor(Math.random() * 180) + 1;
      const ts = todayPlusDays(-pastDays);
      const value = 350 + Math.floor(Math.random() * 450);
      this.activityLogs.push({
        id: uid(),
        entityId: 'hist-waste-' + i,
        entityType: 'waste-prevented',
        event: 'waste-prevented',
        detail: 'Waste prevented worth ₹' + value + ' via retailer return before expiry',
        ts,
        actorPhone: retailerUser.phone,
      });
    }

    for (let i = 0; i < 40; i++) {
      const pastDays = Math.floor(Math.random() * 180) + 1;
      const ts = todayPlusDays(-pastDays);
      const value = 300 + Math.floor(Math.random() * 500);
      this.activityLogs.push({
        id: uid(),
        entityId: 'hist-recover-' + i,
        entityType: 'value-recovered',
        event: 'value-recovered',
        detail: 'Value recovered ₹' + value + ' via salvage / markdown / return',
        ts,
        actorPhone: retailerUser.phone,
      });
    }

    for (let i = 0; i < 30; i++) {
      const pastDays = Math.floor(Math.random() * 180) + 1;
      const ts = todayPlusDays(-pastDays);
      this.activityLogs.push({
        id: uid(),
        entityId: 'hist-warranty-' + i,
        entityType: 'warranty-claim',
        event: 'warranty-claim',
        detail: 'Warranty claim processed for electronics item #' + (i + 1),
        ts,
        actorPhone: consumer.phone,
      });
    }

    for (let i = 0; i < 20; i++) {
      const pastDays = Math.floor(Math.random() * 30) + 1;
      const ts = todayPlusDays(-pastDays);
      this.activityLogs.push({
        id: uid(),
        entityId: 'hist-inv-' + i,
        entityType: 'inventory-accuracy',
        event: 'inventory-reconciled',
        detail: 'Stock take cycle ' + (i + 1) + ' - no discrepancy found',
        ts,
        actorPhone: retailerUser.phone,
      });
    }
  }

  _assertTable(table) {
    if (!TABLES.includes(table)) {
      throw new Error('Unknown table: ' + table);
    }
  }

  list(table, filters) {
    this._assertTable(table);
    let rows = this[table];
    if (filters && typeof filters === 'object') {
      rows = rows.filter(item => {
        return Object.keys(filters).every(key => {
          if (filters[key] === undefined || filters[key] === null) return true;
          return item[key] === filters[key];
        });
      });
    }
    return rows.slice();
  }

  get(table, id) {
    this._assertTable(table);
    if (id === undefined || id === null) return this[table].slice();
    return this[table].find(item => item.id === id) || null;
  }

  put(table, item) {
    this._assertTable(table);
    if (!item.id) item.id = uid();
    this[table].push(item);
    return item;
  }

  patch(table, id, updates) {
    this._assertTable(table);
    const idx = this[table].findIndex(item => item.id === id);
    if (idx === -1) return null;
    this[table][idx] = { ...this[table][idx], ...updates };
    return this[table][idx];
  }

  remove(table, id) {
    this._assertTable(table);
    const idx = this[table].findIndex(item => item.id === id);
    if (idx === -1) return false;
    this[table].splice(idx, 1);
    return true;
  }

  getAnalytics() {
    const productsTracked = this.products.length;

    const wastePreventedRs = this.activityLogs
      .filter(l => l.event === 'waste-prevented')
      .reduce((sum, l) => {
        const m = /₹(\d+)/.exec(l.detail || '');
        return sum + (m ? parseInt(m[1], 10) : 500);
      }, 0);

    const valueRecoveredRs = this.activityLogs
      .filter(l => l.event === 'value-recovered')
      .reduce((sum, l) => {
        const m = /₹(\d+)/.exec(l.detail || '');
        return sum + (m ? parseInt(m[1], 10) : 500);
      }, 0);

    const expiryInterventions = this.activityLogs.filter(l =>
      l.event === 'alert-shown' || l.event === 'expiry-intervention'
    ).length;

    const warrantyClaims = this.activityLogs.filter(l => l.event === 'warranty-claim').length +
      this.serviceTickets.filter(t => t.warrantyActive).length;

    const inventoryAccuracyPct = 96.4;

    const changeCreditsIssuedRs = this.changeCredits.reduce((s, c) => s + c.amount, 0);

    return {
      wastePreventedRs: Math.max(wastePreventedRs, 18500),
      valueRecoveredRs: Math.max(valueRecoveredRs, 26000),
      productsTracked: Math.max(productsTracked, 150),
      expiryInterventions: Math.max(expiryInterventions, 320),
      warrantyClaims: Math.max(warrantyClaims, 30),
      inventoryAccuracyPct,
      changeCreditsIssuedRs,
    };
  }

  inventoryExpiringGroups() {
    const urgent = [];
    const useSoon = [];
    const safe = [];
    const expired = [];

    this.products.forEach(p => {
      if (!p.expiryDate) return;
      const d = daysFromNow(p.expiryDate);
      if (d < 0) {
        expired.push(p);
      } else if (d <= 3) {
        urgent.push(p);
      } else if (d <= 14) {
        useSoon.push(p);
      } else if (d <= 30) {
        safe.push(p);
      } else {
        safe.push(p);
      }
    });

    return { urgent, useSoon, safe, expired };
  }

  pantryScanMock() {
    const sampleWadns = [
      'WADN-IND-2026-SCAN-0A1B', 'WADN-IND-2026-SCAN-2C3D', 'WADN-IND-2026-SCAN-4E5F',
      'WADN-IND-2026-SCAN-6G7H', 'WADN-IND-2026-SCAN-8I9J', 'WADN-IND-2026-SCAN-AKBL',
      'WADN-IND-2026-SCAN-CMDN',
    ];
    const detections = [
      { name: 'Amul Taaza Milk 500ml', category: 'consumables', quantity: 2, expiryDays: 2, wadn: sampleWadns[0], purchaseDaysAgo: 0, status: 'fresh' },
      { name: 'Nestle Maggi Pazzta', category: 'consumables', quantity: 1, expiryDays: 9, wadn: sampleWadns[1], purchaseDaysAgo: 3, status: 'ok' },
      { name: 'Haldiram\'s Aloo Bhujia 200g', category: 'consumables', quantity: 1, expiryDays: 14, wadn: sampleWadns[2], purchaseDaysAgo: 7, status: 'ok' },
      { name: 'Sunrise Pure Turmeric Powder', category: 'consumables', quantity: 1, expiryDays: 180, wadn: sampleWadns[3], purchaseDaysAgo: 15, status: 'ok' },
      { name: 'Oreo Biscuits Family Pack', category: 'consumables', quantity: 1, expiryDays: 45, wadn: sampleWadns[4], purchaseDaysAgo: 2, status: 'ok' },
      { name: 'Tata Sampann Toor Dal 1kg', category: 'consumables', quantity: 1, expiryDays: 160, wadn: sampleWadns[5], purchaseDaysAgo: 10, status: 'ok' },
    ];
    const count = 5 + Math.floor(Math.random() * 3);
    const pick = detections.slice(0, Math.min(count, detections.length));
    return pick.map(d => ({
      name: d.name,
      category: d.category,
      quantity: d.quantity,
      expiry: todayPlusDays(d.expiryDays),
      wadn: d.wadn,
      purchaseDate: todayPlusDays(-d.purchaseDaysAgo),
      status: d.status,
    }));
  }
}

const store = new Store();

module.exports = store;
module.exports.Store = Store;
module.exports.uid = uid;
module.exports.todayPlusDays = todayPlusDays;
module.exports.daysFromNow = daysFromNow;
