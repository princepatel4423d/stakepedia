import api from './index'

export const profileApi = {
  get:            ()     => api.get('/profile'),
  update:         (data) => api.put('/profile', data),
  updateAvatar:   (formData) => api.patch('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  changePassword: (data) => api.patch('/profile/change-password', data),
  getSavedTools:  ()     => api.get('/profile/saved-tools'),
  getActivity:    ()     => api.get('/profile/activity'),
}