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
      if (typeof console !== 'undefined') console.error('[Avero API]', m);
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

// ==========================================
// AVERO ENTERPRISE & POS API CLIENT
// ==========================================

export function getAveroDashboard() {
  return safe(apiGet('/avero/dashboard'), {
    kpis: {
      todaySalesINR: 0,
      totalInventoryValueINR: 0,
      totalCostValueINR: 0,
      recoverableSalvageValueINR: 0,
      activeSkusCount: 0,
      activeBatchesCount: 0,
      openReturnsCount: 0,
      activeTerminalsCount: 0,
    },
    attentionItems: [],
    recentAudits: [],
    activeTerminals: [],
  });
}

export function getAveroProducts() {
  return safe(apiGet('/avero/products'), []);
}

export function getAveroInventory() {
  return safe(apiGet('/avero/inventory'), []);
}

export function getAveroMovements() {
  return safe(apiGet('/avero/inventory/movements'), []);
}

export function adjustAveroStock(payload) {
  return apiPost('/avero/inventory/adjust', payload);
}

export function getAveroSales(filters) {
  return safe(apiGet('/avero/sales', filters), []);
}

export function getAveroSaleDetail(id) {
  return safe(apiGet(`/avero/sales/${encodeURIComponent(id)}`), null);
}

export function processAveroCheckout(payload) {
  return apiPost('/avero/sales/checkout', payload);
}

export function getAveroChangeCredits() {
  return safe(apiGet('/avero/change-credits'), []);
}

export function getAveroCustomerCredits(phone) {
  return safe(apiGet(`/avero/change-credits/${encodeURIComponent(phone)}`), {
    customerPhone: phone,
    availableBalance: 0,
    history: [],
  });
}

export function getAveroReturns() {
  return safe(apiGet('/avero/returns'), []);
}

export function createAveroReturn(payload) {
  return apiPost('/avero/returns/create', payload);
}

export function updateAveroItemDisposition(returnItemId, disposition, managerName) {
  return apiPatch(`/avero/returns/items/${encodeURIComponent(returnItemId)}/disposition`, {
    disposition,
    managerName,
  });
}

export function getAveroSalvage() {
  return safe(apiGet('/avero/salvage'), {
    attentionItems: [],
    batches: [],
    recoverableValue: 0,
  });
}

export function getAveroTerminals() {
  return safe(apiGet('/avero/terminals'), []);
}

export function verifyAveroTerminal(terminalCode, pin) {
  return apiPost('/avero/terminals/verify', { terminalCode, pin });
}

export function saveAveroTerminal(payload) {
  return apiPost('/avero/terminals/save', payload);
}

export function getAveroAuditLogs() {
  return safe(apiGet('/avero/audit-logs'), []);
}

export default {
  getAveroDashboard,
  getAveroProducts,
  getAveroInventory,
  getAveroMovements,
  adjustAveroStock,
  getAveroSales,
  getAveroSaleDetail,
  processAveroCheckout,
  getAveroChangeCredits,
  getAveroCustomerCredits,
  getAveroReturns,
  createAveroReturn,
  updateAveroItemDisposition,
  getAveroSalvage,
  getAveroTerminals,
  verifyAveroTerminal,
  saveAveroTerminal,
  getAveroAuditLogs,
};
