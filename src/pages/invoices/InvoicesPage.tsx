import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Download,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ArrowUpDown,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { StatusBadge, type InvoiceStatusType } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { useInvoiceStore } from '@/stores/invoiceStore'
import type { BackendInvoice } from '@/services/invoiceService'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getStatusIcon(status: InvoiceStatusType) {
  switch (status) {
    case 'FIRMADA':
    case 'ENVIADA':
      return <CheckCircle2 className="w-4 h-4" />
    case 'BORRADOR':
      return <Clock className="w-4 h-4" />
    case 'RECTIFICADA':
      return <AlertTriangle className="w-4 h-4" />
    case 'ANULADA':
      return <XCircle className="w-4 h-4" />
    case 'BLOQUEADA':
      return <FileText className="w-4 h-4" />
    default:
      return <FileText className="w-4 h-4" />
  }
}

function getStatusIconBg(status: InvoiceStatusType): string {
  switch (status) {
    case 'ANULADA':
    case 'RECTIFICADA': return 'bg-error-100'
    case 'ENVIADA':
    case 'FIRMADA':     return 'bg-success-100'
    default:            return 'bg-gray-100'
  }
}


// ─────────────────────────────────────────────
// Skeleton row (loading placeholder)
// ─────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="grid grid-cols-12 gap-4 px-4 py-4 items-center animate-pulse">
      <div className="col-span-3 flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-200 rounded-lg" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-28 bg-gray-200 rounded" />
          <div className="h-3 w-16 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="col-span-3 space-y-1.5">
        <div className="h-3.5 w-36 bg-gray-200 rounded" />
        <div className="h-3 w-20 bg-gray-100 rounded" />
      </div>
      <div className="col-span-2 space-y-1.5">
        <div className="h-3.5 w-20 bg-gray-200 rounded" />
        <div className="h-3 w-24 bg-gray-100 rounded" />
      </div>
      <div className="col-span-2 flex justify-end space-y-1.5 flex-col items-end">
        <div className="h-3.5 w-20 bg-gray-200 rounded" />
        <div className="h-3 w-16 bg-gray-100 rounded" />
      </div>
      <div className="col-span-1 flex justify-center">
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
      </div>
      <div className="col-span-1" />
    </div>
  )
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

type SortKey = 'date' | 'amount' | 'number'

