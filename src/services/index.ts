// API Client
export { default as apiClient, get, post, put, patch, del, healthCheck } from './api'
export type { ApiResponse, ApiError, PaginatedResponse } from './api'

// Auth Service
export { default as authService } from './authService'
export type {
  User,
  LoginRequest,
  LoginResponse,
  VerifyLoginRequest,
  AuthResponse,
  SetupDeviceRequest,
  SetupDeviceResponse,
} from './authService'

// Invoice Service
export { default as invoiceService } from './invoiceService'
export type {
  BackendInvoiceLine,
  BackendTaxLine,
  BackendInvoice,
  CreateInvoiceRequest,
} from './invoiceService'

// Client Service
export { default as clientService } from './clientService'
export type {
  Client,
  CreateClientRequest,
  ClientFilters,
} from './clientService'

// Certificate Service
export { default as certificateService } from './certificateService'
export type {
  Certificate,
  CertificateInstallRequest,
  CertificateInfo,
} from './certificateService'
