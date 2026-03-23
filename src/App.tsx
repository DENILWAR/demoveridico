import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

// Layouts
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'

// Pages
import LoginPage from './pages/auth/LoginPage'
import SetupPage from './pages/auth/SetupPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import InvoicesPage from './pages/invoices/InvoicesPage'
import NewInvoicePage from './pages/invoices/NewInvoicePage'
import InvoiceDetailPage from './pages/invoices/InvoiceDetailPage'
import ClientsPage from './pages/clients/ClientsPage'
import SettingsPage from './pages/settings/SettingsPage'
import CertificateSettingsPage from './pages/settings/CertificateSettingsPage'
import ReportsPage from './pages/reports/ReportsPage'
import FeedPage from './pages/feed/FeedPage'

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Public Route Component (redirect if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <Routes>
      {/* Public Routes - Auth */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/setup"
          element={
            <PublicRoute>
              <SetupPage />
            </PublicRoute>
          }
        />
      </Route>

      {/* Protected Routes - Main App */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/invoices/new" element={<NewInvoicePage />} />
        <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/certificate" element={<CertificateSettingsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/feed" element={<FeedPage />} />
      </Route>

      {/* Redirect root: mobile → /feed, desktop → /dashboard */}
      <Route
        path="/"
        element={<Navigate to={window.innerWidth < 700 ? '/feed' : '/dashboard'} replace />}
      />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-8">Página no encontrada</p>
              <a href="/dashboard" className="btn-primary">
                Volver al inicio
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  )
}

export default App
