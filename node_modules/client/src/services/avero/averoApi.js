import { supabase } from '../../services/supabase.js';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? { 
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  } : { 'Content-Type': 'application/json' };
}

async function apiRequest(endpoint, options = {}) {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/avero${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers }
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }
  return response.json();
}

// Dashboard
export const getAveroDashboard = () => apiRequest('/dashboard');

// Products
export const getAveroProducts = () => apiRequest('/products');
export const getAveroProduct = (id) => apiRequest(`/products/${id}`);
export const createAveroProduct = (data) => apiRequest('/products', { method: 'POST', body: JSON.stringify(data) });
export const updateAveroProduct = (id, data) => apiRequest(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

// Inventory
export const getAveroInventory = () => apiRequest('/inventory');
export const getAveroMovements = () => apiRequest('/inventory/movements');
export const adjustAveroStock = (payload) => apiRequest('/inventory/adjust', { method: 'POST', body: JSON.stringify(payload) });

// Sales
export const getAveroSales = (filters = '') => apiRequest(`/sales${filters}`);
export const getAveroSaleDetail = (id) => apiRequest(`/sales/${id}`);

// Returns
export const getAveroReturns = () => apiRequest('/returns');
export const createAveroReturn = (payload) => apiRequest('/returns', { method: 'POST', body: JSON.stringify(payload) });
export const updateAveroItemDisposition = (id, disposition, managerName) => apiRequest(`/returns/items/${id}/disposition`, { method: 'PATCH', body: JSON.stringify({ disposition, managerName }) });

// Customers
export const getAveroCustomers = () => apiRequest('/customers');
export const getAveroCustomer = (id) => apiRequest(`/customers/${id}`);
export const createAveroCustomer = (data) => apiRequest('/customers', { method: 'POST', body: JSON.stringify(data) });

// Change Credits
export const getAveroChangeCredits = () => apiRequest('/change-credits');
export const getAveroCustomerCredits = (phone) => apiRequest(`/change-credits/customer/${phone}`);

// Salvage
export const getAveroSalvage = () => apiRequest('/salvage');
export const createSalvageTicket = (data) => apiRequest('/salvage/tickets', { method: 'POST', body: JSON.stringify(data) });
export const updateSalvageTicket = (id, data) => apiRequest(`/salvage/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

// Terminals
export const getAveroTerminals = () => apiRequest('/terminals');
export const getAveroTerminal = (id) => apiRequest(`/terminals/${id}`);
export const saveAveroTerminal = (data) => apiRequest('/terminals', { method: 'POST', body: JSON.stringify(data) });

// Audit Logs
export const getAveroAuditLogs = (filters = '') => apiRequest(`/audit-logs${filters}`);

// Profile
export const getProfile = async () => {
    const headers = await getAuthHeaders();
    const response = await fetch('/api/auth/profile', { headers });
    return response.json();
};
export const updateProfile = async (data) => {
    const headers = await getAuthHeaders();
    const response = await fetch('/api/auth/profile', { method: 'PATCH', headers, body: JSON.stringify(data) });
    return response.json();
};
