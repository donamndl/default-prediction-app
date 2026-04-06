import React, { createContext, useContext, useState } from 'react'

const FormContext = createContext(null)

export const useForm = () => {
  const ctx = useContext(FormContext)
  if (!ctx) throw new Error('useForm must be used within FormProvider')
  return ctx
}

const initialData = {
  // Step 1: Family Details
  marital_status: '',
  total_members: '',
  pct_earning_members: '',
  spouse_working: '',
  total_dependents: '',

  // Step 2: Residence Stability
  house_ownership: '',
  ownership_proof: '',
  residence_stability_months: '',
  stability_proof: '',
  residence_change_count: '',
  stays_with_family: '',
  resi_traceable: '',
  pic_available: '',
  entry_easy: '',
  shared_accommodation: '',
  total_rooms: '',
  floor: '',
  lift_available: '',
  residence_type: '',
  resi_negative_location: '',

  // Step 3: Office Stability
  employment_type: '',
  job_changes: '',
  office_traceable: '',
  office_building_type: '',
  office_entry_easy: '',
  office_negative_location: '',

  // Step 4: Banking
  inward_returns: '',
  utility_via_bank: '',
  uniform_utility_payment: '',
  bank_transactions: '',
  salary_credit_bank: '',
  uniform_credit: '',
  total_credits: '',
  pct_cash_deposit: '',
  intra_group: '',
  abb_to_emi: '',
  avg_credit_to_emi: '',

  // Step 5: Bureau
  enquiries_6m: '',
  bureau_score: '',
  sma_status: '',
  dpd_instance: '',

  // Step 6: Health & Off-Book
  write_off: '',
  informal_loans: '',
  hospitalisation: '',
  smoker: '',
  drinker: '',

  // Step 7: Caution Profile
  criminal_history: '',
  prosecution: '',
  rbi_defaulter: '',
  un_list: '',
  tax_default: '',
  political_association: '',
}

export const FormProvider = ({ children }) => {
  const [formData, setFormData] = useState(initialData)
  const [currentStep, setCurrentStep] = useState(1)
  const [result, setResult] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const updateSection = (sectionData) => {
    setFormData(prev => ({ ...prev, ...sectionData }))
  }

  const goToStep = (step) => {
    setCurrentStep(step)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const nextStep = () => goToStep(Math.min(currentStep + 1, 8))
  const prevStep = () => goToStep(Math.max(currentStep - 1, 1))

  const resetForm = () => {
    setFormData(initialData)
    setCurrentStep(1)
    setResult(null)
    setErrors({})
  }

  return (
    <FormContext.Provider value={{
      formData, updateField, updateSection,
      currentStep, goToStep, nextStep, prevStep,
      result, setResult,
      isSubmitting, setIsSubmitting,
      errors, setErrors,
      resetForm
    }}>
      {children}
    </FormContext.Provider>
  )
}