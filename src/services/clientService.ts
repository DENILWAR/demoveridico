import { get, post, put, del, type PaginatedResponse } from './api'

// Types
export interface Client {
  id: string
  type: 'company' | 'individual'
  nif: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country: string
  notes?: string
  // Stats
  totalInvoiced: number
  invoiceCount: number
  lastInvoiceDate?: string
  createdAt: string
  updatedAt: string
}

export interface CreateClientRequest {
  type: 'company' | 'individual'
  nif: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  notes?: string
}

export interface ClientFilters {
  type?: 'company' | 'individual'
  search?: string
  page?: number
  pageSize?: number
}

// Client Service
export const clientService = {
  // List clients with filters and pagination
  async list(filters: ClientFilters = {}): Promise<PaginatedResponse<Client>> {
    const params = new URLSearchParams()

    if (filters.type) params.append('type', filters.type)
    if (filters.search) params.append('search', filters.search)
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString())

    return get<PaginatedResponse<Client>>(`/clients?${params.toString()}`)
  },

  // Get single client by ID
  async getById(id: string): Promise<Client> {
    return get<Client>(`/clients/${id}`)
  },

  // Get client by NIF
  async getByNif(nif: string): Promise<Client | null> {
    try {
      return await get<Client>(`/clients/nif/${nif}`)
    } catch {
      return null
    }
  },

  // Create new client
  async create(data: CreateClientRequest): Promise<Client> {
    return post<Client, CreateClientRequest>('/clients', data)
  },

  // Update client
  async update(id: string, data: Partial<CreateClientRequest>): Promise<Client> {
    return put<Client, Partial<CreateClientRequest>>(`/clients/${id}`, data)
  },

  // Delete client
  async delete(id: string): Promise<void> {
    return del<void>(`/clients/${id}`)
  },

  // Get client invoices
  async getInvoices(id: string, page = 1, pageSize = 10): Promise<PaginatedResponse<{
    id: string
    number: string
    total: number
    status: string
    issueDate: string
  }>> {
    return get(`/clients/${id}/invoices?page=${page}&pageSize=${pageSize}`)
  },

  // Validate NIF format
  validateNif(nif: string): { valid: boolean; type?: 'company' | 'individual'; error?: string } {
    if (!nif) {
      return { valid: false, error: 'El NIF es obligatorio' }
    }

    const cleanNif = nif.toUpperCase().replace(/[^A-Z0-9]/g, '')

    // CIF (empresas) - empieza por letra
    const cifRegex = /^[ABCDEFGHJKLMNPQRSUVW]\d{7}[A-J0-9]$/
    if (cifRegex.test(cleanNif)) {
      return { valid: true, type: 'company' }
    }

    // NIF (personas) - 8 números + letra
    const nifRegex = /^\d{8}[A-Z]$/
    if (nifRegex.test(cleanNif)) {
      const letters = 'TRWAGMYFPDXBNJZSQVHLCKE'
      const number = parseInt(cleanNif.substring(0, 8), 10)
      const expectedLetter = letters[number % 23]
      if (cleanNif.charAt(8) === expectedLetter) {
        return { valid: true, type: 'individual' }
      }
      return { valid: false, error: 'Letra del NIF incorrecta' }
    }

    // NIE (extranjeros) - X, Y o Z + 7 números + letra
    const nieRegex = /^[XYZ]\d{7}[A-Z]$/
    if (nieRegex.test(cleanNif)) {
      let nieNumber = cleanNif.replace('X', '0').replace('Y', '1').replace('Z', '2')
      nieNumber = nieNumber.substring(0, 8)
      const letters = 'TRWAGMYFPDXBNJZSQVHLCKE'
      const number = parseInt(nieNumber, 10)
      const expectedLetter = letters[number % 23]
      if (cleanNif.charAt(8) === expectedLetter) {
        return { valid: true, type: 'individual' }
      }
      return { valid: false, error: 'Letra del NIE incorrecta' }
    }

    return { valid: false, error: 'Formato de NIF/CIF no válido' }
  },

  // Search clients by name or NIF (autocomplete)
  async search(query: string, limit = 5): Promise<Client[]> {
    if (query.length < 2) return []
    const result = await get<PaginatedResponse<Client>>(`/clients?search=${encodeURIComponent(query)}&pageSize=${limit}`)
    return result.items
  },
}

export default clientService
