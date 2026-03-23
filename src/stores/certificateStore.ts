import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CertificateStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'NOT_CONFIGURED'

export interface Certificate {
  subject: string
  issuer: string
  serialNumber: string
  validFrom: string
  validTo: string
  fingerprint: string
  nif?: string
}

interface CertificateState {
  certificate: Certificate | null
  status: CertificateStatus
  daysUntilExpiry: number | null
  isLoading: boolean
  error: string | null
  lastChecked: string | null

  // Actions
  setCertificate: (cert: Certificate | null) => void
  setStatus: (status: CertificateStatus) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearCertificate: () => void
  checkCertificateStatus: () => void
}

export const useCertificateStore = create<CertificateState>()(
  persist(
    (set, get) => ({
      certificate: null,
      status: 'NOT_CONFIGURED',
      daysUntilExpiry: null,
      isLoading: false,
      error: null,
      lastChecked: null,

      setCertificate: (cert) => {
        if (cert) {
          const validTo = new Date(cert.validTo)
          const now = new Date()
          const diffTime = validTo.getTime() - now.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

          let status: CertificateStatus = 'ACTIVE'
          if (diffDays <= 0) {
            status = 'EXPIRED'
          } else if (diffDays <= 30) {
            status = 'EXPIRING_SOON'
          }

          set({
            certificate: cert,
            status,
            daysUntilExpiry: diffDays,
            lastChecked: new Date().toISOString(),
          })
        } else {
          set({
            certificate: null,
            status: 'NOT_CONFIGURED',
            daysUntilExpiry: null,
          })
        }
      },

      setStatus: (status) => set({ status }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearCertificate: () =>
        set({
          certificate: null,
          status: 'NOT_CONFIGURED',
          daysUntilExpiry: null,
          error: null,
        }),

      checkCertificateStatus: () => {
        const cert = get().certificate
        if (!cert) {
          set({ status: 'NOT_CONFIGURED' })
          return
        }

        const validTo = new Date(cert.validTo)
        const now = new Date()
        const diffTime = validTo.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        let status: CertificateStatus = 'ACTIVE'
        if (diffDays <= 0) {
          status = 'EXPIRED'
        } else if (diffDays <= 30) {
          status = 'EXPIRING_SOON'
        }

        set({
          status,
          daysUntilExpiry: diffDays,
          lastChecked: new Date().toISOString(),
        })
      },
    }),
    {
      name: 'veridico-certificate',
      partialize: (state) => ({
        certificate: state.certificate,
        status: state.status,
        daysUntilExpiry: state.daysUntilExpiry,
        lastChecked: state.lastChecked,
      }),
    }
  )
)

// Selector hooks
export const useCertificate = () =>
  useCertificateStore((state) => state.certificate)
export const useCertificateStatus = () =>
  useCertificateStore((state) => state.status)
