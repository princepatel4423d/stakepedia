import { create } from 'zustand'

export const useUIStore = create((set) => ({
  sidebarCollapsed: false,
  toggleSidebar:    () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebar:       (v) => set({ sidebarCollapsed: v }),
}))