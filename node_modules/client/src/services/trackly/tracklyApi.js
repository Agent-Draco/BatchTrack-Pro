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

export function pantryScan() {
  return safe(apiPost('/pantry/scan', {}), []);
}

export function getMarketplaceListings(filters) {
  return safe(apiGet('/marketplace', filters), []);
}

export function claimMarketplaceListing(id, claimedByPhone) {
  return apiPost(`/marketplace/${encodeURIComponent(id)}/claim`, { claimedByPhone });
}

export function offerMarketplaceListing(payload) {
  return apiPost('/marketplace/offer', payload);
}

export function getUserProducts(userId) {
  return safe(apiGet(`/users/${encodeURIComponent(userId)}/products`), []);
}

export function getWadnPassport(wadn) {
  return safe(apiGet(`/wadn/${encodeURIComponent(wadn)}`), null);
}

export default {
  pantryScan,
  getMarketplaceListings,
  claimMarketplaceListing,
  offerMarketplaceListing,
  getUserProducts,
  getWadnPassport,
};
