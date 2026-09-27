const BASE =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE
    ? import.meta.env.VITE_API_BASE
    : '/api';

function getToastFn() {
  try {
    const win = typeof window !== 'undefined' ? window : globalThis;
    if (win.__batchtrackToast) return win.__batchtrackToast;
  } catch {
    /* noop */
  }
  return {
    success: () => {},
    error: (m) => {
      if (typeof console !== 'undefined') console.error('[API]', m);
    },
    info: () => {},
    push: () => {},
  };
}

function qs(params) {
  if (!params) return '';
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  );
  if (entries.length === 0) return '';
  return (
    '?' +
    entries
      .map(([k, v]) => {
        const val = Array.isArray(v) ? v.join(',') : String(v);
        return encodeURIComponent(k) + '=' + encodeURIComponent(val);
      })
      .join('&')
  );
}

async function request(method, path, body, params) {
  const url = BASE + path + qs(params);
  const opts = {
    method,
    headers: {
      Accept: 'application/json',
    },
  };
  if (body !== undefined && body !== null) {
    if (
      (typeof FormData !== 'undefined' && body instanceof FormData) ||
      typeof body === 'string' ||
      (typeof Blob !== 'undefined' && body instanceof Blob)
    ) {
      opts.body = body;
    } else {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
  }

  let res;
  try {
    res = await fetch(url, opts);
  } catch (err) {
    const toast = getToastFn();
    toast.error?.('Network error: could not reach the server.');
    throw err;
  }

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const msg =
      (data && data.message) ||
      (data && data.error) ||
      `Request failed (${res.status})`;
    const toast = getToastFn();
    toast.error?.(String(msg));
    const err = new Error(String(msg));
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const apiGet = (path, params) => request('GET', path, undefined, params);
export const apiPost = (path, body) => request('POST', path, body);
export const apiPatch = (path, body) => request('PATCH', path, body);

function safe(call, fallback) {
  return call.catch((err) => {
    if (err && err.status && err.status >= 400 && err.status < 500 && !fallback)
      throw err;
    if (typeof fallback === 'function') return fallback(err);
    return fallback === undefined ? Promise.reject(err) : fallback;
  });
}

export function getProducts(filters) {
  return safe(apiGet('/products', filters), []);
}

export function getProduct(wadn) {
  return safe(apiGet(`/products/${encodeURIComponent(wadn)}`), null);
}

export function getAnalytics() {
  return safe(apiGet('/analytics'), {
    wastePrevented: 0,
    valueRecovered: 0,
    productsTracked: 0,
    expiryInterventions: 0,
    warrantyClaims: 0,
    inventoryAccuracy: 0,
    changeCreditsIssued: 0,
  });
}

export function getInventory(filters) {
  return safe(apiGet('/inventory', filters), []);
}

export function getInventoryExpiring() {
  return safe(apiGet('/inventory/expiring'), {
    urgent: [],
    useSoon: [],
    safe: [],
    expired: [],
  });
}

export function getTransactions(filters) {
  return safe(apiGet('/transactions', filters), []);
}

export function postTransactions(payload) {
  return apiPost('/transactions', payload);
}

export function getServiceTickets(filters) {
  return safe(apiGet('/service-tickets', filters), []);
}

export function createServiceTicket(payload) {
  return apiPost('/service-tickets', payload);
}

export function acceptServiceTicket(id) {
  return apiPatch(`/service-tickets/${encodeURIComponent(id)}`, {
    status: 'accepted',
  });
}

export function getChangeCredits(phone) {
  return safe(
    apiGet(`/change-credits/${encodeURIComponent(phone)}`),
    []
  );
}

export function addChangeCredit(payload) {
  return apiPost('/change-credits', payload);
}

export function getMarketplace(filters) {
  return safe(apiGet('/marketplace', filters), []);
}

export function claimMarketplace(id) {
  return apiPost(`/marketplace/${encodeURIComponent(id)}/claim`, {});
}

export function offerMarketplace(payload) {
  return apiPost('/marketplace/offer', payload);
}

export function pantryScanMock() {
  return safe(apiPost('/pantry/scan', {}), [
    {
      name: 'Amul Taaza Milk 1L',
      category: 'consumables',
      expiry: '2026-10-02',
      qty: 2,
      wadn: 'WADN-IND-2026-MOCK1001',
    },
    {
      name: 'Britannia Whole Wheat Bread',
      category: 'consumables',
      expiry: '2026-09-30',
      qty: 1,
      wadn: 'WADN-IND-2026-MOCK1002',
    },
    {
      name: 'Tata Sampann Toor Dal 1kg',
      category: 'consumables',
      expiry: '2027-03-15',
      qty: 1,
      wadn: 'WADN-IND-2026-MOCK1003',
    },
    {
      name: 'Maggi Masala Noodles 70g',
      category: 'consumables',
      expiry: '2027-02-20',
      qty: 4,
      wadn: 'WADN-IND-2026-MOCK1004',
    },
    {
      name: 'Dettol Original Soap 75g',
      category: 'consumables',
      expiry: '2027-08-12',
      qty: 2,
      wadn: 'WADN-IND-2026-MOCK1005',
    },
    {
      name: "Kellogg's Corn Flakes 475g",
      category: 'consumables',
      expiry: '2026-12-01',
      qty: 1,
      wadn: 'WADN-IND-2026-MOCK1006',
    },
  ]);
}

export function getWadnRecord(wadn) {
  return safe(apiGet(`/wadn/${encodeURIComponent(wadn)}`), null);
}

export const API_BASE = BASE;

export default {
  apiGet,
  apiPost,
  apiPatch,
  getProducts,
  getProduct,
  getAnalytics,
  getInventory,
  getInventoryExpiring,
  getTransactions,
  postTransactions,
  getServiceTickets,
  createServiceTicket,
  acceptServiceTicket,
  getChangeCredits,
  addChangeCredit,
  getMarketplace,
  claimMarketplace,
  offerMarketplace,
  pantryScanMock,
  getWadnRecord,
};
