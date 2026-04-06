import React from 'react'
import { useForm } from '../../context/FormContext'
import { NumberField, YesNoField, SectionHeader, FieldGrid } from '../ui/FormFields'

const Step4Banking = () => {
  const { formData, updateField, errors } = useForm()

  return (
    <div className="step-content animate-fade-in">
      <SectionHeader
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
          </svg>
        }
        title="Banking Details"
        subtitle="Your banking behaviour, transaction patterns, and account activity"
      />

      <div className="fields-wrapper stagger">
        <FieldGrid cols={2}>
          <NumberField
            label="Inward Returns (Last 12 Months)"
            name="inward_returns"
            value={formData.inward_returns}
            onChange={updateField}
            min={0}
            error={errors.inward_returns}
            hint="Cheque/NACH bounces"
          />
          <YesNoField
            label="Utility Bills Paid Through Bank?"
            name="utility_via_bank"
            value={formData.utility_via_bank}
            onChange={updateField}
            error={errors.utility_via_bank}
          />
        </FieldGrid>

        <FieldGrid cols={2}>
          <YesNoField
            label="Uniform Utility Payment Across Months?"
            name="uniform_utility_payment"
            value={formData.uniform_utility_payment}
            onChange={updateField}
            error={errors.uniform_utility_payment}
          />
          <YesNoField
            label="Regular Transactions Through Bank?"
            name="bank_transactions"
            value={formData.bank_transactions}
            onChange={updateField}
            error={errors.bank_transactions}
          />
        </FieldGrid>

        <FieldGrid cols={2}>
          <YesNoField
            label="Salary Credited to Bank?"
            name="salary_credit_bank"
            value={formData.salary_credit_bank}
            onChange={updateField}
            error={errors.salary_credit_bank}
          />
          <YesNoField
            label="Uniform Credit for Last 12 Months?"
            name="uniform_credit"
            value={formData.uniform_credit}
            onChange={updateField}
            error={errors.uniform_credit}
          />
        </FieldGrid>

        <FieldGrid cols={2}>
          <NumberField
            label="Total Credits (Last 12 Months)"
            name="total_credits"
            value={formData.total_credits}
            onChange={updateField}
            min={0}
            error={errors.total_credits}
            hint="Number of credit entries"
          />
          <NumberField
            label="Cash Deposit to Total Deposit (%)"
            name="pct_cash_deposit"
            value={formData.pct_cash_deposit}
            onChange={updateField}
            min={0}
            max={100}
            suffix="%"
            error={errors.pct_cash_deposit}
          />
        </FieldGrid>

        <FieldGrid cols={1}>
          <YesNoField
            label="Intra-Group Transactions Present?"
            name="intra_group"
            value={formData.intra_group}
            onChange={updateField}
            error={errors.intra_group}
            hint="Transactions within related group companies"
          />
        </FieldGrid>

        <div className="info-callout">
          <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2"/><path d="M8 7v5M8 5.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <span>EMI ratio fields — enter the multiplier (e.g. 3.5 means 3.5× the proposed EMI)</span>
        </div>

        <FieldGrid cols={2}>
          <NumberField
            label="Avg Bank Balance (ABB) to EMI Ratio"
            name="abb_to_emi"
            value={formData.abb_to_emi}
            onChange={updateField}
            min={0}
            step={0.1}
            suffix="×"
            error={errors.abb_to_emi}
            hint="ABB ÷ Proposed EMI"
          />
          <NumberField
            label="Avg Credit to EMI Ratio"
            name="avg_credit_to_emi"
            value={formData.avg_credit_to_emi}
            onChange={updateField}
            min={0}
            step={0.1}
            suffix="×"
            error={errors.avg_credit_to_emi}
            hint="Avg monthly credit ÷ Proposed EMI"
          />
        </FieldGrid>
      </div>

      <div className="score-preview-card">
        <div className="score-preview-label">Section Weight</div>
        <div className="score-preview-value">80 pts</div>
        <div className="score-preview-bar">
          <div className="score-preview-fill" style={{ width: '22.8%' }} />
        </div>
        <div className="score-preview-desc">22.8% of total scorecard</div>
      </div>
    </div>
  )
}

export default Step4Banking