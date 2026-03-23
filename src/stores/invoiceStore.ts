import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BackendInvoice } from '@/services/invoiceService'
import { MOCK_INVOICES } from '@/data/mockData'

// Re-export for backward compat
export type Invoice = BackendInvoice
export type InvoiceStatus = BackendInvoice['status']

interface InvoiceState {
  invoices: BackendInvoice[]
  selectedInvoice: BackendInvoice | null
  isLoading: boolean
  error: string | null
  draftInvoice: Partial<BackendInvoice> | null

  // Actions
  setInvoices: (invoices: BackendInvoice[]) => void
  addInvoice: (invoice: BackendInvoice) => void
  updateInvoice: (id: string, data: Partial<BackendInvoice>) => void
  deleteInvoice: (id: string) => void
  selectInvoice: (invoice: BackendInvoice | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Draft actions
  setDraftInvoice: (draft: Partial<BackendInvoice> | null) => void
  updateDraftInvoice: (data: Partial<BackendInvoice>) => void
  clearDraft: () => void

  // Computed helpers
  getInvoicesByStatus: (status: InvoiceStatus) => BackendInvoice[]
  getRecentInvoices: (limit: number) => BackendInvoice[]
  getById: (id: string) => BackendInvoice | undefined
}

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    (set, get) => ({
      invoices: MOCK_INVOICES,
      selectedInvoice: null,
      isLoading: false,
      error: null,
      draftInvoice: null,

      setInvoices: (invoices) => set({ invoices }),

      addInvoice: (invoice) =>
        set((s) => ({ invoices: [invoice, ...s.invoices] })),

      updateInvoice: (id, data) =>
        set((s) => ({
          invoices: s.invoices.map((inv) =>
            inv.id === id ? { ...inv, ...data } : inv
          ),
          selectedInvoice:
            s.selectedInvoice?.id === id
              ? { ...s.selectedInvoice, ...data }
              : s.selectedInvoice,
        })),

      deleteInvoice: (id) =>
        set((s) => ({
          invoices: s.invoices.filter((inv) => inv.id !== id),
          selectedInvoice:
            s.selectedInvoice?.id === id ? null : s.selectedInvoice,
        })),

      selectInvoice: (invoice) => set({ selectedInvoice: invoice }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setDraftInvoice: (draft) => set({ draftInvoice: draft }),

      updateDraftInvoice: (data) =>
        set((s) => ({
          draftInvoice: s.draftInvoice ? { ...s.draftInvoice, ...data } : data,
        })),

      clearDraft: () => set({ draftInvoice: null }),

      getInvoicesByStatus: (status) =>
        get().invoices.filter((inv) => inv.status === status),

      getRecentInvoices: (limit) =>
        [...get().invoices]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, limit),

      getById: (id) => get().invoices.find((inv) => inv.id === id),
    }),
    {
      name: 'veridico-invoices',
      partialize: (s) => ({ invoices: s.invoices, draftInvoice: s.draftInvoice }),
      onRehydrateStorage: () => (state) => {
        // If storage was cleared / first visit, seed mock data
        if (state && state.invoices.length === 0) {
          state.invoices = [...MOCK_INVOICES]
        }
      },
    }
  )
)

// Selector hooks
export const useInvoices = () => useInvoiceStore((s) => s.invoices)
export const useSelectedInvoice = () => useInvoiceStore((s) => s.selectedInvoice)
export const useDraftInvoice = () => useInvoiceStore((s) => s.draftInvoice)
