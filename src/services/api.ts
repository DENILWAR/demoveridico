import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios'

// Types
export interface ApiResponse<T> {
  data: T
  message?: string
  status: number
}

export interface ApiError {
  message: string
  code: string
  details?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const API_TIMEOUT = 30000 // 30 seconds

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor - add auth token
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('veridico-auth-token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor - handle errors
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
      if (error.response) {
        const { status, data } = error.response

        // Handle specific error codes
        switch (status) {
          case 401:
            // Unauthorized - clear auth and redirect to login
            localStorage.removeItem('veridico-auth-token')
            localStorage.removeItem('veridico-auth')
            window.location.href = '/login'
            break
          case 403:
            // Forbidden
            console.error('Access forbidden:', data?.message)
            break
          case 404:
            // Not found
            console.error('Resource not found:', data?.message)
            break
          case 422:
            // Validation error
            console.error('Validation error:', data?.details)
            break
          case 500:
            // Server error
            console.error('Server error:', data?.message)
            break
        }

        return Promise.reject({
          message: data?.message || 'Ha ocurrido un error',
          code: data?.code || `ERROR_${status}`,
          details: data?.details,
        })
      }

      if (error.request) {
        // Network error
        return Promise.reject({
          message: 'Error de conexión. Comprueba tu red.',
          code: 'NETWORK_ERROR',
        })
      }

      return Promise.reject({
        message: error.message || 'Error desconocido',
        code: 'UNKNOWN_ERROR',
      })
    }
  )

  return client
}

export const apiClient = createApiClient()

// Generic request helpers
export async function get<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.get<T>(url, config)
  return response.data
}

export async function post<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.post<T>(url, data, config)
  return response.data
}

export async function put<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.put<T>(url, data, config)
  return response.data
}

export async function patch<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.patch<T>(url, data, config)
  return response.data
}

export async function del<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.delete<T>(url, config)
  return response.data
}

// Health check
export async function healthCheck(): Promise<boolean> {
  try {
    await get('/invoices/health')
    return true
  } catch {
    return false
  }
}

export default apiClient
