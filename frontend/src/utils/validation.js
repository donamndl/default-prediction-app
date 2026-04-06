export const stepValidationRules = {
  1: ['marital_status', 'total_members', 'pct_earning_members', 'spouse_working', 'total_dependents'],
  2: ['house_ownership', 'ownership_proof', 'residence_stability_months', 'stability_proof',
      'residence_change_count', 'stays_with_family', 'resi_traceable', 'pic_available',
      'entry_easy', 'shared_accommodation', 'total_rooms', 'floor', 'lift_available',
      'residence_type', 'resi_negative_location'],
  3: ['employment_type', 'job_changes', 'office_traceable', 'office_building_type',
      'office_entry_easy', 'office_negative_location'],
  4: ['inward_returns', 'utility_via_bank', 'uniform_utility_payment', 'bank_transactions',
      'salary_credit_bank', 'uniform_credit', 'total_credits', 'pct_cash_deposit',
      'intra_group', 'abb_to_emi', 'avg_credit_to_emi'],
  5: ['enquiries_6m', 'bureau_score', 'sma_status', 'dpd_instance'],
  6: ['write_off', 'informal_loans', 'hospitalisation', 'smoker', 'drinker'],
  7: ['criminal_history', 'prosecution', 'rbi_defaulter', 'un_list', 'tax_default', 'political_association'],
}

export const validateStep = (step, formData) => {
  const fields = stepValidationRules[step] || []
  const errors = {}
  fields.forEach(field => {
    const val = formData[field]
    if (val === '' || val === null || val === undefined) {
      errors[field] = 'This field is required'
    }
  })
  return errors
}