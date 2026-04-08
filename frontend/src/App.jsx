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
   If user is not logged in → redirect to /login
   If still checking localStorage (loading) → show nothing
──────────────────────────────────────────────────────────────────────── */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return null          // avoid flash of wrong page
  if (!user)   return <Navigate to="/login" replace />
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
            {/* Public: login / register */}
            <Route path="/login"    element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />

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