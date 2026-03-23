import { create } from 'zustand'

interface ContactModalState {
  isOpen: boolean
  openContactModal: () => void
  closeContactModal: () => void
}

export const useContactModal = create<ContactModalState>((set) => ({
  isOpen: false,
  openContactModal: () => set({ isOpen: true }),
  closeContactModal: () => set({ isOpen: false }),
}))
