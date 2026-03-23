/**
 * FeedPage — Mobile-first invoice feed
 *
 * Mobile:  Swipeable card stack
 *   • Swipe RIGHT → sign (if BORRADOR)
 *   • Swipe LEFT  → open detail
 *
 * Desktop: Grid of cards
 */
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import {
  FileText, CheckCircle2, Clock, XCircle,
  ChevronRight, Plus, Inbox,
  FileSignature, Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { toast } from '@/components/ui/Toast'
import { useInvoiceStore } from '@/stores/invoiceStore'
import { useContactModal } from '@/stores/contactModalStore'
import type { BackendInvoice } from '@/services/invoiceService'
import { cn } from '@/utils/cn'

// ── Helpers ──────────────────────────────────────────────────────
function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

const STATUS_COLOR: Record<string, string> = {
  BORRADOR:    'border-l-gray-300',
  FIRMADA:     'border-l-success-400',
  ENVIADA:     'border-l-primary-400',
  RECTIFICADA: 'border-l-warning-400',
  ANULADA:     'border-l-error-400',
  BLOQUEADA:   'border-l-gray-500',
}

// ── Swipeable card ────────────────────────────────────────────────
function SwipeCard({
  invoice,
  onSign,
  onDismiss,
}: {
  invoice: BackendInvoice
  onSign: (id: string) => void
  onDismiss: () => void
}) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-160, 0, 160], [-12, 0, 12])
  const opacityLeft  = useTransform(x, [-160, -60, 0], [1, 0.8, 0])
  const opacityRight = useTransform(x, [0, 60, 160], [0, 0.8, 1])
  const navigate = useNavigate()
  const isDraft = invoice.status === 'BORRADOR'

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 100) {
      if (isDraft) onSign(invoice.id)
      else { toast.info('Solo borradores', 'Solo se pueden firmar facturas en borrador.'); onDismiss() }
    } else if (info.offset.x < -100) {
      navigate(`/invoices/${invoice.id}`)
    }
  }

  return (
    <div className="relative select-none touch-none">
      {/* Swipe hints */}
      <div className="absolute inset-0 flex items-center justify-between px-8 rounded-2xl pointer-events-none">
        <motion.div style={{ opacity: opacityRight }} className="flex flex-col items-center gap-1">
          <div className={cn('w-14 h-14 rounded-full flex items-center justify-center', isDraft ? 'bg-success-500' : 'bg-gray-400')}>
            <FileSignature className="w-7 h-7 text-white" />
          </div>
          <span className={cn('text-xs font-semibold', isDraft ? 'text-success-600' : 'text-gray-500')}>
            {isDraft ? 'Firmar' : 'Solo borradores'}
          </span>
        </motion.div>
        <motion.div style={{ opacity: opacityLeft }} className="flex flex-col items-center gap-1">
          <div className="w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center">
            <Eye className="w-7 h-7 text-white" />
          </div>
          <span className="text-xs font-semibold text-primary-600">Ver detalle</span>
        </motion.div>
      </div>

      {/* Card */}
      <motion.div
        style={{ x, rotate }}
        drag="x"
        dragConstraints={{ left: -200, right: 200 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: 'grabbing' }}
        className={cn(
          'relative bg-white rounded-2xl shadow-lg border-l-4 p-5 cursor-grab active:cursor-grabbing',
          STATUS_COLOR[invoice.status] ?? 'border-l-gray-300'
        )}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="font-bold text-gray-900 font-mono text-base">{invoice.fullNumber}</p>
          <StatusBadge status={invoice.status} />
        </div>
        <p className="font-semibold text-gray-900 text-lg truncate">{invoice.customerName}</p>
        <p className="text-sm text-gray-500 font-mono">{invoice.customerNif}</p>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-end justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Importe total</p>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">
              {formatCurrency(invoice.totalAmount)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">IVA: {formatCurrency(invoice.totalTax)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Emitida</p>
            <p className="text-sm font-medium text-gray-600">{formatDate(invoice.issueDate)}</p>
          </div>
        </div>
        <p className="text-center text-xs text-gray-300 mt-4">← Ver detalle &nbsp;·&nbsp; Firmar →</p>
      </motion.div>
    </div>
  )
}

