import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, FileText, Users, CheckCircle2,
  Clock, XCircle, BarChart3, Calendar,
} from 'lucide-react'
import { Card, KpiCard } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'

// ── Mock data ─────────────────────────────────────────────────────
const MONTHLY_DATA = [
  { month: 'Ene', amount: 18400, count: 14 },
  { month: 'Feb', amount: 22100, count: 17 },
  { month: 'Mar', amount: 19800, count: 15 },
  { month: 'Abr', amount: 31200, count: 24 },
  { month: 'May', amount: 28600, count: 22 },
  { month: 'Jun', amount: 35700, count: 27 },
  { month: 'Jul', amount: 29900, count: 23 },
  { month: 'Ago', amount: 21300, count: 16 },
  { month: 'Sep', amount: 38400, count: 29 },
  { month: 'Oct', amount: 41200, count: 31 },
  { month: 'Nov', amount: 36800, count: 28 },
  { month: 'Dic', amount: 45780, count: 35 },
]

const STATUS_BREAKDOWN = [
  { status: 'FIRMADA' as const,   count: 89,  amount: 187450, pct: 57 },
  { status: 'ENVIADA' as const,   count: 34,  amount: 72300,  pct: 22 },
  { status: 'BORRADOR' as const,  count: 18,  amount: 38200,  pct: 12 },
  { status: 'ANULADA' as const,   count: 10,  amount: 18900,  pct: 6  },
  { status: 'RECTIFICADA' as const, count: 5, amount: 9100,   pct: 3  },
]

const TOP_CLIENTS = [
  { name: 'Global Services S.L.',  nif: 'B87654321', invoices: 24, amount: 58400 },
  { name: 'Tech Solutions S.A.',   nif: 'A12345678', invoices: 18, amount: 43200 },
  { name: 'Consulting Pro S.L.',   nif: 'B23456789', invoices: 15, amount: 36700 },
  { name: 'Bar Manolo S.L.',       nif: 'B34567890', invoices: 12, amount: 24800 },
  { name: 'Distribuciones XYZ',    nif: 'B45678901', invoices: 9,  amount: 18900 },
]

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

const maxAmount = Math.max(...MONTHLY_DATA.map((d) => d.amount))

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

// ── Component ─────────────────────────────────────────────────────
export default function ReportsPage() {
  const totalAmount  = MONTHLY_DATA.reduce((s, d) => s + d.amount, 0)
  const totalInvoices = MONTHLY_DATA.reduce((s, d) => s + d.count, 0)
  const lastMonth    = MONTHLY_DATA[MONTHLY_DATA.length - 1]
  const prevMonth    = MONTHLY_DATA[MONTHLY_DATA.length - 2]
  const trendPct     = Math.round(((lastMonth.amount - prevMonth.amount) / prevMonth.amount) * 100)

  return (
    <motion.div
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Informes</h1>
          <p className="text-gray-500 mt-1">Resumen de facturación · Ejercicio 2024</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Enero – Diciembre 2024</span>
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total facturado"
          value={formatCurrency(totalAmount)}
          trend={{ value: Math.abs(trendPct), direction: trendPct >= 0 ? 'up' : 'down', label: `${totalInvoices} facturas · vs. mes ant.` }}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <KpiCard
          label="Diciembre"
          value={formatCurrency(lastMonth.amount)}
          icon={<BarChart3 className="w-5 h-5" />}
        />
        <KpiCard
          label="Clientes activos"
          value="58"
          icon={<Users className="w-5 h-5" />}
        />
        <KpiCard
          label="Media por factura"
          value={formatCurrency(Math.round(totalAmount / totalInvoices))}
          icon={<FileText className="w-5 h-5" />}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Monthly bar chart */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card>
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Facturación mensual</h2>
            </div>
            <div className="p-6">
              <div className="flex items-end gap-2 h-48">
                {MONTHLY_DATA.map((d) => {
                  const heightPct = (d.amount / maxAmount) * 100
                  return (
                    <div key={d.month} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="relative w-full flex flex-col items-center justify-end" style={{ height: '160px' }}>
                        <div
                          className="w-full bg-primary-500 rounded-t-sm group-hover:bg-primary-600 transition-colors"
                          style={{ height: `${heightPct}%` }}
                          title={`${d.month}: ${formatCurrency(d.amount)}`}
                        />
                        {/* Tooltip on hover */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          {formatCurrency(d.amount)}
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-500">{d.month}</span>
                    </div>
                  )
                })}
              </div>
              {/* Y-axis labels */}
              <div className="flex justify-between text-xs text-gray-400 mt-3 border-t border-gray-100 pt-2">
                <span>0</span>
                <span>{formatCurrency(maxAmount / 2)}</span>
                <span>{formatCurrency(maxAmount)}</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Status breakdown */}
        <motion.div variants={item}>
          <Card className="h-full">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Por estado</h2>
            </div>
            <div className="p-4 space-y-3">
              {STATUS_BREAKDOWN.map((row) => (
                <div key={row.status}>
                  <div className="flex items-center justify-between mb-1">
                    <StatusBadge status={row.status} />
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">{row.count}</span>
                      <span className="text-xs text-gray-400 ml-1">facturas</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 text-right">{formatCurrency(row.amount)}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Top clients */}
      <motion.div variants={item}>
        <Card>
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Principales clientes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 border-b border-gray-100">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3 text-center hidden sm:table-cell">Facturas</th>
                  <th className="px-4 py-3 text-right">Total facturado</th>
                  <th className="px-4 py-3 hidden md:table-cell">Volumen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {TOP_CLIENTS.map((client, i) => {
                  const maxClientAmount = TOP_CLIENTS[0].amount
                  const pct = Math.round((client.amount / maxClientAmount) * 100)
                  return (
                    <tr key={client.nif} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-400 font-mono">{i + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 text-sm">{client.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{client.nif}</p>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600 hidden sm:table-cell">
                        {client.invoices}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 text-sm">
                        {formatCurrency(client.amount)}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Summary footer */}
      <motion.div variants={item}>
        <Card className="p-4 bg-gray-50">
          <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success-500" />
              <span className="text-gray-500">Cobrado:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(245320)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning-500" />
              <span className="text-gray-500">Pendiente:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(42130)}</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-error-500" />
              <span className="text-gray-500">Anulado:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(18900)}</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <TrendingDown className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">IVA repercutido:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(63614)}</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
