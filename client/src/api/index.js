import api from './axios.js'

export const login    = (d) => api.post('/auth/login', d)
export const register = (d) => api.post('/auth/register', d)
export const verifyEmail = (token) => api.post('/auth/verify-email', { token })
export const resendVerification = (email) => api.post('/auth/resend-verification', { email })
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email })
export const resetPassword = (token, password) => api.post('/auth/reset-password', { token, password })
export const getMe    = ()  => api.get('/auth/me')
export const changePassword = (d) => api.patch('/auth/change-password', d)

export const getAllMaterials  = ()     => api.get('/materials/all')
export const getMaterial      = (id)   => api.get(`/materials/${id}`)
export const uploadMaterial   = (form) => api.post('/materials', form, {headers:{'Content-Type':'multipart/form-data'}})
// export const trackDownload    = (id)   => api.patch(`/materials/${id}/download`)
export const trackDownload = (id) => api.patch(`/materials/${id}/download`)
export const serveFile     = (id) => `/api/materials/${id}/serve`

export const upvoteMaterial   = (id)   => api.patch(`/materials/${id}/upvote`)
export const flagMaterial     = (id,r) => api.post(`/materials/${id}/flag`,{reason:r})
export const deleteMaterial   = (id)   => api.delete(`/materials/${id}`)
export const getGaps          = (p)    => api.get('/materials/gaps',{params:p})

export const getSubjects      = (p)    => api.get('/subjects',{params:p})
export const createSubject    = (d)    => api.post('/subjects',d)
export const deleteSubject    = (id)   => api.delete(`/subjects/${id}`)

export const getLeaderboard   = ()     => api.get('/users/leaderboard')
export const getMyUploads     = ()     => api.get('/users/my-uploads')
export const getSaved         = ()     => api.get('/users/saved')
export const saveMaterial     = (id)   => api.post(`/users/save/${id}`)
export const updateProfile    = (d)    => api.patch('/users/profile',d)
export const getDirectoryBatches = ()  => api.get('/users/directory/batches')
export const getDirectoryBatch = (batch) => api.get(`/users/directory/batches/${encodeURIComponent(batch)}`)

export const adminStats       = ()     => api.get('/admin/stats')
export const adminFlagged     = ()     => api.get('/admin/flagged')
export const adminUnflag      = (id)   => api.patch(`/admin/unflag/${id}`)
export const adminUsers       = ()     => api.get('/admin/users')
export const adminSetRole     = (id,r) => api.patch(`/admin/users/${id}/role`,{role:r})
