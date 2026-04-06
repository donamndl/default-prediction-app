import React from 'react'
import { useForm } from '../../context/FormContext'
import { SelectField, NumberField, YesNoField, RadioField, SectionHeader, FieldGrid } from '../ui/FormFields'

const Step1Family = () => {
  const { formData, updateField, errors } = useForm()

  return (
    <div className="step-content animate-fade-in">
      <SectionHeader
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
        title="Family Details"
        subtitle="Tell us about your household composition and family structure"
      />

      <div className="fields-wrapper stagger">
        <FieldGrid cols={2}>
          <RadioField
            label="Marital Status"
            name="marital_status"
            value={formData.marital_status}
            onChange={updateField}
            error={errors.marital_status}
            options={[
              { value: 'Married', label: 'Married' },
              { value: 'Unmarried', label: 'Unmarried' },
              { value: 'Divorcee', label: 'Divorcee' },
              { value: 'Widow', label: 'Widow/Widower' },
            ]}
          />

          <NumberField
            label="Total Members in Family"
            name="total_members"
            value={formData.total_members}
            onChange={updateField}
            min={1}
            max={30}
            error={errors.total_members}
            hint="(Including yourself)"
          />
        </FieldGrid>

        <FieldGrid cols={2}>
          <NumberField
            label="Earning Members (%)"
            name="pct_earning_members"
            value={formData.pct_earning_members}
            onChange={updateField}
            min={0}
            max={100}
            suffix="%"
            error={errors.pct_earning_members}
            hint="Percentage of members with income"
          />

          <YesNoField
            label="Is Spouse Working?"
            name="spouse_working"
            value={formData.spouse_working}
            onChange={updateField}
            error={errors.spouse_working}
            hint="If married, is spouse employed?"
          />
        </FieldGrid>

        <FieldGrid cols={1}>
          <NumberField
            label="Total Number of Dependents"
            name="total_dependents"
            value={formData.total_dependents}
            onChange={updateField}
            min={0}
            max={20}
            error={errors.total_dependents}
            hint="Family members financially dependent on you"
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

export default Step1Family