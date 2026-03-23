import { get, post, apiClient } from './api'
import type { InvoiceStatusType } from '@/components/ui/Badge'

// ─────────────────────────────────────────────
// Tipos — deben reflejar el JSON que devuelve el backend
// Fuente: InvoiceController.java + Invoice.java (dominio)
// ─────────────────────────────────────────────

export interface BackendInvoiceLine {
  id?: string
  lineNumber: number
  description: string
  quantity: number
  unit: string
  unitPrice: number
  discountRate: number
  netAmount: number
  productCode?: string
}

export interface BackendTaxLine {
  id?: string
  taxType: string
  description?: string
  taxableBase: number
  taxRate: number
  taxAmount: number
  isWithheld: boolean
}

/**
 * Forma del objeto Invoice serializado por el backend.
 * GET /invoices → List<Invoice> (modelo de dominio)
 * GET /invoices/{id} → Invoice
 * POST /invoices → InvoiceResponse (subconjunto — mismos campos esenciales)
 */
export interface BackendInvoice {
  id: string
  series: string
  number: string
  fullNumber: string
  issueDate: string          // Instant → ISO 8601
  operationDate?: string
  dueDate?: string
  status: InvoiceStatusType
  issuerNif: string
  issuerName: string
  issuerAddress?: string
  issuerEmail?: string
  issuerPhone?: string
  issuerIban?: string
  customerNif: string
  customerName: string
  customerAddress?: string
  customerEmail?: string
  lines: BackendInvoiceLine[]
  taxes: BackendTaxLine[]
  taxableBase: number
  totalTax: number
  totalAmount: number
  description?: string
  notes?: string
  paymentMethod?: string
  invoiceType?: string
  digitalSignature?: string
  pdfPath?: string           // añadido en V5 migration
  createdAt: string
  updatedAt?: string
  createdBy?: string
}

export interface CreateInvoiceRequest {
  series: string
  number?: string
  issuerNif: string
  issuerName: string
  issuerAddress?: string
  issuerEmail?: string
  issuerPhone?: string
  issuerIban?: string
  customerNif: string
  customerName: string
  customerAddress?: string
  customerEmail?: string
  issueDate?: string
  operationDate?: string
  dueDate?: string
  invoiceType?: string
  lines: {
    lineNumber: number
    description: string
    quantity: number
    unitPrice: number
    unit?: string
    discountRate?: number
    productCode?: string
  }[]
  taxes: {
    taxType: string
    description?: string
    taxableBase: number
    taxRate: number
    isWithheld?: boolean
  }[]
  description?: string
  notes?: string
  paymentMethod?: string
}

// ─────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────

export const invoiceService = {

  /**
   * Lista todas las facturas.
   * Backend: GET /invoices → List<Invoice>
   * Filtro opcional por serie.
   */
  async list(series?: string): Promise<BackendInvoice[]> {
    const params = series ? `?series=${encodeURIComponent(series)}` : ''
    return get<BackendInvoice[]>(`/invoices${params}`)
  },

  /**
   * Obtiene una factura por ID.
   * Backend: GET /invoices/{id} → Invoice
   */
  async getById(id: string): Promise<BackendInvoice> {
    return get<BackendInvoice>(`/invoices/${id}`)
  },

  /**
   * Crea una nueva factura.
   * Backend: POST /invoices → InvoiceResponse (201)
   */
  async create(data: CreateInvoiceRequest): Promise<BackendInvoice> {
    return post<BackendInvoice, CreateInvoiceRequest>('/invoices', data)
  },

  /**
   * Firma la factura (crea registro inmutable con hash chain).
   * Backend: POST /invoices/{id}/sign → 200 OK (sin cuerpo)
   */
  async sign(id: string): Promise<void> {
    await post<void>(`/invoices/${id}/sign`)
  },

  /**
   * Descarga el PDF como blob.
   * Backend: GET /invoices/{id}/pdf → application/pdf
   */
  async downloadPdfBlob(id: string): Promise<Blob> {
    const response = await apiClient.get<ArrayBuffer>(`/invoices/${id}/pdf`, {
      responseType: 'arraybuffer',
    })
    return new Blob([response.data], { type: 'application/pdf' })
  },

  /**
   * Devuelve la URL directa al PDF del backend.
   * Útil para abrir con shell.openExternal en Electron.
   */
  getPdfUrl(id: string): string {
    return `http://localhost:8080/api/invoices/${id}/pdf`
  },
}

export default invoiceService
