import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Bell, FileText, Users, Command, Menu,
  CheckCircle2, AlertTriangle, Send, XCircle, Settings, LogOut, ChevronDown,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/stores/authStore'
import { useContactModal } from '@/stores/contactModalStore'

// ── Types ────────────────────────────────────────────────────────
interface SearchResult {
  type: 'invoice' | 'client'
  id: string
  title: string
  subtitle: string
  path: string
}

interface Notification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  body: string
  time: string
  read: boolean
}

// ── Mock notifications ────────────────────────────────────────────
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '0',
    type: 'info',
    title: 'Implementa hoy mismo Veridico en tu negocio',
    body: 'Activa todas las funcionalidades. Contacta ahora →',
    time: 'Ahora',
    read: false,
  },
  {
    id: '1',
    type: 'success',
    title: 'Factura firmada',
    body: 'A-2024-0023 ha sido firmada correctamente.',
    time: 'Hace 5 min',
    read: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Certificado por vencer',
    body: 'Tu certificado digital caduca en 28 días.',
    time: 'Hace 1 h',
    read: false,
  },
  {
    id: '3',
    type: 'info',
    title: 'Factura enviada',
    body: 'A-2024-0022 ha sido enviada a Cliente Demo S.A.',
    time: 'Hace 2 h',
    read: true,
  },
  {
    id: '4',
    type: 'error',
    title: 'Error de envío AEAT',
    body: 'No se pudo enviar A-2024-0020. Revisa la conexión.',
    time: 'Ayer',
    read: true,
  },
]

function notifIcon(type: Notification['type']) {
  const cls = 'w-4 h-4'
  switch (type) {
    case 'success': return <CheckCircle2 className={cn(cls, 'text-success-500')} />
    case 'warning': return <AlertTriangle className={cn(cls, 'text-warning-500')} />
    case 'error':   return <XCircle       className={cn(cls, 'text-error-500')} />
    default:        return <Send          className={cn(cls, 'text-blue-500')} />
  }
}

// ── Props ─────────────────────────────────────────────────────────
interface TopBarProps {
  onMenuToggle?: () => void
}

