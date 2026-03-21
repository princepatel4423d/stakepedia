import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      admin:        null,
      accessToken:  null,
      preAuthToken: null,
      isAuthenticated: false,

      setAuth: (admin, accessToken) => set({
        admin,
        accessToken,
        isAuthenticated: true,
        preAuthToken: null,
      }),

      setPreAuthToken: (preAuthToken) => set({ preAuthToken }),

      updateAdmin: (updates) => set((state) => ({
        admin: { ...state.admin, ...updates },
      })),

      logout: () => set({
        admin:           null,
        accessToken:     null,
        preAuthToken:    null,
        isAuthenticated: false,
      }),

      hasPermission: (permission) => {
        const admin = get().admin
        if (!admin) return false
        if (admin.role === 'superadmin') return true
        return admin.permissions?.[permission] === true
      },

      isSuperAdmin: () => get().admin?.role === 'superadmin',
    }),
    {
      name: 'stakepedia-admin-auth',
      partialize: (state) => ({
        admin:           state.admin,
        accessToken:     state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)