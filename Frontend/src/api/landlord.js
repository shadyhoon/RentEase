import { apiRequest } from './client'

/**
 * Get dashboard statistics for landlord.
 * Requires authentication token.
 */
export async function getDashboardStats(token) {
  return apiRequest('/api/landlord/dashboard-stats', {
    method: 'GET',
  }, token)
}

/**
 * Get list of all active tenants for landlord.
 * Requires authentication token.
 */
export async function getTenants(token) {
  return apiRequest('/api/landlord/tenants', {
    method: 'GET',
  }, token)
}

/**
 * Create a new agreement and tenant record.
 * Requires authentication token.
 */
export async function createAgreement(data, token) {
  return apiRequest('/api/landlord/agreements', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token)
}
