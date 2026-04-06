import React from 'react'
import { useForm } from '../../context/FormContext'
import { NumberField, YesNoField, SectionHeader, FieldGrid } from '../ui/FormFields'

const Step5Bureau = () => {
  const { formData, updateField, errors } = useForm()

  const bureauScore = Number(formData.bureau_score)
  const getBureauColor = () => {
    if (bureauScore >= 750) return '#00e5a0'
    if (bureauScore >= 650) return '#3d6aff'
    if (bureauScore >= 500) return '#ffb020'
    if (bureauScore > 0) return '#ff4d6a'
    return '#4a5568'
  }
  const getBureauLabel = () => {
    if (bureauScore >= 750) return 'Excellent'
    if (bureauScore >= 650) return 'Good'
    if (bureauScore >= 500) return 'Fair'
    if (bureauScore >= 300) return 'Poor'
    if (bureauScore === -1 || bureauScore === 0) return 'No History'
    return '—'
  }

  return (
    <div className="step-content animate-fade-in">
      <SectionHeader
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        }
        title="Bureau & Credit Score"
        subtitle="Credit history, bureau score and loan repayment track record"
      />

      <div className="fields-wrapper stagger">
        <FieldGrid cols={1}>
          <NumberField
            label="Bureau/CIBIL Score"
            name="bureau_score"
            value={formData.bureau_score}
            onChange={updateField}
            min={-1}
            max={900}
            error={errors.bureau_score}
            hint="Enter -1 if no bureau history exists (NH/NA)"
          />
        </FieldGrid>

        {formData.bureau_score !== '' && (
          <div className="bureau-score-display animate-scale-in">
            <div className="bureau-gauge">
              <div className="bureau-score-num" style={{ color: getBureauColor() }}>
                {formData.bureau_score === '-1' || formData.bureau_score === -1 ? 'N/A' : formData.bureau_score}
              </div>
              <div className="bureau-score-label" style={{ color: getBureauColor() }}>
                {getBureauLabel()}
              </div>
            </div>
            <div className="bureau-range-bar">
              <div className="bureau-range-fill" style={{
                width: bureauScore > 0 ? `${((bureauScore - 300) / 600) * 100}%` : '0%',
                background: getBureauColor()
              }} />
              <div className="bureau-range-ticks">
                {[300, 500, 650, 750, 900].map(v => (
                  <span key={v}>{v}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        <FieldGrid cols={1}>
          <NumberField
            label="Total Enquiries (Last 6 Months)"
            name="enquiries_6m"
            value={formData.enquiries_6m}
            onChange={updateField}
            min={0}
            error={errors.enquiries_6m}
            hint="Number of hard credit enquiries"
          />
        </FieldGrid>

        <FieldGrid cols={2}>
          <YesNoField
            label="SMA Status in Any Account?"
            name="sma_status"
            value={formData.sma_status}
            onChange={updateField}
            error={errors.sma_status}
            hint="Special Mention Account flag"
          />
          <YesNoField
            label="DPD Instance Present?"
            name="dpd_instance"
            value={formData.dpd_instance}
            onChange={updateField}
            error={errors.dpd_instance}
            hint="Days Past Due on any existing loan"
          />
        </FieldGrid>
      </div>

      <div className="score-preview-card">
        <div className="score-preview-label">Section Weight</div>
        <div className="score-preview-value">40 pts</div>
        <div className="score-preview-bar">
          <div className="score-preview-fill" style={{ width: '11.4%' }} />
        </div>
        <div className="score-preview-desc">11.4% of total scorecard</div>
      </div>
    </div>
  )
}

export default Step5Bureau