import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { CertificateAlertBanner } from '../ui/CertificateIndicator'
import { ToastProvider } from '../ui/Toast'
import { ContactModal } from '../ui/ContactModal'
import { LayoutDashboard, FileText, Plus, Users, Rss } from 'lucide-react'
import { cn } from '@/utils/cn'

// ── Mobile bottom navigation items ───────────────────────────────
const mobileNav = [
  { to: '/feed',      icon: Rss,             label: 'Feed' },
  { to: '/invoices',  icon: FileText,        label: 'Facturas' },
  { to: '/invoices/new', icon: Plus,         label: 'Nueva',   accent: true },
  { to: '/clients',   icon: Users,           label: 'Clientes' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Panel' },
]

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content — offset by sidebar on desktop, extra bottom padding on mobile for nav bar */}
        <div className="lg:ml-64 min-h-screen flex flex-col">
          <TopBar onMenuToggle={() => setSidebarOpen(true)} />
          <CertificateAlertBanner />
          <ContactModal />
          <main className="flex-1 p-4 sm:p-6 pb-24 lg:pb-6">
            <Outlet />
          </main>
        </div>

        {/* ── Mobile bottom navigation ──────────────────────────── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-bottom">
          <div className="flex items-stretch h-16">
            {mobileNav.map(({ to, icon: Icon, label, accent }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/invoices'}
                className={({ isActive }) =>
                  cn(
                    'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors text-xs font-medium',
                    accent
                      ? cn(
                          'mx-1 my-2 rounded-xl',
                          isActive
                            ? 'bg-primary-600 text-white'
                            : 'bg-primary-500 text-white shadow-sm'
                        )
                      : isActive
                        ? 'text-primary-600'
                        : 'text-gray-400 hover:text-gray-600'
                  )
                }
              >
                <Icon className={cn('w-5 h-5', accent && 'w-6 h-6')} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </ToastProvider>
  )
}
