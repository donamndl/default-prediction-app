import React from 'react'
import { useForm } from '../../context/FormContext'
import { NumberField, YesNoField, RadioField, SectionHeader, FieldGrid } from '../ui/FormFields'

const Step3Office = () => {
  const { formData, updateField, errors } = useForm()

  return (
    <div className="step-content animate-fade-in">
      <SectionHeader
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
          </svg>
        }
        title="Office Stability"
        subtitle="Employment details and workplace information"
      />

      <div className="fields-wrapper stagger">
        <FieldGrid cols={2}>
          <RadioField
            label="Employment Type"
            name="employment_type"
            value={formData.employment_type}
            onChange={updateField}
            error={errors.employment_type}
            options={[
              { value: 'Permanent', label: 'Permanent' },
              { value: 'Contractual', label: 'Contractual' },
            ]}
          />
          <NumberField
            label="Job Changes (Last 2 Years)"
            name="job_changes"
            value={formData.job_changes}
            onChange={updateField}
            min={0}
            error={errors.job_changes}
          />
        </FieldGrid>

        <FieldGrid cols={2}>
          <YesNoField
            label="Office Location Traceable?"
            name="office_traceable"
            value={formData.office_traceable}
            onChange={updateField}
            error={errors.office_traceable}
          />
          <YesNoField
            label="Entry to Office is Easy?"
            name="office_entry_easy"
            value={formData.office_entry_easy}
            onChange={updateField}
            error={errors.office_entry_easy}
          />
        </FieldGrid>

        <FieldGrid cols={1}>
          <RadioField
            label="Type of Office Building"
            name="office_building_type"
            value={formData.office_building_type}
            onChange={updateField}
            error={errors.office_building_type}
            options={[
              { value: 'Commercial Complex', label: 'Commercial Complex' },
              { value: 'Factory', label: 'Factory' },
              { value: 'office', label: 'Regular Office' },
            ]}
          />
        </FieldGrid>

        <FieldGrid cols={1}>
          <YesNoField
            label="Is Office in a Negative Location?"
            name="office_negative_location"
            value={formData.office_negative_location}
            onChange={updateField}
            error={errors.office_negative_location}
            hint="E.g. industrial hazard zone, disputed area"
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

export default Step3Office