// ── Component ─────────────────────────────────────────────────────
export function TopBar({ onMenuToggle }: TopBarProps) {
  const { user, logout } = useAuthStore()
  const { openContactModal } = useContactModal()
  const navigate = useNavigate()

  // Search state
  const [isSearchOpen, setIsSearchOpen]   = useState(false)
  const [searchQuery, setSearchQuery]     = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const searchRef = useRef<HTMLInputElement>(null)

  // Notifications panel
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)
  const unreadCount = notifications.filter((n) => !n.read).length
  const notifRef = useRef<HTMLDivElement>(null)

  // User menu
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // ── Global keyboard shortcuts ─────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openContactModal()
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
        setNotifOpen(false)
        setUserMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openContactModal])

  // Focus search input when dialog opens
  useEffect(() => {
    if (isSearchOpen && searchRef.current) searchRef.current.focus()
  }, [isSearchOpen])

  // Close dropdowns on outside click
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // ── Search logic ─────────────────────────────────────────────
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return }
    const mock: SearchResult[] = [
      { type: 'client' as const, id: '1', title: 'Bar Manolo S.L.',    subtitle: 'B12345678 · 3 facturas',  path: '/clients/1' },
      { type: 'invoice' as const, id: '1', title: 'A/2026/0034',       subtitle: 'Bar Manolo S.L. · €847,00', path: '/invoices/1' },
    ].filter((r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setSearchResults(mock)
    setSelectedIndex(0)
  }, [searchQuery])

  const handleSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown')  { e.preventDefault(); setSelectedIndex((p) => Math.min(p + 1, searchResults.length - 1)) }
    if (e.key === 'ArrowUp')    { e.preventDefault(); setSelectedIndex((p) => Math.max(p - 1, 0)) }
    if (e.key === 'Enter' && searchResults[selectedIndex]) {
      navigate(searchResults[selectedIndex].path)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">

        {/* Left: hamburger + search */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search trigger — wide on sm+, icon only on xs */}
          <button
            onClick={openContactModal}
            className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors w-64 lg:w-80"
          >
            <Search className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm truncate">Buscar facturas, clientes...</span>
            <span className="ml-auto flex items-center gap-0.5 text-xs text-gray-400 flex-shrink-0">
              <Command className="w-3 h-3" />K
            </span>
          </button>
          <button
            onClick={openContactModal}
            className="sm:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Buscar"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Right: notifications + user */}
        <div className="flex items-center gap-1 sm:gap-2">

          {/* ── Notifications ── */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen((v) => !v); setUserMenuOpen(false) }}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Notificaciones"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-error-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                        Marcar todas leídas
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => { setNotifOpen(false); openContactModal() }}
                        className={cn(
                          'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50',
                          !n.read && 'bg-blue-50/40'
                        )}
                      >
                        <div className="mt-0.5 p-1.5 bg-white rounded-lg shadow-sm border border-gray-100 flex-shrink-0">
                          {notifIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-sm font-medium', n.read ? 'text-gray-700' : 'text-gray-900')}>
                            {n.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{n.body}</p>
                          <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                        </div>
                        {!n.read && (
                          <span className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>

                  {notifications.length === 0 && (
                    <div className="py-8 text-center text-gray-500 text-sm">Sin notificaciones</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── User menu ── */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => { setUserMenuOpen((v) => !v); setNotifOpen(false) }}
              className="flex items-center gap-2 px-2 sm:px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-primary-700">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <span className="hidden sm:inline text-sm font-medium text-gray-700 max-w-[120px] truncate">
                {user?.name || 'Mi cuenta'}
              </span>
              <ChevronDown className="hidden sm:block w-4 h-4 text-gray-400" />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden"
                >
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-medium text-gray-900 text-sm truncate">{user?.name || 'Usuario'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                    {user?.companyName && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{user.companyName}</p>
                    )}
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      to="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      Configuración
                    </Link>
                    <button
                      onClick={() => { setUserMenuOpen(false); logout() }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error-600 hover:bg-error-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ── Search Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15 }}
              className="fixed top-[15%] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl z-50"
            >
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                  <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKey}
                    placeholder="Buscar facturas, clientes..."
                    className="flex-1 text-base outline-none placeholder:text-gray-400 min-w-0"
                  />
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded flex-shrink-0"
                  >
                    ESC
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="py-2 max-h-72 overflow-y-auto">
                    {(['client', 'invoice'] as const).map((type) => {
                      const group = searchResults.filter((r) => r.type === type)
                      if (!group.length) return null
                      return (
                        <div key={type}>
                          <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {type === 'client' ? 'Clientes' : 'Facturas'}
                          </p>
                          {group.map((result) => {
                            const idx = searchResults.indexOf(result)
                            return (
                              <button
                                key={result.id}
                                onClick={() => { navigate(result.path); setIsSearchOpen(false); setSearchQuery('') }}
                                className={cn(
                                  'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                                  idx === selectedIndex ? 'bg-primary-50' : 'hover:bg-gray-50'
                                )}
                              >
                                {result.type === 'client'
                                  ? <Users className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                  : <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                }
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900 truncate">{result.title}</p>
                                  <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                )}

                {searchQuery.length >= 2 && searchResults.length === 0 && (
                  <div className="py-8 text-center text-gray-500 text-sm">Sin resultados para «{searchQuery}»</div>
                )}

                {searchQuery.length < 2 && (
                  <div className="py-5 px-4 text-center text-sm text-gray-500">
                    <p>Escribe para buscar facturas o clientes</p>
                    <p className="mt-1 text-xs text-gray-400">Usa ↑↓ para navegar · Enter para abrir</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
