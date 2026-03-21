import api from './index'
export const settingsApi = {
  get:               ()     => api.get('/admin/settings'),
  update:            (data) => api.put('/admin/settings', data),
  updateLogo:        (data) => api.patch('/admin/settings/logo', data),
  updateFavicon:     (data) => api.patch('/admin/settings/favicon', data),
  toggleMaintenance: ()     => api.patch('/admin/settings/maintenance'),
}