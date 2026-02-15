import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as authApi from '../api/auth'

const AUTH_KEY = 'rentease_auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load stored auth on mount (keeps user logged in after refresh)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.token && parsed?.user?.email && parsed?.user?.role) {
          setToken(parsed.token)
          setUser(parsed.user)
        }
      }
    } catch (_) {
      localStorage.removeItem(AUTH_KEY)
    } finally {
      setLoading(false)
    }
  }, [])

  const persistAuth = useCallback((newToken, newUser) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem(AUTH_KEY, JSON.stringify({ token: newToken, user: newUser }))
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password })
    const { token: t, user: u } = res.data
    persistAuth(t, u)
    return u
  }, [persistAuth])

  const register = useCallback(async (name, email, password, role) => {
    const res = await authApi.register({ name, email, password, role })
    const { token: t, user: u } = res.data
    persistAuth(t, u)
    return u
  }, [persistAuth])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem(AUTH_KEY)
  }, [])

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
