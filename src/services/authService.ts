import { post, get } from './api'

// Types
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user' | 'viewer'
  companyName?: string
  companyNif?: string
  avatarUrl?: string
  lastLoginAt?: string
  createdAt: string
}

export interface LoginRequest {
  email: string
  password?: string
}

export interface LoginResponse {
  challengeId: string
  expiresAt: string
  method: '2fa_mobile' | 'email_code'
}

export interface VerifyLoginRequest {
  challengeId: string
  code?: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
  expiresAt: string
}

export interface SetupDeviceRequest {
  deviceName: string
  publicKey: string
}

export interface SetupDeviceResponse {
  deviceId: string
  qrCode: string
  secret: string
}

// Auth Service
export const authService = {
  // Initiate login (returns challenge for 2FA)
  async initiateLogin(data: LoginRequest): Promise<LoginResponse> {
    return post<LoginResponse, LoginRequest>('/auth/login', data)
  },

  // Verify 2FA and complete login
  async verifyLogin(data: VerifyLoginRequest): Promise<AuthResponse> {
    return post<AuthResponse, VerifyLoginRequest>('/auth/verify', data)
  },

  // Poll for mobile app approval (WebSocket alternative)
  async pollChallenge(challengeId: string): Promise<{
    status: 'pending' | 'approved' | 'rejected' | 'expired'
    authResponse?: AuthResponse
  }> {
    return get(`/auth/challenge/${challengeId}/status`)
  },

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<{
    token: string
    expiresAt: string
  }> {
    return post('/auth/refresh', { refreshToken })
  },

  // Logout (invalidate tokens)
  async logout(): Promise<void> {
    try {
      await post('/auth/logout')
    } finally {
      localStorage.removeItem('veridico-auth')
      localStorage.removeItem('veridico-auth-token')
    }
  },

  // Get current user profile
  async getProfile(): Promise<User> {
    return get<User>('/auth/me')
  },

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    return post<User, Partial<User>>('/auth/me', data)
  },

  // Setup new device for 2FA
  async setupDevice(data: SetupDeviceRequest): Promise<SetupDeviceResponse> {
    return post<SetupDeviceResponse, SetupDeviceRequest>('/auth/devices/setup', data)
  },

  // Verify device setup
  async verifyDeviceSetup(deviceId: string, code: string): Promise<{ success: boolean }> {
    return post('/auth/devices/verify', { deviceId, code })
  },

  // List user devices
  async listDevices(): Promise<Array<{
    id: string
    name: string
    lastUsedAt: string
    isCurrent: boolean
  }>> {
    return get('/auth/devices')
  },

  // Remove device
  async removeDevice(deviceId: string): Promise<void> {
    return post(`/auth/devices/${deviceId}/revoke`)
  },

  // Request password reset
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return post('/auth/password/reset-request', { email })
  },

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return post('/auth/password/reset', { token, newPassword })
  },

  // Change password (when logged in)
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return post('/auth/password/change', { currentPassword, newPassword })
  },

  // Store auth data locally
  storeAuth(auth: AuthResponse): void {
    localStorage.setItem('veridico-auth-token', auth.token)
    localStorage.setItem('veridico-auth', JSON.stringify({
      user: auth.user,
      expiresAt: auth.expiresAt,
      refreshToken: auth.refreshToken,
    }))
  },

  // Get stored auth data
  getStoredAuth(): { user: User; expiresAt: string; refreshToken: string } | null {
    const stored = localStorage.getItem('veridico-auth')
    if (!stored) return null
    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  },

  // Check if token is expired
  isTokenExpired(): boolean {
    const auth = this.getStoredAuth()
    if (!auth) return true
    return new Date(auth.expiresAt) < new Date()
  },

  // Clear all auth data
  clearAuth(): void {
    localStorage.removeItem('veridico-auth')
    localStorage.removeItem('veridico-auth-token')
  },
}

export default authService
