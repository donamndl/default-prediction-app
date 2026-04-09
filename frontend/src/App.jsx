import React, { useState, useEffect, createContext, useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { FormProvider } from './context/FormContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import FormContainer from './pages/FormContainer'
import AuthPage from './pages/AuthPage'
import './App.css'
import "./pages/Auth.css";

export const ThemeContext = createContext(null)
export const useTheme = () => useContext(ThemeContext)

/* ─── Protected Route ─────────────────────────────────────────────────
   Guards the form page — if not logged in, send to /login
──────────────────────────────────────────────────────────────────────── */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user)   return <Navigate to="/login" replace />
  return children
}

/* ─── Public Route ────────────────────────────────────────────────────
   Guards login/register — if already logged in, send to /
──────────────────────────────────────────────────────────────────────── */
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user)    return <Navigate to="/" replace />
  return children
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('cs-theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('cs-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthProvider>
        <FormProvider>
          <Routes>
            {/* Public: login / register — redirect to / if already logged in */}
            <Route path="/login"    element={<PublicRoute><AuthPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><AuthPage /></PublicRoute>} />

            {/* Protected: form — only accessible after login */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <FormContainer />
                </ProtectedRoute>
              }
            />

            {/* Catch-all → login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </FormProvider>
      </AuthProvider>
    </ThemeContext.Provider>
  )
}

export default App