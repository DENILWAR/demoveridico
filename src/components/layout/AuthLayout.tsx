import { Outlet } from 'react-router-dom'
import { Receipt, Shield } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-navy to-primary-600 text-white p-12 flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Receipt className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold">Veridico</span>
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-8">
          <h1 className="text-4xl font-bold leading-tight">
            Facturación Legal
            <br />y Segura
          </h1>
          <p className="text-lg text-white/80 max-w-md">
            Sistema de facturación homologado que cumple con el RD 1007/2023 y la
            Orden HAC/1177/2024. Firma digital cualificada y trazabilidad completa.
          </p>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Datos locales y seguros</p>
                <p className="text-sm text-white/60">
                  Tu información nunca sale de tu ordenador
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium">Firma digital cualificada</p>
                <p className="text-sm text-white/60">
                  Certificado del cliente, máxima seguridad
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium">100% auditable</p>
                <p className="text-sm text-white/60">
                  Cumple con la normativa de Hacienda
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-sm text-white/50">
          <p>© 2026 Veridico. Todos los derechos reservados.</p>
          <p className="mt-1">
            Conforme con RD 1007/2023 · Orden HAC/1177/2024
          </p>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
