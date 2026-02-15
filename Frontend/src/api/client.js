/**
 * Base URL for the backend API. Set VITE_API_URL in .env (e.g. http://localhost:5000).
 */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * Request helper: sends JSON and reads JSON. Attaches Authorization header if token is provided.
 */
export async function apiRequest(endpoint, options = {}, token = null) {
  const url = `${API_BASE}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(url, {
    ...options,
    headers,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.message || 'Request failed')
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}
