import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { CertificateIndicator } from '../ui/CertificateIndicator'
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Receipt,
  ChevronDown,
  Rss,
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'

interface NavItem {
  label: string
  icon: typeof LayoutDashboard
  path: string
  children?: { label: string; path: string }[]
}

const navItems: NavItem[] = [
  {
    label: 'Panel',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    label: 'Feed',
    icon: Rss,
    path: '/feed',
  },
  {
    label: 'Ventas',
    icon: FileText,
    path: '/invoices',
    children: [
      { label: 'Facturas', path: '/invoices' },
      { label: 'Nueva Factura', path: '/invoices/new' },
    ],
  },
  {
    label: 'Contactos',
    icon: Users,
    path: '/clients',
  },
  {
    label: 'Informes',
    icon: BarChart3,
    path: '/reports',
  },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const location = useLocation()
  const { logout, user } = useAuthStore()
  const [expandedItems, setExpandedItems] = useState<string[]>(['/invoices'])

  const toggleExpand = (path: string) => {
    setExpandedItems((prev) =>
      prev.includes(path)
        ? prev.filter((p) => p !== path)
        : [...prev, path]
    )
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full w-64 bg-primary-navy text-white flex flex-col z-40',
        'transition-transform duration-300 ease-in-out',
        'lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">Veridico</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const hasChildren = item.children && item.children.length > 0
            const isExpanded = expandedItems.includes(item.path)
            const active = isActive(item.path)

            return (
              <li key={item.path}>
                {hasChildren ? (
                  <>
                    <button
                      onClick={() => toggleExpand(item.path)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                        active
                          ? 'bg-white/15 text-white'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 transition-transform',
                          isExpanded && 'rotate-180'
                        )}
                      />
                    </button>
                    {isExpanded && (
                      <ul className="mt-1 ml-4 space-y-1">
                        {item.children?.map((child) => (
                          <li key={child.path}>
                            <NavLink
                              to={child.path}
                              onClick={onClose}
                              className={({ isActive }) =>
                                cn(
                                  'block px-4 py-2 rounded-lg text-sm transition-colors',
                                  isActive
                                    ? 'bg-white/15 text-white'
                                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                                )
                              }
                            >
                              {child.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                        isActive
                          ? 'bg-white/15 text-white'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      )
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                )}
              </li>
            )
          })}
        </ul>

        {/* Separator */}
        <div className="my-4 border-t border-white/10" />

        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
              isActive
                ? 'bg-white/15 text-white'
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            )
          }
        >
          <Settings className="w-5 h-5" />
          <span>Ajustes</span>
        </NavLink>
      </nav>

      {/* Certificate Status */}
      <div className="px-3 py-4 border-t border-white/10">
        <CertificateIndicator variant="full" />
      </div>

      {/* User & Logout */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'Usuario'}</p>
            <p className="text-xs text-gray-400 truncate">
              {user?.companyName || 'Mi Empresa'}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
