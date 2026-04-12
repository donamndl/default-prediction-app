import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete axios.defaults.headers.common['Authorization']
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(null)
  const [loading, setLoading] = useState(true)

  // ── Restore session from localStorage ──
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

  // ── Persist session to localStorage ──
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
    const res  = await axios.post('/api/auth/register', { name, email, password })
    const data = res.data
    setUser(data.user)
    setToken(data.token)
    return data
  }

  // ── Login ──
  const login = async ({ email, password }) => {
    const res  = await axios.post('/api/auth/login', { email, password })
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

  // ── Update profile (name, email, phone, organisation, role) ──
  const updateProfile = async (profileData) => {
    const res  = await axios.put('/api/auth/profile', profileData)
    const data = res.data
    // Merge updated fields back into user state so UI reflects instantly
    setUser(prev => ({ ...prev, ...data.user }))
    // Persist merged user to localStorage
    localStorage.setItem('cs-auth', JSON.stringify({ user: { ...user, ...data.user }, token }))
    return data
  }

  // ── Change password ──
  const updatePassword = async ({ current_password, new_password }) => {
    const res = await axios.put('/api/auth/password', { current_password, new_password })
    return res.data
  }

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout,
      updateProfile, updatePassword,
    }}>
      {children}
    </AuthContext.Provider>
  )
}