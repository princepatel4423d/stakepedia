import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:        null,
      accessToken: null,
      hydrated:    false,

      setAuth: (user, accessToken) => {
        if (!accessToken) return
        localStorage.setItem('sp_token', accessToken)
        set({ user: user || null, accessToken, hydrated: true })
      },

      setHydrated: (hydrated) => set({ hydrated }),

      updateUser: (updates) =>
        set((s) => ({ user: s.user ? { ...s.user, ...updates } : updates })),

      logout: () => {
        localStorage.removeItem('sp_token')
        set({ user: null, accessToken: null })
      },

      isAuthenticated: () => !!(get().user && get().accessToken),
    }),
    {
      name:       'sp_auth',
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState || {}
        return {
          ...currentState,
          ...persisted,
          // Avoid rehydrate races overwriting a fresh in-memory login with null persisted values.
          user: persisted.user ?? currentState.user,
          accessToken: persisted.accessToken ?? currentState.accessToken,
        }
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)