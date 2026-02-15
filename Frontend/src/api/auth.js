import { apiRequest } from './client'

/** Register: name, email, password, role. Returns { data: { token, user } }. */
export async function register(body) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/** Login: email, password. Returns { data: { token, user } }. */
export async function login(body) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
