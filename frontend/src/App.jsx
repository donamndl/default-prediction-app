import React, { useState, useEffect, createContext, useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { FormProvider } from './context/FormContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import FormContainer from './pages/FormContainer'
import AuthPage from './pages/AuthPage'
import './App.css'
import "./pages/Auth.css"
import './pages/Dashboard.css'
import Dashboard from "./pages/Dashboard";

export const ThemeContext = createContext(null)
export const useTheme = () => useContext(ThemeContext)
 
/* ── Protected: must be logged in ── */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user)   return <Navigate to="/login" replace />
  return children
}
 
/* ── Public: redirect away if already logged in ── */
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user)    return <Navigate to="/dashboard" replace />
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
            {/* Public — bounce to /dashboard if logged in */}
            <Route path="/login"    element={<PublicRoute><AuthPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><AuthPage /></PublicRoute>} />
 
            {/* Protected — dashboard (first screen after login) */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 
            {/* Protected — 7-step assessment form */}
            <Route path="/form"      element={<ProtectedRoute><FormContainer /></ProtectedRoute>} />
 
            {/* / → dashboard if logged in, else /login */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
 
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </FormProvider>
      </AuthProvider>
    </ThemeContext.Provider>
  )
}
 
export default App