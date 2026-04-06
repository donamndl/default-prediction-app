import React from 'react'
import { useForm } from '../../context/FormContext'
import { SelectField, NumberField, YesNoField, RadioField, SectionHeader, FieldGrid } from '../ui/FormFields'

const Step2Residence = () => {
  const { formData, updateField, errors } = useForm()

  return (
    <div className="step-content animate-fade-in">
      <SectionHeader
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        }
        title="Residence Stability"
        subtitle="Details about your current living situation and residential history"
      />

      <div className="fields-wrapper stagger">
        <FieldGrid cols={2}>
          <RadioField
            label="House Ownership"
            name="house_ownership"
            value={formData.house_ownership}
            onChange={updateField}
            error={errors.house_ownership}
            options={[
              { value: 'Owned', label: 'Owned' },
              { value: 'Rented', label: 'Rented' },
            ]}
          />
          <YesNoField
            label="Ownership Proof Validated?"
            name="ownership_proof"
            value={formData.ownership_proof}
            onChange={updateField}
            error={errors.ownership_proof}
          />
        </FieldGrid>

        <FieldGrid cols={2}>
          <NumberField
            label="Residence Stability (Months)"
            name="residence_stability_months"
            value={formData.residence_stability_months}
            onChange={updateField}
            min={0}
            suffix="mo"
            error={errors.residence_stability_months}
            hint="How long at current address?"
          />
          <YesNoField
            label="Stability Proof Validated?"
            name="stability_proof"
            value={formData.stability_proof}
            onChange={updateField}
            error={errors.stability_proof}
          />
        </FieldGrid>

        <FieldGrid cols={2}>
          <NumberField
            label="Residence Changes (Last 2 Years)"
            name="residence_change_count"
            value={formData.residence_change_count}
            onChange={updateField}
            min={0}
            error={errors.residence_change_count}
          />
          <YesNoField
            label="Stays with Family?"
            name="stays_with_family"
            value={formData.stays_with_family}
            onChange={updateField}
            error={errors.stays_with_family}
          />
        </FieldGrid>

        <FieldGrid cols={2}>
          <YesNoField
            label="Residence Location Traceable?"
            name="resi_traceable"
            value={formData.resi_traceable}
            onChange={updateField}
            error={errors.resi_traceable}
          />
          <YesNoField
            label="Residence Photo Available?"
            name="pic_available"
            value={formData.pic_available}
            onChange={updateField}
            error={errors.pic_available}
          />
        </FieldGrid>

        <FieldGrid cols={2}>
          <YesNoField
            label="Entry to House is Easy?"
            name="entry_easy"
            value={formData.entry_easy}
            onChange={updateField}
            error={errors.entry_easy}
          />
          <YesNoField
            label="Shared Accommodation?"
            name="shared_accommodation"
            value={formData.shared_accommodation}
            onChange={updateField}
            error={errors.shared_accommodation}
          />
        </FieldGrid>

        <FieldGrid cols={2}>
          <NumberField
            label="Total Rooms"
            name="total_rooms"
            value={formData.total_rooms}
            onChange={updateField}
            min={1}
            error={errors.total_rooms}
          />
          <NumberField
            label="Floor of Residence"
            name="floor"
            value={formData.floor}
            onChange={updateField}
            min={0}
            hint="Ground floor = 0"
            error={errors.floor}
          />
        </FieldGrid>

        <FieldGrid cols={2}>
          <YesNoField
            label="Lift Available?"
            name="lift_available"
            value={formData.lift_available}
            onChange={updateField}
            error={errors.lift_available}
          />
          <RadioField
            label="Residence Type"
            name="residence_type"
            value={formData.residence_type}
            onChange={updateField}
            error={errors.residence_type}
            options={[
              { value: 'Flat', label: 'Flat' },
              { value: 'Bunglow', label: 'Bungalow' },
              { value: 'Chawl', label: 'Chawl' },
            ]}
          />
        </FieldGrid>

        <FieldGrid cols={1}>
          <YesNoField
            label="Is residence in a Negative Location?"
            name="resi_negative_location"
            value={formData.resi_negative_location}
            onChange={updateField}
            error={errors.resi_negative_location}
            hint="E.g. flood-prone, disputed, or high-risk area"
          />
        </FieldGrid>
      </div>

      <div className="score-preview-card">
        <div className="score-preview-label">Section Weight</div>
        <div className="score-preview-value">105 pts</div>
        <div className="score-preview-bar">
          <div className="score-preview-fill" style={{ width: '30%' }} />
        </div>
        <div className="score-preview-desc">30% of total scorecard</div>
      </div>
    </div>
  )
}

export default Step2Residence