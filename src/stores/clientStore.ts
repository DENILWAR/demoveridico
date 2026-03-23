import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOCK_CLIENTS, type MockClient } from '@/data/mockData'

export type Client = MockClient

interface ClientState {
  clients: Client[]
  addClient: (client: Client) => void
  updateClient: (id: string, data: Partial<Client>) => void
  deleteClient: (id: string) => void
  getByNif: (nif: string) => Client | undefined
}

export const useClientStore = create<ClientState>()(
  persist(
    (set, get) => ({
      clients: MOCK_CLIENTS,

      addClient: (client) =>
        set((s) => ({ clients: [client, ...s.clients] })),

      updateClient: (id, data) =>
        set((s) => ({
          clients: s.clients.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),

      deleteClient: (id) =>
        set((s) => ({ clients: s.clients.filter((c) => c.id !== id) })),

      getByNif: (nif) =>
        get().clients.find((c) => c.nif.toUpperCase() === nif.toUpperCase()),
    }),
    {
      name: 'veridico-clients',
      onRehydrateStorage: () => (state) => {
        if (state && state.clients.length === 0) {
          state.clients = [...MOCK_CLIENTS]
        }
      },
    }
  )
)
