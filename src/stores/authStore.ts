import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  companyName?: string
  companyNif?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  sessionToken: string | null
  deviceId: string | null

  // Actions
  login: (user: User, token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  setDeviceId: (deviceId: string) => void
  updateUser: (user: Partial<User>) => void
}

// Usuario local por defecto — el backend actual no tiene endpoint de autenticación.
// Cuando se implemente auth en el backend, reemplazar por un flujo de login real.
const DEFAULT_USER: User = {
  id: 'local',
  email: 'admin@veridico.local',
  name: 'Administrador',
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: DEFAULT_USER,
      isAuthenticated: true,
      isLoading: false,
      sessionToken: null,
      deviceId: null,

      login: (user, token) =>
        set({
          user,
          sessionToken: token,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          sessionToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      setDeviceId: (deviceId) => set({ deviceId }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'veridico-auth',
      partialize: (state) => ({
        user: state.user,
        sessionToken: state.sessionToken,
        deviceId: state.deviceId,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Selector hooks para optimización
export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
