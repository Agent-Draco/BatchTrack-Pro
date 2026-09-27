const BASE = 'http://localhost:3001/api';
const results = [];

function log(name, pass, detail) {
  results.push({ name, pass, detail });
  const icon = pass ? 'PASS' : 'FAIL';
  console.log(`[${icon}] ${name}${detail ? ' - ' + detail : ''}`);
}

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE + path, opts);
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, json };
}

async function run() {
  console.log('=== BatchTrack Server Smoke Tests ===\n');

  let r;

  r = await request('GET', '/health');
  log('GET /health', r.status === 200 && r.json.ok === true, 'status=' + r.status);

  r = await request('GET', '/products');
  const productsLen = Array.isArray(r.json) ? r.json.length : 0;
  log('GET /api/products length>=40', r.status === 200 && productsLen >= 40, `length=${productsLen}`);

  r = await request('GET', '/inventory/expiring');
  const groups = r.json || {};
  const hasGroups = groups.urgent && groups.useSoon && groups.safe && groups.expired;
  const allNonEmpty = hasGroups && groups.urgent.length >= 1 && groups.useSoon.length >= 1 && groups.safe.length >= 1 && groups.expired.length >= 1;
  log('GET /api/inventory/expiring 4 groups non-empty', r.status === 200 && allNonEmpty,
    `urgent=${groups.urgent?.length || 0} useSoon=${groups.useSoon?.length || 0} safe=${groups.safe?.length || 0} expired=${groups.expired?.length || 0}`);

  r = await request('GET', '/service-tickets');
  const ticketsBefore = Array.isArray(r.json) ? r.json.length : 0;
  log('GET /api/service-tickets (initial)', r.status === 200 && ticketsBefore >= 3, `length=${ticketsBefore}`);

  const products = (await request('GET', '/products')).json;
  const earbudsWadn = products.find(p => p.name && p.name.includes('Earbuds'))?.wadn || 'WADN-IND-2026-Q9R0S1T2';

  r = await request('POST', '/service-tickets', {
    wadn: earbudsWadn,
    productName: 'boAt Airdopes 141 Wireless Earbuds',
    customerPhone: '+919000000000',
    issue: 'Left earbud not charging',
    warrantyActive: true,
  });
  const newTicket = r.json;
  const ticketCreated = r.status === 201 && newTicket && newTicket.id;
  log('POST /api/service-tickets 201 new ticket with id', ticketCreated,
    `status=${r.status} id=${newTicket?.id || 'none'}`);

  r = await request('GET', '/service-tickets');
  const ticketsAfter = Array.isArray(r.json) ? r.json.length : 0;
  log('GET /api/service-tickets length increased by 1',
    ticketsAfter === ticketsBefore + 1,
    `before=${ticketsBefore} after=${ticketsAfter}`);

  r = await request('POST', '/pantry/scan');
  const pantry = r.json || {};
  const pantryOk = r.status === 200 && Array.isArray(pantry.detections) && pantry.detections.length >= 5;
  log('POST /api/pantry/scan detections>=5', pantryOk,
    `status=${r.status} detections.length=${pantry.detections?.length || 0}`);

  r = await request('GET', '/wadn/' + encodeURIComponent(earbudsWadn));
  const wadn = r.json || {};
  const wadnOk = r.status === 200 && wadn.product && wadn.owner && wadn.retailer && wadn.serviceHistory && wadn.lifecycleSteps;
  log('GET /api/wadn/<earbuds WADN> full record', wadnOk,
    `status=${r.status} hasProduct=${!!wadn.product} hasOwner=${!!wadn.owner} hasRetailer=${!!wadn.retailer} hasServiceHistory=${!!wadn.serviceHistory} hasLifecycleSteps=${!!wadn.lifecycleSteps}`);

  r = await request('GET', '/service-tickets');
  const wadnTickets = (r.json || []).filter(t => t.wadn === earbudsWadn);
  log('GET /api/wadn service-history includes new ticket',
    wadnTickets.length > 0, `wadnTickets=${wadnTickets.length}`);

  r = await request('GET', '/marketplace');
  const listings = Array.isArray(r.json) ? r.json : [];
  const firstListingId = listings[0]?.id;
  log('GET /api/marketplace returns listings', r.status === 200 && listings.length >= 5,
    `length=${listings.length}`);

  if (firstListingId) {
    r = await request('POST', `/marketplace/${firstListingId}/claim`, {
      claimedByPhone: '+919000000000',
    });
    const claimed = r.json || {};
    const claimOk = r.status === 200 && claimed.status === 'claimed';
    log('POST /api/marketplace/:id/claim status becomes claimed',
      claimOk, `status=${r.status} listingStatus=${claimed.status}`);
  } else {
    log('POST /api/marketplace/:id/claim', false, 'no listing id available');
  }

  const inventory = (await request('GET', '/inventory')).json || [];
  const invForTx = inventory.find(p => p.quantity >= 2 && p.sellingPrice);
  if (!invForTx) {
    log('POST /api/transactions prep', false, 'no suitable inventory item found');
  } else {
    const invQtyBefore = invForTx.quantity;
    const userProductsBefore = ((await request('GET', '/users/demo-consumer-1/products')).json || []).length;

    r = await request('POST', '/transactions', {
      customerPhone: '+919000000000',
      items: [{
        wadn: invForTx.wadn,
        name: invForTx.name,
        price: invForTx.sellingPrice,
        qty: 1,
      }],
      subtotal: invForTx.sellingPrice,
      discount: 0,
      total: invForTx.sellingPrice,
      totalPaid: invForTx.sellingPrice + 5,
      changeGiven: 2,
      changeCreditAmount: 3,
      retailerId: 'demo-retailer-1',
    });

    const txResp = r.json || {};
    const txOk = r.status === 201 && txResp.transaction && txResp.sideEffects;
    const consumerAddOk = txResp.sideEffects?.consumerProductsAdded?.length >= 1;
    const invDecOk = txResp.sideEffects?.inventoryDecremented?.length >= 1;
    const changeCreditOk = !!txResp.sideEffects?.changeCredit;
    log('POST /api/transactions 201 side-effects summary',
      r.status === 201 && consumerAddOk && invDecOk,
      `status=${r.status} consumerProductsAdded=${txResp.sideEffects?.consumerProductsAdded?.length || 0} inventoryDecremented=${txResp.sideEffects?.inventoryDecremented?.length || 0} changeCredit=${txResp.sideEffects?.changeCredit || 'none'}`);

    const userProductsAfter = ((await request('GET', '/users/demo-consumer-1/products')).json || []).length;
    log('GET /api/users/:id/products ownership transfer observed',
      userProductsAfter > userProductsBefore,
      `before=${userProductsBefore} after=${userProductsAfter}`);

    const credits = ((await request('GET', '/change-credits/' + encodeURIComponent('+919000000000'))).json || []);
    log('GET /api/change-credits/:phone includes new credit',
      credits.length >= 3, `creditsCount=${credits.length}`);
  }

  r = await request('GET', '/users/demo-consumer-1/products');
  log('GET /api/users/:id/products', r.status === 200 && Array.isArray(r.json),
    `status=${r.status} length=${r.json?.length || 0}`);

  r = await request('GET', '/analytics');
  const analytics = r.json || {};
  const analyticsOk = r.status === 200 && analytics.productsTracked >= 142 && analytics.valueRecoveredRs >= 24680;
  log('GET /api/analytics aggregates', analyticsOk,
    `productsTracked=${analytics.productsTracked} valueRecoveredRs=${analytics.valueRecoveredRs} expiryInterventions=${analytics.expiryInterventions}`);

  r = await request('GET', '/inventory');
  log('GET /api/inventory (retailer items)', r.status === 200 && Array.isArray(r.json),
    `status=${r.status} length=${r.json?.length || 0}`);

  r = await request('POST', '/products', [{
    name: 'Smoke Test Item',
    category: 'consumables',
    brand: 'TestBrand',
    batch: 'TEST-001',
    quantity: 10,
    purchasePrice: 50,
    sellingPrice: 60,
  }]);
  const created = Array.isArray(r.json) ? r.json : [r.json];
  const createOk = r.status === 201 && created.length === 1 && created[0].id && created[0].wadn;
  log('POST /api/products (batch create)', createOk,
    `status=${r.status} id=${created[0]?.id} wadn=${created[0]?.wadn}`);

  if (created[0]?.id) {
    r = await request('PATCH', '/products/' + created[0].id, { quantity: 25 });
    const patched = r.json;
    const patchOk = r.status === 200 && patched.quantity === 25;
    log('PATCH /api/products/:id', patchOk,
      `status=${r.status} quantity=${patched?.quantity}`);
  }

  r = await request('GET', '/products/' + encodeURIComponent(earbudsWadn));
  log('GET /api/products/:wadn find by wadn', r.status === 200 && r.json.wadn === earbudsWadn,
    `status=${r.status} wadn=${r.json?.wadn}`);

  r = await request('GET', '/products?category=electronics');
  const filtered = Array.isArray(r.json) ? r.json : [];
  log('GET /api/products?category=electronics filter', r.status === 200 && filtered.every(p => p.category === 'electronics'),
    `length=${filtered.length}`);

  r = await request('POST', '/change-credits', {
    customerPhone: '+919000000000',
    amount: 99,
  });
  log('POST /api/change-credits 201', r.status === 201 && r.json.id,
    `status=${r.status} id=${r.json?.id}`);

  r = await request('POST', '/marketplace/offer', {
    wadn: 'WADN-IND-2026-OFFER-TEST1',
    productName: 'Smoke Test Offer Item',
    category: 'consumables',
    price: 50,
    expiry: new Date(Date.now() + 5 * 86400000).toISOString(),
    distanceKm: 1.5,
    offeredByPhone: '+919000000000',
    offeredByName: 'Demo Customer',
  });
  log('POST /api/marketplace/offer 201', r.status === 201 && r.json.id,
    `status=${r.status} id=${r.json?.id}`);

  const badTicket = await request('POST', '/service-tickets', {});
  log('POST /api/service-tickets validation 400', badTicket.status === 400 && badTicket.json?.error,
    `status=${badTicket.status}`);

  const notFoundWadn = await request('GET', '/wadn/DOES-NOT-EXIST-XXXX');
  log('GET /api/wadn/:nonexistent 404', notFoundWadn.status === 404 && notFoundWadn.json?.error,
    `status=${notFoundWadn.status}`);

  console.log('\n=== Summary ===');
  const passed = results.filter(r => r.pass).length;
  const total = results.length;
  console.log(`${passed} / ${total} tests passed`);
  console.log('\nFailed tests:');
  results.filter(r => !r.pass).forEach(r => console.log(`  - ${r.name}: ${r.detail}`));
}

run().catch(e => {
  console.error('TEST EXCEPTION:', e);
  process.exit(1);
});
