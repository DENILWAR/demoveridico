import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  FileSignature,
  Building2,
  Calculator,
  CheckCircle2,
  FolderOpen,
  CreditCard,
  Camera,
  FileText,
  Loader2,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, CurrencyInput } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { toast } from '@/components/ui/Toast'
import { useInvoiceStore } from '@/stores/invoiceStore'
import { useContactModal } from '@/stores/contactModalStore'
import type { BackendInvoice, BackendInvoiceLine, BackendTaxLine } from '@/services/invoiceService'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type CreationMode = 'manual' | 'folder' | 'bank' | 'photo'

interface FormLine {
  id: string
  description: string
  quantity: number
  unitPrice: number
  unit: string
  taxRate: number
}

interface CustomerData {
  nif: string
  name: string
  address: string
  city: string
  postalCode: string
  country: string
  email: string
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const TAX_RATES = [
  { value: 21, label: 'IVA 21% (General)' },
  { value: 10, label: 'IVA 10% (Reducido)' },
  { value: 4, label: 'IVA 4% (Superreducido)' },
  { value: 0, label: 'Exento de IVA' },
]

const EMPTY_LINE: Omit<FormLine, 'id'> = {
  description: '',
  quantity: 1,
  unitPrice: 0,
  unit: 'unidad',
  taxRate: 21,
}

const ISSUER_DEFAULTS = {
  issuerNif: 'B65432187',
  issuerName: 'Veridico Soluciones S.L.',
  issuerAddress: 'Calle Gran Vía 28, 28013 Madrid',
  issuerEmail: 'admin@veridico.es',
  issuerPhone: '+34 910 123 456',
  issuerIban: 'ES76 2100 0418 4012 3456 7891',
}

function genId() { return Math.random().toString(36).slice(2, 9) }

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)
}

