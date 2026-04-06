import React from 'react'
import { useForm } from '../../context/FormContext'
import { YesNoField, SectionHeader, FieldGrid } from '../ui/FormFields'

const Step6Health = () => {
  const { formData, updateField, errors } = useForm()

  return (
    <div className="step-content animate-fade-in">
      <SectionHeader
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        }
        title="Health & Off-Book Liabilities"
        subtitle="Health indicators and informal financial obligations not captured in bureau"
      />

      <div className="fields-wrapper stagger">
        <div className="subsection-label">Off-Book Liabilities</div>

        <FieldGrid cols={2}>
          <YesNoField
            label="Write-Off Instance on Any Account?"
            name="write_off"
            value={formData.write_off}
            onChange={updateField}
            error={errors.write_off}
            hint="Any loan written off by a lender"
          />
          <YesNoField
            label="Loans from Family/Friends (Not in Bureau)?"
            name="informal_loans"
            value={formData.informal_loans}
            onChange={updateField}
            error={errors.informal_loans}
            hint="Informal borrowings not reported to bureau"
          />
        </FieldGrid>

        <div className="subsection-label" style={{ marginTop: '8px' }}>Health Indicators</div>

        <FieldGrid cols={1}>
          <YesNoField
            label="Hospitalisation in Last 2 Years?"
            name="hospitalisation"
            value={formData.hospitalisation}
            onChange={updateField}
            error={errors.hospitalisation}
            hint="Any major medical hospitalisation"
          />
        </FieldGrid>

        <FieldGrid cols={2}>
          <YesNoField
            label="Smoker?"
            name="smoker"
            value={formData.smoker}
            onChange={updateField}
            error={errors.smoker}
          />
          <YesNoField
            label="Regular Drinker?"
            name="drinker"
            value={formData.drinker}
            onChange={updateField}
            error={errors.drinker}
          />
        </FieldGrid>

        <div className="info-callout info-callout-amber">
          <svg viewBox="0 0 16 16" fill="none">
            <path d="M8 2L14.5 13.5H1.5L8 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            <path d="M8 6.5v3.5M8 11.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>Health and lifestyle information is used solely for credit risk assessment as per RBI guidelines.</span>
        </div>
      </div>

      <div className="score-preview-card">
        <div className="score-preview-label">Section Weight</div>
        <div className="score-preview-value">25 pts</div>
        <div className="score-preview-bar">
          <div className="score-preview-fill" style={{ width: '7.1%' }} />
        </div>
        <div className="score-preview-desc">7.1% of total scorecard</div>
      </div>
    </div>
  )
}

export default Step6Health