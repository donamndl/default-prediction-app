import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

// Attach token to every request automatically
const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete axios.defaults.headers.common['Authorization']
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)       // { id, name, email }
  const [token, setToken]     = useState(null)
  const [loading, setLoading] = useState(true)       // checking localStorage on mount

  // ── Restore session from localStorage on first load ──
  useEffect(() => {
    const saved = localStorage.getItem('cs-auth')
    if (saved) {
      try {
        const { user, token } = JSON.parse(saved)
        setUser(user)
        setToken(token)
        setAuthHeader(token)
      } catch (_) {
        localStorage.removeItem('cs-auth')
      }
    }
    setLoading(false)
  }, [])

  // ── Save session to localStorage whenever it changes ──
  useEffect(() => {
    if (user && token) {
      localStorage.setItem('cs-auth', JSON.stringify({ user, token }))
      setAuthHeader(token)
    } else {
      localStorage.removeItem('cs-auth')
      setAuthHeader(null)
    }
  }, [user, token])

  // ── Register ──
  const register = async ({ name, email, password }) => {
    const res = await axios.post('/api/auth/register', { name, email, password })
    const data = res.data
    setUser(data.user)
    setToken(data.token)
    return data
  }

  // ── Login ──
  const login = async ({ email, password }) => {
    const res = await axios.post('/api/auth/login', { email, password })
    const data = res.data
    setUser(data.user)
    setToken(data.token)
    return data
  }

  // ── Logout ──
  const logout = () => {
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}