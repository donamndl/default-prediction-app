import React from 'react'
import { useForm } from '../../context/FormContext'
import { YesNoField, SectionHeader, FieldGrid } from '../ui/FormFields'

const Step7Caution = () => {
  const { formData, updateField, errors } = useForm()

  return (
    <div className="step-content animate-fade-in">
      <SectionHeader
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
          </svg>
        }
        title="Caution Profile"
        subtitle="Legal, regulatory, and compliance background verification"
      />

      <div className="fields-wrapper stagger">
        <div className="caution-warning-banner">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <div>
            <strong>Confidential Section</strong>
            <p>This information is verified against regulatory databases and is strictly confidential.</p>
          </div>
        </div>

        <div className="subsection-label">Legal History</div>
        <FieldGrid cols={2}>
          <YesNoField
            label="Any Criminal History?"
            name="criminal_history"
            value={formData.criminal_history}
            onChange={updateField}
            error={errors.criminal_history}
          />
          <YesNoField
            label="Any Prosecution Pending?"
            name="prosecution"
            value={formData.prosecution}
            onChange={updateField}
            error={errors.prosecution}
          />
        </FieldGrid>

        <div className="subsection-label">Regulatory Checks</div>
        <FieldGrid cols={2}>
          <YesNoField
            label="Name in RBI Defaulter List?"
            name="rbi_defaulter"
            value={formData.rbi_defaulter}
            onChange={updateField}
            error={errors.rbi_defaulter}
          />
          <YesNoField
            label="Name in UN Security Council List?"
            name="un_list"
            value={formData.un_list}
            onChange={updateField}
            error={errors.un_list}
            hint="UNSC Consolidated Sanctions List"
          />
        </FieldGrid>

        <FieldGrid cols={2}>
          <YesNoField
            label="Tax Default History?"
            name="tax_default"
            value={formData.tax_default}
            onChange={updateField}
            error={errors.tax_default}
            hint="Income tax or GST defaults"
          />
          <YesNoField
            label="Political Association?"
            name="political_association"
            value={formData.political_association}
            onChange={updateField}
            error={errors.political_association}
            hint="Politically Exposed Person (PEP)"
          />
        </FieldGrid>
      </div>

      <div className="score-preview-card">
        <div className="score-preview-label">Section Weight</div>
        <div className="score-preview-value">30 pts</div>
        <div className="score-preview-bar">
          <div className="score-preview-fill" style={{ width: '8.6%' }} />
        </div>
        <div className="score-preview-desc">8.6% of total scorecard</div>
      </div>
    </div>
  )
}

export default Step7Caution