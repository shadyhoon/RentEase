import { apiRequest } from './client'

export async function getMyNotifications(token) {
  return apiRequest('/api/tenant/notifications', { method: 'GET' }, token)
}

