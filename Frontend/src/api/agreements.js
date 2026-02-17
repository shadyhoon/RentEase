import { apiRequest } from './client'

export async function approveAgreement(agreementId, token) {
  return apiRequest(`/api/agreements/${agreementId}/approve`, { method: 'POST' }, token)
}

export async function getMyAgreements({ status = 'approved' } = {}, token) {
  const q = status ? `?status=${encodeURIComponent(status)}` : ''
  return apiRequest(`/api/agreements/my${q}`, { method: 'GET' }, token)
}

export async function getLandlordAgreements(token) {
  return apiRequest('/api/agreements/landlord', { method: 'GET' }, token)
}

