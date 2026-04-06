import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

export const submitApplication = async (formData) => {
  // Cast numeric fields
  const payload = {
    ...formData,
    total_members: Number(formData.total_members),
    pct_earning_members: Number(formData.pct_earning_members),
    total_dependents: Number(formData.total_dependents),
    residence_stability_months: Number(formData.residence_stability_months),
    residence_change_count: Number(formData.residence_change_count),
    total_rooms: Number(formData.total_rooms),
    floor: Number(formData.floor),
    job_changes: Number(formData.job_changes),
    inward_returns: Number(formData.inward_returns),
    total_credits: Number(formData.total_credits),
    pct_cash_deposit: Number(formData.pct_cash_deposit),
    abb_to_emi: Number(formData.abb_to_emi),
    avg_credit_to_emi: Number(formData.avg_credit_to_emi),
    enquiries_6m: Number(formData.enquiries_6m),
    bureau_score: Number(formData.bureau_score),
  }
  const res = await api.post('/predict', payload)
  return res.data
}

export const getApplications = async () => {
  const res = await api.get('/applications')
  return res.data
}