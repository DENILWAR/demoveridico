import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  TrendingUp,
  Clock,
  AlertTriangle,
  Plus,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Send,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, KpiCard } from '@/components/ui/Card'
import { StatusBadge, type InvoiceStatusType } from '@/components/ui/Badge'
import { useCertificateStore } from '@/stores/certificateStore'
import { useAuthStore } from '@/stores/authStore'
import { useInvoiceStore } from '@/stores/invoiceStore'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  return `Hace ${diffDays} días`
}

function getActivityIcon(status: InvoiceStatusType) {
  switch (status) {
    case 'BORRADOR':    return <FileText className="w-4 h-4 text-gray-500" />
    case 'FIRMADA':     return <CheckCircle2 className="w-4 h-4 text-success-500" />
    case 'ENVIADA':     return <Send className="w-4 h-4 text-blue-500" />
    case 'ANULADA':     return <XCircle className="w-4 h-4 text-error-500" />
    default:            return <FileText className="w-4 h-4 text-gray-400" />
  }
}

function getActivityText(status: InvoiceStatusType): string {
  switch (status) {
    case 'BORRADOR':    return 'Borrador creado'
    case 'FIRMADA':     return 'Factura firmada'
    case 'ENVIADA':     return 'Factura enviada'
    case 'ANULADA':     return 'Factura anulada'
    case 'RECTIFICADA': return 'Factura rectificada'
    default:            return 'Actividad'
  }
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { status: certStatus, daysUntilExpiry } = useCertificateStore()
  const invoices = useInvoiceStore((s) => s.invoices)

  // ── Computed KPIs ─────────────────────────────
  const stats = useMemo(() => {
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const thisMonth = invoices.filter((inv) => new Date(inv.issueDate) >= thisMonthStart)
    const prevMonth = invoices.filter(
      (inv) => new Date(inv.issueDate) >= prevMonthStart && new Date(inv.issueDate) < thisMonthStart
    )
    const pending = invoices.filter((inv) => inv.status === 'ENVIADA' || inv.status === 'FIRMADA')
    const overdue = invoices.filter((inv) => {
      if (!inv.dueDate) return false
      return new Date(inv.dueDate) < now && inv.status !== 'ANULADA'
    })

    const thisMonthAmount = thisMonth.reduce((s, inv) => s + inv.totalAmount, 0)
    const prevMonthAmount = prevMonth.reduce((s, inv) => s + inv.totalAmount, 0)
    const trend = prevMonthAmount > 0
      ? Math.round(((thisMonthAmount - prevMonthAmount) / prevMonthAmount) * 100)
      : 0

    return {
      thisMonth: { count: thisMonth.length, amount: thisMonthAmount, trend },
      pending: { count: pending.length, amount: pending.reduce((s, i) => s + i.totalAmount, 0) },
      overdue: { count: overdue.length, amount: overdue.reduce((s, i) => s + i.totalAmount, 0) },
    }
  }, [invoices])

  // ── Recent activity (last 4 by updatedAt/createdAt) ──────────
  const recentActivity = useMemo(() =>
    [...invoices]
      .sort((a, b) => new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime())
      .slice(0, 4),
    [invoices]
  )

  // ── Invoices needing action (BORRADOR) ────────────────────────
  const actionInvoices = useMemo(() =>
    invoices.filter((inv) => inv.status === 'BORRADOR' || inv.status === 'FIRMADA').slice(0, 4),
    [invoices]
  )

  // ── Year totals ───────────────────────────────────────────────
  const yearTotal = invoices.reduce((s, inv) => s + inv.totalAmount, 0)
  const yearCollected = invoices
    .filter((inv) => inv.status === 'FIRMADA' || inv.status === 'ENVIADA')
    .reduce((s, inv) => s + inv.totalAmount, 0)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">

      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Buenos días, {user?.name?.split(' ')[0] || 'Usuario'}
          </h1>
          <p className="text-gray-500 mt-1">Aquí tienes un resumen de tu actividad de facturación</p>
        </div>
      </motion.div>

      {/* Hero CTA */}
      <motion.div variants={itemVariants}>
        <Link to="/invoices/new">
          <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 hover:from-primary-700 hover:to-primary-800 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Plus className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Nueva Factura</h2>
                  <p className="text-primary-100">Crea y firma una factura en segundos</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 transform group-hover:translate-x-2 transition-transform" />
            </div>
          </Card>
        </Link>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard
            label="Facturado este mes"
            value={formatCurrency(stats.thisMonth.amount)}
            trend={{
              value: Math.abs(stats.thisMonth.trend),
              direction: stats.thisMonth.trend >= 0 ? 'up' : 'down',
              label: `${stats.thisMonth.count} facturas · vs. mes anterior`,
            }}
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <KpiCard
            label="Pendiente de cobro"
            value={formatCurrency(stats.pending.amount)}
            trend={{ value: stats.pending.count, direction: 'neutral', label: 'facturas pendientes' }}
            icon={<Clock className="w-5 h-5" />}
          />
          <KpiCard
            label="Vencidas"
            value={formatCurrency(stats.overdue.amount)}
            trend={{
              value: stats.overdue.count,
              direction: stats.overdue.count > 0 ? 'down' : 'neutral',
              label: 'facturas vencidas',
            }}
            icon={<AlertTriangle className="w-5 h-5" />}
          />
        </div>
      </motion.div>

      {/* Certificate warning */}
      {certStatus === 'EXPIRING_SOON' && (
        <motion.div variants={itemVariants}>
          <Card className="bg-warning-50 border-warning-200 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-warning-900">Tu certificado digital caduca pronto</h3>
                <p className="text-sm text-warning-700 mt-1">
                  Quedan {daysUntilExpiry} días. Renuévalo antes para evitar interrupciones.
                </p>
              </div>
              <Link to="/settings/certificate">
                <Button variant="secondary" size="sm">Renovar</Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Invoices requiring action */}
        <motion.div variants={itemVariants}>
          <Card>
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Requieren acción</h2>
                <Link to="/invoices?filter=BORRADOR" className="text-sm text-primary-600 hover:text-primary-700">
                  Ver todas
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {actionInvoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  to={`/invoices/${invoice.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 font-mono text-sm">{invoice.fullNumber}</span>
                      <StatusBadge status={invoice.status} />
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">{invoice.customerName}</p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="font-semibold text-gray-900 text-sm">{formatCurrency(invoice.totalAmount)}</p>
                    {invoice.dueDate && (
                      <p className="text-xs text-gray-500">
                        Vence {new Date(invoice.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
              {actionInvoices.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-success-500 mb-3" />
                  <p>¡Todo al día!</p>
                  <p className="text-sm">No tienes facturas pendientes</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Recent activity */}
        <motion.div variants={itemVariants}>
          <Card>
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Actividad reciente</h2>
                <Link to="/invoices" className="text-sm text-primary-600 hover:text-primary-700">
                  Ver historial
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {recentActivity.map((inv) => (
                <Link
                  key={inv.id}
                  to={`/invoices/${inv.id}`}
                  className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                    {getActivityIcon(inv.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 text-sm">{getActivityText(inv.status)}</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-sm text-gray-500 font-mono">{inv.fullNumber}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{inv.customerName}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium text-gray-900 text-sm">{formatCurrency(inv.totalAmount)}</p>
                    <p className="text-xs text-gray-400">{formatRelativeTime(inv.updatedAt ?? inv.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Footer stats */}
      <motion.div variants={itemVariants}>
        <Card className="p-4 bg-gray-50">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 text-sm">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500">Facturas totales:</span>
                <span className="font-semibold text-gray-900">{invoices.length}</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-gray-300" />
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500">Facturado:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(yearTotal)}</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-gray-300" />
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500">Cobrado:</span>
                <span className="font-semibold text-success-600">{formatCurrency(yearCollected)}</span>
              </div>
            </div>
            <Link to="/reports" className="text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap">
              Ver informes →
            </Link>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
