import api from './axios'
export const getAnalytics = ()   => api.get('/admin/analytics')
export const getAllUsers   = ()   => api.get('/admin/users')
export const getItStaff   = ()   => api.get('/admin/staff')
export const toggleUser   = (id) => api.patch(`/admin/users/${id}/toggle`)
