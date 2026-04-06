import React from 'react'

const steps = [
  { id: 1, label: 'Family', icon: '👨‍👩‍👧' },
  { id: 2, label: 'Residence', icon: '🏠' },
  { id: 3, label: 'Office', icon: '🏢' },
  { id: 4, label: 'Banking', icon: '🏦' },
  { id: 5, label: 'Bureau', icon: '📊' },
  { id: 6, label: 'Health', icon: '🏥' },
  { id: 7, label: 'Caution', icon: '🛡️' },
]

const StepProgress = ({ currentStep, onStepClick }) => {
  return (
    <div className="progress-container">
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${((currentStep - 1) / 6) * 100}%` }}
        />
      </div>
      <div className="progress-steps">
        {steps.map(step => {
          const isComplete = currentStep > step.id
          const isActive = currentStep === step.id
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => isComplete && onStepClick(step.id)}
              className={`progress-step ${isActive ? 'step-active' : ''} ${isComplete ? 'step-complete' : ''}`}
              disabled={!isComplete && !isActive}
              title={step.label}
            >
              <div className="step-bubble">
                {isComplete
                  ? <svg viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : <span className="step-num">{step.id}</span>
                }
              </div>
              <span className="step-label">{step.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default StepProgress