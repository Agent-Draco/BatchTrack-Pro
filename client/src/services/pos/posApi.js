function getHeaders() {
  const token = sessionStorage.getItem('avero_pos_session');
  return token ? {
    'X-POS-Session': token,
    'Content-Type': 'application/json'
  } : { 'Content-Type': 'application/json' };
}

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`/api/pos${endpoint}`, {
    ...options,
    headers: { ...getHeaders(), ...options.headers }
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }
  return response.json();
}

export const posLogin = (terminalCode, pin) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ terminalCode, pin }) });
export const posLogout = () => apiRequest('/auth/logout', { method: 'POST' });
export const posGetSession = () => apiRequest('/auth/session');

export const posLookupBarcode = (barcode) => apiRequest(`/lookup/barcode/${barcode}`);
export const posLookupSku = (sku) => apiRequest(`/lookup/sku/${sku}`);
export const posLookupWadn = (wadn) => apiRequest(`/lookup/wadn/${wadn}`);
export const posLookupCustomer = (phone) => apiRequest(`/lookup/customer/${phone}`);

export const posCheckout = (payload) => apiRequest('/checkout', { method: 'POST', body: JSON.stringify(payload) });
export const posInitiateReturn = (payload) => apiRequest('/returns', { method: 'POST', body: JSON.stringify(payload) });
