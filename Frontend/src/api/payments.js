import { apiRequest } from './client'

export async function createOrder(data, token) {
  return apiRequest('/api/payments/create-order', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token)
}

export async function verifyPayment(data, token) {
  return apiRequest('/api/payments/verify', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token)
}

export async function getLandlordPayments(landlordId, token) {
  return apiRequest(`/api/payments/landlord/${landlordId}`, {
    method: 'GET',
  }, token)
}

export async function getTenantPayments(tenantId, token) {
  return apiRequest(`/api/payments/tenant/${tenantId}`, {
    method: 'GET',
  }, token)
}

