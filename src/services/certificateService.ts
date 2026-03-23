import { get, post, del } from './api'

// Types
export interface Certificate {
  id: string
  subject: string
  issuer: string
  serialNumber: string
  validFrom: string
  validTo: string
  fingerprint: string
  nif?: string
  algorithm: string
  keySize: number
  isValid: boolean
  daysUntilExpiry: number
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED'
  installedAt: string
}

export interface CertificateInstallRequest {
  file: File
  password: string
}

export interface CertificateInfo {
  subject: string
  issuer: string
  validFrom: string
  validTo: string
  nif?: string
}

// Certificate Service
export const certificateService = {
  // Get current certificate info
  async getCurrent(): Promise<Certificate | null> {
    try {
      return await get<Certificate>('/certificates/current')
    } catch {
      return null
    }
  },

  // Install new certificate
  async install(file: File, password: string): Promise<Certificate> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('password', password)

    const response = await fetch('/api/certificates/install', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('veridico-auth-token')}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al instalar el certificado')
    }

    return response.json()
  },

  // Validate certificate file (preview before install)
  async validate(file: File, password: string): Promise<{
    valid: boolean
    info?: CertificateInfo
    error?: string
  }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('password', password)

    const response = await fetch('/api/certificates/validate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('veridico-auth-token')}`,
      },
      body: formData,
    })

    return response.json()
  },

  // Remove current certificate
  async remove(): Promise<void> {
    return del<void>('/certificates/current')
  },

  // Check certificate status
  async checkStatus(): Promise<{
    status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'NOT_CONFIGURED'
    daysUntilExpiry?: number
    message?: string
  }> {
    return get('/certificates/status')
  },

  // Get certificate history
  async getHistory(): Promise<Array<{
    id: string
    subject: string
    installedAt: string
    removedAt?: string
    status: 'active' | 'replaced' | 'removed'
  }>> {
    return get('/certificates/history')
  },

  // Test certificate signature
  async testSignature(): Promise<{
    success: boolean
    signature?: string
    error?: string
  }> {
    return post('/certificates/test-sign')
  },

  // Export public key
  async exportPublicKey(): Promise<string> {
    return get<string>('/certificates/public-key')
  },

  // Parse certificate file locally (without uploading)
  parseCertificateFile(file: File): Promise<{
    name: string
    size: number
    type: string
    isValidFormat: boolean
  }> {
    return new Promise((resolve) => {
      const isValidFormat =
        file.name.endsWith('.p12') ||
        file.name.endsWith('.pfx') ||
        file.name.endsWith('.pem')

      resolve({
        name: file.name,
        size: file.size,
        type: file.type || 'application/x-pkcs12',
        isValidFormat,
      })
    })
  },

  // Calculate days until expiry
  calculateDaysUntilExpiry(validTo: string): number {
    const expiryDate = new Date(validTo)
    const now = new Date()
    const diffTime = expiryDate.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  },

  // Determine certificate status based on expiry
  determineStatus(daysUntilExpiry: number): 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' {
    if (daysUntilExpiry <= 0) return 'EXPIRED'
    if (daysUntilExpiry <= 30) return 'EXPIRING_SOON'
    return 'ACTIVE'
  },
}

export default certificateService
