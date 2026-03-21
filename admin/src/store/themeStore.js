import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme:          'system',
      primaryColor:   '#6366f1',
      secondaryColor: '#8b5cf6',
      accentColor:    '#06b6d4',
      fontFamily:     'Inter Variable',

      setTheme: (theme) => {
        set({ theme })
        get().applyTheme(theme)
      },

      setColors: ({ primaryColor, secondaryColor, accentColor }) => {
        set({ primaryColor, secondaryColor, accentColor })
        get().applyColors()
      },

      setFontFamily: (fontFamily) => {
        set({ fontFamily })
        document.body.style.fontFamily = fontFamily
      },

      applyTheme: (theme) => {
        const root = document.documentElement
        const isDark =
          theme === 'dark' ||
          (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
        root.classList.toggle('dark', isDark)
      },

      applyColors: () => {
        const { primaryColor, secondaryColor, accentColor } = get()
        const root = document.documentElement
        root.style.setProperty('--brand-primary',   primaryColor)
        root.style.setProperty('--brand-secondary', secondaryColor)
        root.style.setProperty('--brand-accent',    accentColor)
      },

      applyAll: () => {
        const state = get()
        state.applyTheme(state.theme)
        state.applyColors()
        document.body.style.fontFamily = state.fontFamily
      },

      syncFromServer: (settings) => {
        if (!settings) return
        set({
          theme:          settings.theme          || 'system',
          primaryColor:   settings.primaryColor   || '#6366f1',
          secondaryColor: settings.secondaryColor || '#8b5cf6',
          accentColor:    settings.accentColor    || '#06b6d4',
          fontFamily:     settings.fontFamily     || 'Inter Variable',
        })
        get().applyAll()
      },
    }),
    {
      name: 'stakepedia-admin-theme',
    }
  )
)