import React, { useState, useEffect, createContext, useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { FormProvider } from './context/FormContext'
import FormContainer from './pages/FormContainer'
import './App.css'

export const ThemeContext = createContext(null)
export const useTheme = () => useContext(ThemeContext)

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('cs-theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('cs-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <FormProvider>
        <Routes>
          <Route path="/" element={<FormContainer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </FormProvider>
    </ThemeContext.Provider>
  )
}

export default App