export default function InvoicesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string>(
    searchParams.get('filter') || 'all'
  )
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [sortBy] = useState<SortKey>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // ── Store ────────────────────────────────────
  const invoices = useInvoiceStore((s) => s.invoices)
  const isLoading = false

  // ── Status tab counts ───────────────────────
  const countsByStatus = useMemo(() => {
    const map: Record<string, number> = { all: invoices.length }
    for (const inv of invoices) {
      map[inv.status] = (map[inv.status] ?? 0) + 1
    }
    return map
  }, [invoices])

  const statusFilters = [
    { value: 'all',        label: 'Todas' },
    { value: 'BORRADOR',   label: 'Borrador' },
    { value: 'FIRMADA',    label: 'Firmadas' },
    { value: 'ENVIADA',    label: 'Enviadas' },
    { value: 'RECTIFICADA', label: 'Rectificadas' },
    { value: 'ANULADA',    label: 'Anuladas' },
    { value: 'BLOQUEADA',  label: 'Bloqueadas' },
  ]

  // ── Filter + sort (client-side) ─────────────
  const filteredInvoices = useMemo(() => {
    let result = [...invoices]

    if (selectedFilter !== 'all') {
      result = result.filter((inv) => inv.status === selectedFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (inv) =>
          inv.fullNumber.toLowerCase().includes(q) ||
          inv.customerName.toLowerCase().includes(q) ||
          inv.customerNif.toLowerCase().includes(q)
      )
    }

    if (fromDate) {
      result = result.filter((inv) => new Date(inv.issueDate) >= new Date(fromDate))
    }
    if (toDate) {
      result = result.filter((inv) => new Date(inv.issueDate) <= new Date(toDate))
    }

    result.sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case 'date':   cmp = new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime(); break
        case 'amount': cmp = a.totalAmount - b.totalAmount; break
        case 'number': cmp = a.fullNumber.localeCompare(b.fullNumber); break
      }
      return sortOrder === 'asc' ? cmp : -cmp
    })

    return result
  }, [invoices, selectedFilter, searchQuery, fromDate, toDate, sortBy, sortOrder])

  // ── Handlers ────────────────────────────────
  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter)
    if (filter === 'all') {
      searchParams.delete('filter')
    } else {
      searchParams.set('filter', filter)
    }
    setSearchParams(searchParams)
  }

  const handleApplyDateFilter = () => {
    setShowFilterModal(false)
  }

  const handleClearDateFilter = () => {
    setFromDate('')
    setToDate('')
    setShowFilterModal(false)
  }

  // ── Render ────────────���──────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>
          <p className="text-gray-500 mt-1">
            {isLoading
              ? 'Cargando...'
              : `${invoices.length} factura${invoices.length !== 1 ? 's' : ''} en total`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/invoices/new">
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              Nueva Factura
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por número, cliente o NIF..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Calendar className="w-4 h-4" />}
              onClick={() => setShowFilterModal(true)}
            >
              {fromDate || toDate ? 'Fecha ●' : 'Fecha'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowUpDown className="w-4 h-4" />}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'desc' ? 'Más recientes' : 'Más antiguas'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              disabled
            >
              Exportar
            </Button>
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
          {statusFilters.map((f) => {
            const count = countsByStatus[f.value] ?? 0
            if (f.value !== 'all' && count === 0) return null
            return (
              <button
                key={f.value}
                onClick={() => handleFilterChange(f.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedFilter === f.value
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
                {count > 0 && (
                  <span
                    className={`ml-1.5 ${
                      selectedFilter === f.value ? 'text-primary-500' : 'text-gray-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Invoice list */}
      <Card>
        {/* Table header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-500">
          <div className="col-span-3">Factura</div>
          <div className="col-span-3">Cliente</div>
          <div className="col-span-2">Fecha</div>
          <div className="col-span-2 text-right">Importe</div>
          <div className="col-span-1 text-center">Estado</div>
          <div className="col-span-1" />
        </div>

        {/* Loading skeletons — no fullscreen spinner */}
        {isLoading && (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        )}

        {/* Invoice rows */}
        {!isLoading && (
          <div className="divide-y divide-gray-100">
            <AnimatePresence>
              {filteredInvoices.map((invoice) => (
                <InvoiceRow key={invoice.id} invoice={invoice} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredInvoices.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="font-medium text-gray-900 mb-1">
              No se encontraron facturas
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {searchQuery || fromDate || toDate
                ? 'Prueba con otros filtros'
                : 'Crea tu primera factura para empezar'}
            </p>
            {!searchQuery && !fromDate && !toDate && (
              <Link to="/invoices/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Factura
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Pagination info */}
        {!isLoading && filteredInvoices.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              {filteredInvoices.length === invoices.length
                ? `${invoices.length} facturas`
                : `${filteredInvoices.length} de ${invoices.length} facturas`}
            </p>
          </div>
        )}
      </Card>

      {/* Date filter modal */}
      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filtrar por fecha"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" fullWidth onClick={handleClearDateFilter}>
              Limpiar
            </Button>
            <Button fullWidth onClick={handleApplyDateFilter}>
              Aplicar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ──────────────────────────────��──────────────
// Invoice row — extracted to avoid re-renders
// ─────────────────────────────────────────────
function InvoiceRow({ invoice }: { invoice: BackendInvoice }) {
  const iconBg = getStatusIconBg(invoice.status)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      layout
    >
      <Link
        to={`/invoices/${invoice.id}`}
        className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors"
      >
        {/* Status icon */}
        <div className={`p-2 rounded-lg flex-shrink-0 ${iconBg}`}>
          {getStatusIcon(invoice.status)}
        </div>

        {/* Main info — grows */}
        <div className="flex-1 min-w-0">
          {/* Row 1: number + amount (always visible) */}
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-gray-900 font-mono text-sm truncate">
              {invoice.fullNumber}
            </p>
            <p className="font-semibold text-gray-900 text-sm flex-shrink-0">
              {formatCurrency(invoice.totalAmount)}
            </p>
          </div>
          {/* Row 2: customer + status badge (always visible) */}
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p className="text-sm text-gray-500 truncate">{invoice.customerName}</p>
            <StatusBadge status={invoice.status} />
          </div>
          {/* Row 3: date — hidden on small, shown on md+ inline */}
          <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
            {formatDate(invoice.issueDate)}
            {invoice.dueDate && <span className="ml-2">· Vence: {formatDate(invoice.dueDate)}</span>}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}