// ── Desktop card ──────────────────────────────────────────────────
function DesktopCard({ invoice }: { invoice: BackendInvoice }) {
  return (
    <Link
      to={`/invoices/${invoice.id}`}
      className={cn(
        'bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow',
        'border-l-4 p-4 block',
        STATUS_COLOR[invoice.status] ?? 'border-l-gray-300'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-semibold text-gray-900 font-mono text-sm">{invoice.fullNumber}</p>
        <StatusBadge status={invoice.status} />
      </div>
      <p className="font-medium text-gray-900 truncate">{invoice.customerName}</p>
      <p className="text-xs text-gray-500 font-mono">{invoice.customerNif}</p>
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <p className="font-bold text-gray-900">{formatCurrency(invoice.totalAmount)}</p>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span>{formatDate(invoice.issueDate)}</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </Link>
  )
}

// ── Empty state ───────────────────────────────────────────────────
function EmptyFeed() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Inbox className="w-10 h-10 text-gray-300" />
      </div>
      <h3 className="font-semibold text-gray-900 text-lg mb-1">Sin facturas</h3>
      <p className="text-gray-500 text-sm mb-6">Crea tu primera factura para empezar a facturar.</p>
      <Link to="/invoices/new">
        <Button leftIcon={<Plus className="w-4 h-4" />}>Nueva Factura</Button>
      </Link>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────
export default function FeedPage() {
  const navigate = useNavigate()
  const { invoices, updateInvoice } = useInvoiceStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const { openContactModal } = useContactModal()

  // Gate: when all cards are swiped, show conversion modal
  useEffect(() => {
    if (invoices.length > 0 && currentIndex >= invoices.length) {
      const t = setTimeout(() => openContactModal(), 600)
      return () => clearTimeout(t)
    }
  }, [currentIndex, invoices.length, openContactModal])

  const handleSign = async (id: string) => {
    toast.info('Firmando...', 'La firma tardará un momento.')
    await new Promise((r) => setTimeout(r, 1800))
    updateInvoice(id, {
      status: 'FIRMADA',
      digitalSignature: `sha256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      updatedAt: new Date().toISOString(),
    })
    toast.success('Firmada', 'Factura firmada correctamente.')
    setCurrentIndex((i) => Math.min(i + 1, invoices.length))
  }

  const handleDismiss = () =>
    setCurrentIndex((i) => Math.min(i + 1, invoices.length))

  const pendingCards = invoices.slice(currentIndex)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feed</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {invoices.length} factura{invoices.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/invoices/new">
          <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>Nueva</Button>
        </Link>
      </div>

      {/* ── MOBILE: swipe stack ── */}
      <div className="sm:hidden">
        {invoices.length === 0 ? (
          <EmptyFeed />
        ) : pendingCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <CheckCircle2 className="w-16 h-16 text-success-400 mb-4" />
            <h3 className="font-semibold text-gray-900 text-lg mb-1">¡Al día!</h3>
            <p className="text-gray-500 text-sm mb-6">Has revisado todas las facturas.</p>
            <Button variant="secondary" onClick={() => setCurrentIndex(0)}>Volver al inicio</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all"
                  style={{ width: `${(currentIndex / invoices.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {currentIndex}/{invoices.length}
              </span>
            </div>

            {/* Card stack */}
            <div className="relative" style={{ height: '340px' }}>
              {pendingCards[1] && (
                <div className="absolute inset-0 scale-95 translate-y-3 opacity-60 rounded-2xl bg-white shadow border border-gray-100" />
              )}
              <AnimatePresence>
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  className="absolute inset-0"
                >
                  <SwipeCard
                    invoice={pendingCards[0]}
                    onSign={handleSign}
                    onDismiss={handleDismiss}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth leftIcon={<Eye className="w-4 h-4" />}
                onClick={() => navigate(`/invoices/${pendingCards[0].id}`)}>
                Ver detalle
              </Button>
              {pendingCards[0].status === 'BORRADOR' && (
                <Button fullWidth leftIcon={<FileSignature className="w-4 h-4" />}
                  onClick={() => handleSign(pendingCards[0].id)}>
                  Firmar
                </Button>
              )}
            </div>

            <div className="flex justify-between text-sm">
              <button onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={pendingCards.length <= 1}>
                Saltar →
              </button>
              <Link to="/invoices" className="text-primary-600 font-medium hover:text-primary-700">
                Ver todas las facturas
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── DESKTOP: grid ── */}
      <div className="hidden sm:block">
        {invoices.length === 0 ? (
          <EmptyFeed />
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Total', value: invoices.length, icon: FileText, color: 'text-gray-500' },
                { label: 'Borradores', value: invoices.filter(i => i.status === 'BORRADOR').length, icon: Clock, color: 'text-warning-500' },
                { label: 'Firmadas', value: invoices.filter(i => i.status === 'FIRMADA').length, icon: CheckCircle2, color: 'text-success-500' },
                { label: 'Anuladas', value: invoices.filter(i => i.status === 'ANULADA').length, icon: XCircle, color: 'text-error-500' },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                  <s.icon className={cn('w-6 h-6 flex-shrink-0', s.color)} />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {invoices.map((inv) => <DesktopCard key={inv.id} invoice={inv} />)}
            </div>

            <div className="mt-4 text-center">
              <Link to="/invoices">
                <Button variant="secondary">
                  Ver gestión completa de facturas
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
