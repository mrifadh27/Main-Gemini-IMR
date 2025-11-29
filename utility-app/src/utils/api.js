// =============================================================================
// UMS API SERVICE
// =============================================================================

import { API_BASE_URL } from './constants';

// Generic fetch wrapper with error handling
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || error.error || 'Request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// =============================================================================
// DATA FETCHING
// =============================================================================

export async function fetchInitialData() {
  return fetchAPI('/initial-data');
}

export async function fetchDashboardStats() {
  return fetchAPI('/dashboard/stats');
}

// =============================================================================
// CUSTOMER OPERATIONS
// =============================================================================

export async function addCustomer(customer) {
  return fetchAPI('/customers', {
    method: 'POST',
    body: JSON.stringify(customer),
  });
}

export async function updateCustomer(id, customer) {
  return fetchAPI(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(customer),
  });
}

export async function deleteCustomer(id) {
  return fetchAPI(`/customers/${id}`, {
    method: 'DELETE',
  });
}

// =============================================================================
// METER OPERATIONS
// =============================================================================

export async function addMeter(meter) {
  return fetchAPI('/meters', {
    method: 'POST',
    body: JSON.stringify(meter),
  });
}

export async function deleteMeter(id) {
  return fetchAPI(`/meters/${id}`, {
    method: 'DELETE',
  });
}

// =============================================================================
// READING & BILLING OPERATIONS
// =============================================================================

export async function submitReading(meterId, currentReading) {
  return fetchAPI('/add-reading', {
    method: 'POST',
    body: JSON.stringify({ meterId, currentReading }),
  });
}

export async function processPayment(billId, amount, paymentMethod = 'Cash') {
  return fetchAPI('/pay-bill', {
    method: 'POST',
    body: JSON.stringify({ billId, amount, paymentMethod }),
  });
}

// =============================================================================
// TARIFF OPERATIONS
// =============================================================================

export async function updateTariff(id, tariff) {
  return fetchAPI(`/tariffs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(tariff),
  });
}

// =============================================================================
// COMPLAINT OPERATIONS
// =============================================================================

export async function createComplaint(complaint) {
  return fetchAPI('/complaints', {
    method: 'POST',
    body: JSON.stringify(complaint),
  });
}

export async function updateComplaint(id, updates) {
  return fetchAPI(`/complaints/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

// =============================================================================
// REPORT OPERATIONS
// =============================================================================

export async function fetchRevenueReport(year, month) {
  const params = new URLSearchParams();
  if (year) params.append('year', year);
  if (month) params.append('month', month);
  return fetchAPI(`/reports/revenue?${params}`);
}

export async function fetchDefaulters(minDays = 30) {
  return fetchAPI(`/reports/defaulters?minDays=${minDays}`);
}

export async function fetchTopConsumers(limit = 10, utilityType = null) {
  const params = new URLSearchParams({ limit });
  if (utilityType) params.append('utilityType', utilityType);
  return fetchAPI(`/reports/top-consumers?${params}`);
}

