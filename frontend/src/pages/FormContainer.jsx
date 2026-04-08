import React from 'react'
import { useForm } from '../context/FormContext'
import { validateStep } from '../utils/validation'
import { submitApplication } from '../utils/api'
import { useTheme } from '../App'
import { useAuth } from '../context/AuthContext'
import StepProgress from '../components/ui/StepProgress'
import Step1Family from '../components/forms/Step1Family'
import Step2Residence from '../components/forms/Step2Residence'
import Step3Office from '../components/forms/Step3Office'
import Step4Banking from '../components/forms/Step4Banking'
import Step5Bureau from '../components/forms/Step5Bureau'
import Step6Health from '../components/forms/Step6Health'
import Step7Caution from '../components/forms/Step7Caution'
import ResultsPage from './ResultsPage'

const STEP_COMPONENTS = {
  1: Step1Family,
  2: Step2Residence,
  3: Step3Office,
  4: Step4Banking,
  5: Step5Bureau,
  6: Step6Health,
  7: Step7Caution,
}

const STEP_TITLES = {
  1: 'Family Details',
  2: 'Residence Stability',
  3: 'Office Stability',
  4: 'Banking Details',
  5: 'Bureau & Credit',
  6: 'Health & Off-Book',
  7: 'Caution Profile',
}

const FormContainer = () => {
  const {
    currentStep, nextStep, prevStep, goToStep,
    formData, setErrors, errors,
    result, setResult,
    isSubmitting, setIsSubmitting
  } = useForm()

  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()

  if (result) return <ResultsPage />

  const StepComponent = STEP_COMPONENTS[currentStep]
  const isLastStep = currentStep === 7

  const handleNext = async () => {
    const stepErrors = validateStep(currentStep, formData)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      // Scroll to first error
      setTimeout(() => {
        const el = document.querySelector('.field-error-msg')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
      return
    }
    setErrors({})

    if (isLastStep) {
      setIsSubmitting(true)
      try {
        const data = await submitApplication(formData)
        setResult(data)
      } catch (err) {
        console.error('Submission error:', err)
        alert('Failed to submit. Please ensure the backend server is running on port 5000.')
      } finally {
        setIsSubmitting(false)
      }
    } else {
      nextStep()
    }
  }

  return (
    <div className="form-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#logoGrad)"/>
              <path d="M8 22l6-10 4 6 3-4 5 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0%" stopColor="#3d6aff"/>
                  <stop offset="100%" stopColor="#00d4ff"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <div className="logo-name">CreditSense</div>
            <div className="logo-tagline">Retail Scorecard</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {Object.entries(STEP_TITLES).map(([num, title]) => {
            const step = Number(num)
            const isActive = currentStep === step
            const isComplete = currentStep > step
            return (
              <button
                key={step}
                type="button"
                onClick={() => isComplete && goToStep(step)}
                className={`nav-item ${isActive ? 'nav-active' : ''} ${isComplete ? 'nav-complete' : ''}`}
                disabled={!isComplete && !isActive}
              >
                <div className="nav-step-num">
                  {isComplete
                    ? <svg viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : step
                  }
                </div>
                <span className="nav-step-title">{title}</span>
                {isActive && <div className="nav-active-dot" />}
              </button>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-progress-label">
            <span>Overall Progress</span>
            <span>{Math.round(((currentStep - 1) / 7) * 100)}%</span>
          </div>
          <div className="sidebar-progress-bar">
            <div className="sidebar-progress-fill" style={{ width: `${((currentStep - 1) / 7) * 100}%` }} />
          </div>
          <div className="sidebar-score-note">Total Scorecard: 350 pts</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="form-main">
        {/* Top bar */}
        <div className="form-topbar">
          <div className="topbar-row">
            <div className="topbar-step-info">
              <span className="topbar-step-num">Step {currentStep} of 7</span>
              <h1 className="topbar-step-title">{STEP_TITLES[currentStep]}</h1>
            </div>
            <div className="topbar-actions">
              {/* Theme toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="theme-toggle-btn"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="12" cy="12" r="4"/>
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                  </svg>
                )}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>

              {/* User chip */}
              {user && (
                <div className="topbar-user-chip">
                  <div className="topbar-avatar">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="topbar-username">{user.name}</span>
                  <button
                    type="button"
                    className="topbar-logout-btn"
                    onClick={logout}
                    title="Sign out"
                  >
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M13 7l3 3m0 0l-3 3m3-3H8m4-7H5a2 2 0 00-2 2v10a2 2 0 002 2h7"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="topbar-mobile-progress">
            <StepProgress currentStep={currentStep} onStepClick={goToStep} />
          </div>
        </div>

        {/* Form content */}
        <div className="form-body">
          <StepComponent key={currentStep} />
        </div>

        {/* Navigation footer */}
        <div className="form-footer">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="btn-prev"
          >
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>

          <div className="footer-step-dots">
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className={`step-dot ${i + 1 === currentStep ? 'dot-active' : ''} ${i + 1 < currentStep ? 'dot-done' : ''}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className={`btn-next ${isLastStep ? 'btn-submit' : ''}`}
          >
            {isSubmitting ? (
              <>
                <span className="spinner" />
                Analysing...
              </>
            ) : isLastStep ? (
              <>
                Submit & Analyse
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="M4 10h12M12 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            ) : (
              <>
                Continue
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="M4 10h12M12 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  )
}

export default FormContainer