import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import '@/styles/index.css'
import App from '@/App.jsx'
import { HelmetProvider } from 'react-helmet-async'

// Apply theme immediately before React renders to prevent flash
const applyThemeImmediately = () => {
  try {
    const stored = localStorage.getItem('stakepedia-admin-theme')
    if (stored) {
      const { state } = JSON.parse(stored)
      const theme = state?.theme || 'system'
      const isDark =
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      document.documentElement.classList.toggle('dark', isDark)
    }
  } catch (e) {
    console.error('Failed to apply theme:', e)
  }
}

applyThemeImmediately()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster position="top-right" richColors closeButton />
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>
)