function buildBackendInvoice(
  customer: CustomerData,
  formLines: FormLine[],
  series: string,
  notes: string,
  paymentMethod: string,
  sign: boolean,
  existingCount: number,
): BackendInvoice {
  const num = String(existingCount + 1).padStart(4, '0')
  const now = new Date().toISOString()

  const lines: BackendInvoiceLine[] = formLines.map((l, i) => ({
    lineNumber: i + 1,
    description: l.description,
    quantity: l.quantity,
    unitPrice: l.unitPrice,
    unit: l.unit,
    discountRate: 0,
    netAmount: +(l.quantity * l.unitPrice).toFixed(2),
  }))

  // Build tax breakdown per rate
  const taxMap = new Map<number, number>()
  formLines.forEach((l) => {
    const base = l.quantity * l.unitPrice
    taxMap.set(l.taxRate, (taxMap.get(l.taxRate) ?? 0) + base)
  })

  const taxes: BackendTaxLine[] = Array.from(taxMap.entries()).map(([rate, base]) => ({
    taxType: 'IVA',
    taxableBase: +base.toFixed(2),
    taxRate: rate,
    taxAmount: +(base * rate / 100).toFixed(2),
    isWithheld: false,
  }))

  const taxableBase = lines.reduce((s, l) => s + l.netAmount, 0)
  const totalTax = taxes.reduce((s, t) => s + t.taxAmount, 0)
  const totalAmount = +(taxableBase + totalTax).toFixed(2)

  const dueDate = new Date(Date.now() + 30 * 86_400_000).toISOString()

  return {
    ...ISSUER_DEFAULTS,
    id: `inv-${Date.now()}`,
    series,
    number: num,
    fullNumber: `${series}-2024-${num}`,
    issueDate: now,
    dueDate,
    status: sign ? 'FIRMADA' : 'BORRADOR',
    customerNif: customer.nif,
    customerName: customer.name,
    customerAddress: customer.address ? `${customer.address}, ${customer.postalCode} ${customer.city}` : '',
    customerEmail: customer.email,
    lines,
    taxes,
    taxableBase: +taxableBase.toFixed(2),
    totalTax: +totalTax.toFixed(2),
    totalAmount,
    invoiceType: 'ORDINARIA',
    notes,
    paymentMethod,
    digitalSignature: sign
      ? `sha256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
      : undefined,
    createdAt: now,
    updatedAt: sign ? now : undefined,
    createdBy: 'demo',
  }
}

// ─────────────────────────────────────────────
// Mock bank transactions
// ─────────────────────────────────────────────

const MOCK_TRANSACTIONS = [
  { id: 't1', date: '2024-01-22', description: 'CARGO PROVEEDOR INFORMATICA SL', amount: 1452.00, concept: 'Servicios informáticos enero' },
  { id: 't2', date: '2024-01-20', description: 'TRANSFERENCIA GLOBAL SERVICES SL', amount: 8470.50, concept: 'Proyecto integración API' },
  { id: 't3', date: '2024-01-18', description: 'PAGO CONSULTING PRO', amount: 3267.00, concept: 'Consultoría estratégica' },
  { id: 't4', date: '2024-01-15', description: 'CLIENTE DEMO SA — SERVICIOS', amount: 2904.90, concept: 'Desarrollo módulo reporting' },
  { id: 't5', date: '2024-01-12', description: 'TECH SOLUTIONS SA — LICENCIAS', amount: 1815.00, concept: 'Licencias software anuales' },
]

// ─────────────────────────────────────────────
// Mode tabs
// ─────────────────────────────────────────────

const MODES: { id: CreationMode; icon: React.ComponentType<{ className?: string }>; label: string; desc: string }[] = [
  { id: 'manual', icon: FileText, label: 'Manual', desc: 'Rellena el formulario' },
  { id: 'folder', icon: FolderOpen, label: 'Carpeta', desc: 'Importa archivos' },
  { id: 'bank', icon: CreditCard, label: 'Banco', desc: 'Desde movimientos' },
  { id: 'photo', icon: Camera, label: 'Foto / OCR', desc: 'Escanea una factura' },
]

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────

export default function NewInvoicePage() {
  const navigate = useNavigate()
  const { addInvoice, invoices } = useInvoiceStore()
  const { openContactModal } = useContactModal()

  const [mode, setMode] = useState<CreationMode>('manual')
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successCount, setSuccessCount] = useState(1)

  // ── Manual form state ────────────────────────
  const [series, setSeries] = useState('A')
  const [customer, setCustomer] = useState<CustomerData>({
    nif: '', name: '', address: '', city: '', postalCode: '', country: 'España', email: '',
  })
  const [lines, setLines] = useState<FormLine[]>([{ ...EMPTY_LINE, id: genId() }])
  const [notes, setNotes] = useState('')
  const [paymentTerms] = useState('30')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ── Folder mode state ────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [folderStep, setFolderStep] = useState<'idle' | 'scanning' | 'done'>('idle')
  const [detectedFiles, setDetectedFiles] = useState<string[]>([])

  // ── Bank mode state ──────────────────────────
  const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set())

  // ── Photo mode state ─────────────────────────
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [photoStep, setPhotoStep] = useState<'idle' | 'processing' | 'prefilled'>('idle')
  const [photoFilename, setPhotoFilename] = useState('')

  // ── Calculations ─────────────────────────────
  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0)
  const taxBreakdown = lines.reduce((acc, l) => {
    const base = l.quantity * l.unitPrice
    const key = `${l.taxRate}%`
    if (!acc[key]) acc[key] = { rate: l.taxRate, base: 0, amount: 0 }
    acc[key].base += base
    acc[key].amount += base * l.taxRate / 100
    return acc
  }, {} as Record<string, { rate: number; base: number; amount: number }>)
  const totalTax = Object.values(taxBreakdown).reduce((s, t) => s + t.amount, 0)
  const total = subtotal + totalTax

  // ── Line handlers ─────────────────────────────
  const addLine = () => setLines([...lines, { ...EMPTY_LINE, id: genId() }])
  const removeLine = (id: string) => lines.length > 1 && setLines(lines.filter((l) => l.id !== id))
  const updateLine = (id: string, updates: Partial<FormLine>) =>
    setLines(lines.map((l) => l.id === id ? { ...l, ...updates } : l))

  // ── Validation ────────────────────────────────
  const validate = () => {
    const errs: Record<string, string> = {}
    if (!customer.nif) errs.customerNif = 'El NIF es obligatorio'
    if (!customer.name) errs.customerName = 'El nombre es obligatorio'
    if (lines.some((l) => !l.description || l.unitPrice <= 0))
      errs.lines = 'Completa todos los campos de las líneas'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Save (manual) ─────────────────────────────
  const handleSave = async (sign = false) => {
    if (!validate()) return
    setIsSaving(true)
    await new Promise((r) => setTimeout(r, 900))
    const inv = buildBackendInvoice(customer, lines, series, notes, `${paymentTerms} días`, sign, invoices.length)
    addInvoice(inv)
    setIsSaving(false)
    setSuccessCount(1)
    setShowSuccess(true)
    toast.success('Factura creada', sign ? 'Factura creada y firmada.' : 'Borrador guardado.')
    setTimeout(() => openContactModal(), 700)
    setTimeout(() => navigate(`/invoices/${inv.id}`), 1400)
  }

  // ── Folder simulation ─────────────────────────
  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setFolderStep('scanning')
    setDetectedFiles(files.map((f) => f.name))
    setTimeout(() => setFolderStep('done'), 1800)
  }


  // ── Bank simulation ───────────────────────────
  const toggleTx = (id: string) => {
    const next = new Set(selectedTxIds)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelectedTxIds(next)
  }


  // ── Photo / OCR simulation ────────────────────
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFilename(file.name)
    setPhotoStep('processing')
    setTimeout(() => {
      setPhotoStep('prefilled')
      setMode('manual')
      setCustomer({
        nif: 'B12345678',
        name: 'Empresa Ejemplo S.L.',
        address: 'Calle Mayor, 123',
        city: 'Madrid',
        postalCode: '28001',
        country: 'España',
        email: 'contacto@ejemplo.com',
      })
      setLines([{
        id: genId(),
        description: 'Servicios detectados por OCR',
        quantity: 1,
        unitPrice: 1250.00,
        unit: 'servicio',
        taxRate: 21,
      }])
      setNotes(`Importado desde imagen: ${file.name}`)
      toast.success('OCR completado', 'Datos extraídos de la imagen.')
    }, 2200)
  }

  // ── Render ────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/invoices" className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Nueva Factura</h1>
            <p className="text-gray-500 text-sm mt-0.5">Serie {series} · Borrador</p>
          </div>
        </div>
        {mode === 'manual' && (
          <div className="flex flex-wrap gap-2 sm:flex-shrink-0">
            <Button variant="secondary" size="sm" leftIcon={<Save className="w-4 h-4" />}
              onClick={() => handleSave(false)} disabled={isSaving}>
              Guardar borrador
            </Button>
            <Button size="sm" leftIcon={<FileSignature className="w-4 h-4" />}
              onClick={() => handleSave(true)} disabled={isSaving} isLoading={isSaving}>
              Guardar y firmar
            </Button>
          </div>
        )}
      </div>

      {/* Success overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/90"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-4 bg-success-100 rounded-full flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10 text-success-500" />
              </motion.div>
              <h2 className="text-xl font-semibold text-gray-900">
                {successCount > 1 ? `${successCount} facturas creadas` : 'Factura guardada'}
              </h2>
              <p className="text-gray-500 mt-1">Redirigiendo...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode tabs */}
      <Card className="p-1">
        <div className="grid grid-cols-4 gap-1">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg text-center transition-colors ${
                mode === m.id
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <m.icon className={`w-5 h-5 ${mode === m.id ? 'text-primary-600' : 'text-gray-400'}`} />
              <span className="text-xs font-medium leading-tight">{m.label}</span>
              <span className="text-[10px] text-gray-400 hidden sm:block">{m.desc}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* ── MANUAL MODE ────────────────────────── */}
      {mode === 'manual' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Customer */}
            <Card>
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <h2 className="font-semibold text-gray-900">Cliente</h2>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIF / CIF *</label>
                    <Input value={customer.nif}
                      onChange={(e) => setCustomer({ ...customer, nif: e.target.value.toUpperCase() })}
                      placeholder="B12345678" error={errors.customerNif} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre / Razón social *</label>
                    <Input value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      placeholder="Empresa S.L." error={errors.customerName} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <Input value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    placeholder="Calle Ejemplo, 123" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                    <Input value={customer.postalCode}
                      onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })}
                      placeholder="28001" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                    <Input value={customer.city}
                      onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                      placeholder="Madrid" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input type="email" value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      placeholder="contacto@empresa.com" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Lines */}
            <Card>
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-gray-400" />
                    <h2 className="font-semibold text-gray-900">Líneas de factura</h2>
                  </div>
                  <Button size="sm" variant="secondary" leftIcon={<Plus className="w-4 h-4" />} onClick={addLine}>
                    Añadir línea
                  </Button>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {errors.lines && (
                  <p className="text-sm text-error-600 flex items-center gap-1">
                    <span>⚠</span> {errors.lines}
                  </p>
                )}
                {lines.map((line, idx) => (
                  <div key={line.id} className="border border-gray-200 rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Línea {idx + 1}</span>
                      {lines.length > 1 && (
                        <button onClick={() => removeLine(line.id)} className="p-1 hover:text-error-600 transition-colors">
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                      <Input value={line.description}
                        onChange={(e) => updateLine(line.id, { description: e.target.value })}
                        placeholder="Descripción del servicio o producto" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                        <Input type="number" min="1" step="0.01" value={line.quantity}
                          onChange={(e) => updateLine(line.id, { quantity: parseFloat(e.target.value) || 1 })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                        <Input value={line.unit}
                          onChange={(e) => updateLine(line.id, { unit: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio unit. *</label>
                        <CurrencyInput value={line.unitPrice}
                          onChange={(e) => updateLine(line.id, {
                            unitPrice: parseFloat((e as React.ChangeEvent<HTMLInputElement>).target.value) || 0,
                          })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">IVA</label>
                        <select
                          value={line.taxRate}
                          onChange={(e) => updateLine(line.id, { taxRate: parseInt(e.target.value) })}
                          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          {TAX_RATES.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <span className="text-sm font-semibold text-gray-900">
                        Subtotal: {formatCurrency(line.quantity * line.unitPrice)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Notes */}
            <Card>
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Notas</h2>
              </div>
              <div className="p-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Condiciones de pago, observaciones..."
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
            </Card>
          </div>

          {/* Sticky sidebar */}
          <div className="space-y-6">
            <Card>
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Configuración</h2>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serie</label>
                  <select value={series} onChange={(e) => setSeries(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="A">A — General</option>
                    <option value="B">B — Servicios</option>
                    <option value="R">R — Rectificativa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Forma de pago</label>
                  <select className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option>Transferencia bancaria</option>
                    <option>Domiciliación</option>
                    <option>Efectivo</option>
                    <option>Tarjeta</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Totals */}
            <Card className="lg:sticky lg:top-6">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Resumen</h2>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Base imponible</span>
                  <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
                {Object.entries(taxBreakdown).map(([key, t]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-500">IVA {t.rate}%</span>
                    <span className="text-gray-900">{formatCurrency(t.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-primary-700">{formatCurrency(total)}</span>
                </div>
              </div>
              <div className="p-4 pt-0 space-y-2">
                <Button fullWidth onClick={() => handleSave(false)} disabled={isSaving} variant="secondary">
                  <Save className="w-4 h-4 mr-2" /> Guardar borrador
                </Button>
                <Button fullWidth onClick={() => handleSave(true)} disabled={isSaving} isLoading={isSaving}>
                  <FileSignature className="w-4 h-4 mr-2" /> Guardar y firmar
                </Button>
              </div>
              <div className="p-4 pt-0">
                <p className="text-xs text-gray-400 text-center">
                  Conforme al RD 1007/2023 y Orden HAC/1177/2024
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── FOLDER MODE ────────────────────────── */}
      {mode === 'folder' && (
        <Card>
          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-50 rounded-2xl flex items-center justify-center">
                <FolderOpen className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="font-semibold text-gray-900 text-lg">Importar desde carpeta</h2>
              <p className="text-gray-500 text-sm mt-1">
                Selecciona archivos PDF o XML y generaremos facturas automáticamente.
              </p>
            </div>

            {folderStep === 'idle' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/40 transition-colors"
              >
                <Upload className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                <p className="font-medium text-gray-700">Haz clic para seleccionar archivos</p>
                <p className="text-sm text-gray-400 mt-1">PDF, XML, CSV — máx. 10 archivos</p>
                <input ref={fileInputRef} type="file" multiple accept=".pdf,.xml,.csv"
                  className="hidden" onChange={handleFolderSelect} />
              </div>
            )}

            {folderStep === 'scanning' && (
              <div className="flex flex-col items-center gap-3 py-8">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                <p className="font-medium text-gray-700">Analizando archivos...</p>
                <div className="space-y-1 text-sm text-gray-500">
                  {detectedFiles.map((f) => <p key={f}>📄 {f}</p>)}
                </div>
              </div>
            )}

            {folderStep === 'done' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-success-50 border border-success-200 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-success-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-success-800">{detectedFiles.length} facturas detectadas</p>
                    <p className="text-sm text-success-700">Se crearán como borradores en tu cuenta.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {detectedFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                      <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate flex-1">{f}</span>
                      <span className="text-xs text-success-600 font-medium flex-shrink-0">Listo</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" fullWidth onClick={() => { setFolderStep('idle'); setDetectedFiles([]) }}>
                    Cancelar
                  </Button>
                  <Button fullWidth onClick={openContactModal} isLoading={isSaving}>
                    Importar {detectedFiles.length} facturas
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ── BANK MODE ──────────────────────────── */}
      {mode === 'bank' && (
        <Card>
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="font-semibold text-gray-900">Movimientos bancarios</h2>
                <p className="text-sm text-gray-500 mt-0.5">Selecciona transacciones para crear facturas</p>
              </div>
              {selectedTxIds.size > 0 && (
                <Button onClick={openContactModal}>
                  Crear {selectedTxIds.size} {selectedTxIds.size === 1 ? 'factura' : 'facturas'}
                </Button>
              )}
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {MOCK_TRANSACTIONS.map((tx) => {
              const selected = selectedTxIds.has(tx.id)
              return (
                <button
                  key={tx.id}
                  onClick={() => toggleTx(tx.id)}
                  className={`w-full flex items-center gap-3 px-4 py-4 text-left transition-colors ${
                    selected ? 'bg-primary-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    selected ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
                  }`}>
                    {selected && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{tx.concept}</p>
                    <p className="text-xs text-gray-500">{tx.description} · {tx.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-gray-900 text-sm">{formatCurrency(tx.amount)}</p>
                    <p className="text-xs text-gray-400">incl. IVA</p>
                  </div>
                </button>
              )
            })}
          </div>
          {selectedTxIds.size === 0 && (
            <p className="px-4 py-3 text-sm text-gray-400 text-center">
              Selecciona uno o más movimientos para continuar
            </p>
          )}
        </Card>
      )}

      {/* ── PHOTO / OCR MODE ───────────────────── */}
      {mode === 'photo' && (
        <Card>
          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-amber-50 rounded-2xl flex items-center justify-center">
                <Camera className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="font-semibold text-gray-900 text-lg">Escanear factura</h2>
              <p className="text-gray-500 text-sm mt-1">
                Sube una foto o imagen y extraeremos los datos automáticamente con OCR.
              </p>
            </div>

            {photoStep === 'idle' && (
              <div
                onClick={() => photoInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/40 transition-colors"
              >
                <Camera className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                <p className="font-medium text-gray-700">Haz clic para subir imagen</p>
                <p className="text-sm text-gray-400 mt-1">JPG, PNG, PDF — hasta 5 MB</p>
                <input ref={photoInputRef} type="file" accept="image/*,.pdf"
                  className="hidden" onChange={handlePhotoSelect} />
              </div>
            )}

            {photoStep === 'processing' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
                <div className="text-center">
                  <p className="font-medium text-gray-700">Procesando con OCR...</p>
                  <p className="text-sm text-gray-500 mt-1">Extrayendo datos de {photoFilename}</p>
                </div>
                <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-amber-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2 }}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
