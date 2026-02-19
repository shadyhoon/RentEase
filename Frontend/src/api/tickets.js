import { apiRequest } from './client'

export async function createTicket(body, token) {
  return apiRequest('/api/tickets', {
    method: 'POST',
    body: JSON.stringify(body),
  }, token)
}

export async function getTickets(token) {
  return apiRequest('/api/tickets', { method: 'GET' }, token)
}

export async function resolveTicket(id, token) {
  return apiRequest(`/api/tickets/${id}/resolve`, { method: 'PATCH' }, token)
}

export async function approveTicket(id, token) {
  return apiRequest(`/api/tickets/${id}/approve`, { method: 'PATCH' }, token)
}

export async function clearTicket(id, token) {
  return apiRequest(`/api/tickets/${id}/clear`, { method: 'PATCH' }, token)
}
