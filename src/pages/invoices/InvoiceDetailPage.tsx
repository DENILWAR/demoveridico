import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  FileSignature,
  Download,
  Copy,
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  Hash,
  Lock,
  Fingerprint,
  Edit3,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { useInvoiceStore } from '@/stores/invoiceStore'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

function mockSignatureHash(): string {
  const hex = Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
  return `sha256:${hex}`
}

// ─────────────────────────────────────────────
// Signature animation modal
// ─────────────────────────────────────────────

type SignStep = 'ready' | 'signing' | 'hashing' | 'complete'

function SignatureAnimation({
  isOpen,
  onConfirm,
  onClose,
  isSigning,
}: {
  isOpen: boolean
  onConfirm: () => void
  onClose: () => void
  isSigning: boolean
}) {
  const [step, setStep] = useState<SignStep>('ready')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isOpen) { setStep('ready'); setProgress(0) }
  }, [isOpen])

  useEffect(() => {
    if (!isSigning || !isOpen) return
    if (step === 'ready') setStep('signing')
  }, [isSigning, isOpen, step])

  useEffect(() => {
    if (step !== 'signing') return
    const iv = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) { clearInterval(iv); return 90 }
        return p + 8
      })
    }, 120)
    return () => clearInterval(iv)
  }, [step])

  const startSigning = () => {
    setStep('signing')
    onConfirm()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={step === 'ready' ? onClose : () => {}}
      title={step === 'ready' ? 'Firmar Factura' : undefined}
      size="md"
    >
      <div className="py-6">
        {step === 'ready' && (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center">
              <FileSignature className="w-10 h-10 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Firmar esta factura?</h3>
            <p className="text-gray-500 mb-6">
              Se aplicará firma digital conforme al RD 1007/2023. Esta acción es irreversible.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-blue-800 font-medium">Se realizará:</p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Firma digital RSA/SHA-256</li>
                <li>• Generación de hash SHA-256</li>
                <li>• Encadenamiento con registro anterior</li>
                <li>• Sellado temporal RFC 3161</li>
                <li>• Registro inmutable (Orden HAC/1177/2024)</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={onClose}>Cancelar</Button>
              <Button fullWidth onClick={startSigning}>
                <Lock className="w-4 h-4 mr-2" />
                Firmar ahora
              </Button>
            </div>
          </div>
        )}

        {step === 'signing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <motion.div
              className="w-24 h-24 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Fingerprint className="w-12 h-12 text-primary-600" />
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Firmando documento...</h3>
            <p className="text-gray-500 mb-6">Aplicando firma digital RSA/SHA-256</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <motion.div
                className="bg-primary-600 h-2 rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-sm text-gray-400">{progress}%</p>
          </motion.div>
        )}

        {step === 'hashing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <motion.div
              className="w-24 h-24 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            >
              <Hash className="w-12 h-12 text-amber-600" />
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Generando hash...</h3>
            <p className="text-gray-500">Calculando SHA-256 del documento</p>
          </motion.div>
        )}

        {step === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              className="w-24 h-24 mx-auto mb-6 bg-success-100 rounded-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <CheckCircle2 className="w-12 h-12 text-success-500" />
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Factura firmada!</h3>
            <p className="text-gray-500">La factura ha sido firmada y registrada correctamente.</p>
          </motion.div>
        )}
      </div>
    </Modal>
  )
}

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 bg-gray-200 rounded-lg" />
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 bg-gray-100 rounded-xl" />
        <div className="space-y-4">
          <div className="h-40 bg-gray-100 rounded-xl" />
          <div className="h-32 bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getById, updateInvoice } = useInvoiceStore()

  const [showSignModal, setShowSignModal] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [isSigning, setIsSigning] = useState(false)
  const [signDone, setSignDone] = useState(false)

  const invoice = id ? getById(id) : undefined

  // ── Mock sign ────────────────────────────────
  const handleSign = async () => {
    setIsSigning(true)
    // Simulate network delay then update store
    await new Promise((r) => setTimeout(r, 2200))
    updateInvoice(id!, {
      status: 'FIRMADA',
      digitalSignature: mockSignatureHash(),
      updatedAt: new Date().toISOString(),
    })
    setIsSigning(false)
    setSignDone(true)
    toast.success('Factura firmada', 'Registro inmutable creado.')
    setTimeout(() => setShowSignModal(false), 1500)
  }

  // ── Mock cancel ──────────────────────────────
  const handleCancel = () => {
    updateInvoice(id!, { status: 'ANULADA', updatedAt: new Date().toISOString() })
    toast.info('Factura anulada', 'La factura ha sido anulada.')
    setShowCancelConfirm(false)
  }

  const handleCopyNumber = () => {
    if (!invoice) return
    navigator.clipboard.writeText(invoice.fullNumber)
    toast.success('Copiado', 'Número copiado al portapapeles.')
  }

  const handleOpenPdf = () => {
    toast.info('PDF no disponible', 'La generación de PDF requiere conexión al servidor.')
  }

  // Reset signDone when modal closes
  useEffect(() => {
    if (!showSignModal) setSignDone(false)
  }, [showSignModal])

  // ── Not found ────────────────────────────────
  if (!invoice) {
    return (
      <div className="space-y-6">
        <Link to="/invoices" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">Factura no encontrada</h3>
          <p className="text-gray-500 text-sm mb-4">El identificador no corresponde a ninguna factura.</p>
          <Button onClick={() => navigate('/invoices')}>Ir a Facturas</Button>
        </Card>
      </div>
    )
  }

  if (!id) return <DetailSkeleton />

  const isDraft    = invoice.status === 'BORRADOR'
  const isSigned   = invoice.status === 'FIRMADA'
  const isSent     = invoice.status === 'ENVIADA'
  const isCancelled = invoice.status === 'ANULADA'

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <Link to="/invoices" className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 mt-0.5">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-mono truncate">
                {invoice.fullNumber}
              </h1>
              <button onClick={handleCopyNumber} className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0">
                <Copy className="w-4 h-4 text-gray-400" />
              </button>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-gray-500 mt-0.5 text-sm">Emitida el {formatDate(invoice.issueDate)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:flex-shrink-0">
          {isDraft && (
            <Button
              size="sm"
              leftIcon={<FileSignature className="w-4 h-4" />}
              onClick={() => setShowSignModal(true)}
            >
              Firmar
            </Button>
          )}
          {isDraft && (
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Edit3 className="w-4 h-4" />}
              onClick={() => navigate(`/invoices/new?edit=${id}`)}
            >
              Editar
            </Button>
          )}
          {!isCancelled && (
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleOpenPdf}
            >
              Ver PDF
            </Button>
          )}
          {(isDraft || isSigned) && !isCancelled && (
            <Button
              size="sm"
              variant="danger"
              leftIcon={<XCircle className="w-4 h-4" />}
              onClick={() => setShowCancelConfirm(true)}
            >
              Anular
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main: invoice preview */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {invoice.invoiceType === 'RECTIFICATIVA' ? 'FACTURA RECTIFICATIVA' : 'FACTURA'}
                  </h2>
                  <p className="text-lg font-mono text-gray-600 mt-1">{invoice.fullNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Fecha de emisión</p>
                  <p className="font-medium">{formatDate(invoice.issueDate)}</p>
                  {invoice.dueDate && (
                    <>
                      <p className="text-sm text-gray-500 mt-2">Vencimiento</p>
                      <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Issuer / customer */}
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">DE</p>
                  <p className="font-semibold text-gray-900">{invoice.issuerName}</p>
                  <p className="text-gray-600 font-mono text-sm">{invoice.issuerNif}</p>
                  {invoice.issuerAddress && <p className="text-gray-600 text-sm">{invoice.issuerAddress}</p>}
                  {invoice.issuerEmail && <p className="text-gray-500 text-sm">{invoice.issuerEmail}</p>}
                  {invoice.issuerPhone && <p className="text-gray-500 text-sm">{invoice.issuerPhone}</p>}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">PARA</p>
                  <p className="font-semibold text-gray-900">{invoice.customerName}</p>
                  <p className="text-gray-600 font-mono text-sm">{invoice.customerNif}</p>
                  {invoice.customerAddress && <p className="text-gray-600 text-sm">{invoice.customerAddress}</p>}
                  {invoice.customerEmail && <p className="text-gray-500 text-sm">{invoice.customerEmail}</p>}
                </div>
              </div>
            </div>

            {/* Line items */}
            {invoice.lines.length > 0 && (
              <div className="p-6 border-b border-gray-200 overflow-x-auto">
                <table className="w-full min-w-[400px]">
                  <thead>
                    <tr className="text-left text-sm font-medium text-gray-500 border-b border-gray-200">
                      <th className="pb-3">Concepto</th>
                      <th className="pb-3 text-right">Cant.</th>
                      <th className="pb-3 text-right">Precio</th>
                      <th className="pb-3 text-right">Neto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoice.lines.map((line) => (
                      <tr key={line.lineNumber}>
                        <td className="py-4">
                          <p className="font-medium text-gray-900">{line.description}</p>
                          {line.discountRate > 0 && (
                            <p className="text-xs text-gray-400">Dto: {line.discountRate}%</p>
                          )}
                        </td>
                        <td className="py-4 text-right text-gray-600 text-sm">
                          {line.quantity} {line.unit}
                        </td>
                        <td className="py-4 text-right text-gray-600 text-sm">
                          {formatCurrency(line.unitPrice)}
                        </td>
                        <td className="py-4 text-right font-medium text-gray-900">
                          {formatCurrency(line.netAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Taxes + totals */}
            <div className="p-6 bg-gray-50">
              <div className="flex justify-end">
                <div className="w-full sm:w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Base imponible</span>
                    <span className="text-gray-900">{formatCurrency(invoice.taxableBase)}</span>
                  </div>
                  {invoice.taxes.map((t, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        {t.isWithheld ? '↓ ' : ''}{t.taxType} ({t.taxRate}%)
                      </span>
                      <span className={t.isWithheld ? 'text-error-600' : 'text-gray-900'}>
                        {t.isWithheld ? '-' : ''}{formatCurrency(t.taxAmount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">{formatCurrency(invoice.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment / notes */}
            {(invoice.paymentMethod || invoice.notes) && (
              <div className="p-6 border-t border-gray-200 space-y-3">
                {invoice.paymentMethod && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Forma de pago</p>
                    <p className="text-sm text-gray-700">{invoice.paymentMethod}</p>
                  </div>
                )}
                {invoice.issuerIban && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-0.5">IBAN</p>
                    <p className="text-sm font-mono text-gray-700">{invoice.issuerIban}</p>
                  </div>
                )}
                {invoice.notes && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Notas</p>
                    <p className="text-sm text-gray-700">{invoice.notes}</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          {/* Status timeline */}
          <Card>
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Estado</h3>
            </div>
            <div className="p-4 space-y-3">
              <TimelineItem label="Creada" date={invoice.createdAt} done />
              <TimelineItem
                label="Firmada"
                date={!isDraft ? invoice.updatedAt : undefined}
                done={!isDraft && !isCancelled}
                pending={isDraft}
              />
              <TimelineItem
                label="Enviada"
                done={isSent}
                pending={isSigned}
              />
            </div>
          </Card>

          {/* Signature info */}
          {invoice.digitalSignature && (
            <Card>
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-success-500" />
                  <h3 className="font-semibold text-gray-900">Firma Digital</h3>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Huella digital (truncada)</p>
                  <p className="font-mono text-xs text-gray-700 bg-gray-100 p-2 rounded break-all">
                    {invoice.digitalSignature.substring(0, 80)}…
                  </p>
                </div>
                {invoice.updatedAt && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Firmada el</p>
                    <p className="text-sm text-gray-700">{formatDate(invoice.updatedAt)}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Quick actions */}
          <Card>
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Acciones rápidas</h3>
            </div>
            <div className="p-2">
              <button
                onClick={handleOpenPdf}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-700">Ver / Descargar PDF</span>
              </button>
              {isDraft && (
                <button
                  onClick={() => setShowSignModal(true)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Firmar factura</span>
                </button>
              )}
              {(isDraft || isSigned) && !isCancelled && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <XCircle className="w-4 h-4 text-error-400 flex-shrink-0" />
                  <span className="text-sm text-error-600">Anular factura</span>
                </button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Signature animation modal */}
      <SignatureAnimation
        isOpen={showSignModal}
        onConfirm={handleSign}
        onClose={() => setShowSignModal(false)}
        isSigning={isSigning || signDone}
      />

      {/* Cancel confirm */}
      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancel}
        title="Anular factura"
        message={`¿Seguro que quieres anular la factura ${invoice.fullNumber}? Esta acción no se puede deshacer.`}
        confirmText="Anular"
        variant="danger"
      />
    </div>
  )
}

// ─────────────────────────────────────────────
// Timeline item
// ─────────────────────────────────────────────
function TimelineItem({
  label,
  date,
  done,
  pending,
}: {
  label: string
  date?: string
  done: boolean
  pending?: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
          done ? 'bg-success-100' : 'bg-gray-100'
        }`}
      >
        {done ? (
          <CheckCircle2 className="w-4 h-4 text-success-500" />
        ) : (
          <Clock className={`w-4 h-4 ${pending ? 'text-warning-400' : 'text-gray-400'}`} />
        )}
      </div>
      <div>
        <p className={`font-medium ${done ? 'text-gray-900' : 'text-gray-400'}`}>{label}</p>
        {date && (
          <p className="text-xs text-gray-400">{new Date(date).toLocaleDateString('es-ES')}</p>
        )}
      </div>
    </div>
  )
}
