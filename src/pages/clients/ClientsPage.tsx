import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Building2,
  User,
  Edit,
  Trash2,
  FileText,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { useClientStore, type Client } from '@/stores/clientStore'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)
}

function formatDate(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function genId() { return Math.random().toString(36).slice(2, 9) }

// ─────────────────────────────────────────────
// Client form modal
// ─────────────────────────────────────────────

type FormData = {
  type: 'company' | 'individual'
  nif: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  country: string
}

function ClientFormModal({
  isOpen,
  onClose,
  client,
  onSave,
}: {
  isOpen: boolean
  onClose: () => void
  client?: Client | null
  onSave: (data: FormData) => void
}) {
  const [formData, setFormData] = useState<FormData>({
    type: client?.type ?? 'company',
    nif: client?.nif ?? '',
    name: client?.name ?? '',
    email: client?.email ?? '',
    phone: client?.phone ?? '',
    address: client?.address ?? '',
    city: client?.city ?? '',
    postalCode: client?.postalCode ?? '',
    country: client?.country ?? 'España',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = () => {
    const errs: typeof errors = {}
    if (!formData.nif)  errs.nif  = 'El NIF es obligatorio'
    if (!formData.name) errs.name = 'El nombre es obligatorio'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    onSave(formData)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={client ? 'Editar cliente' : 'Nuevo cliente'} size="lg">
      <div className="space-y-4">
        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de cliente</label>
          <div className="flex gap-4">
            {(['company', 'individual'] as const).map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="type" value={type}
                  checked={formData.type === type}
                  onChange={() => setFormData((p) => ({ ...p, type }))}
                  className="w-4 h-4 text-primary-600" />
                {type === 'company'
                  ? <><Building2 className="w-4 h-4 text-gray-400" /><span className="text-gray-700">Empresa</span></>
                  : <><User className="w-4 h-4 text-gray-400" /><span className="text-gray-700">Autónomo / Particular</span></>
                }
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.type === 'company' ? 'CIF' : 'NIF'} *
            </label>
            <Input value={formData.nif} onChange={(e) => setFormData((p) => ({ ...p, nif: e.target.value.toUpperCase() }))}
              placeholder={formData.type === 'company' ? 'B12345678' : '12345678A'} error={errors.nif} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.type === 'company' ? 'Razón social' : 'Nombre completo'} *
            </label>
            <Input value={formData.name} onChange={set('name')}
              placeholder={formData.type === 'company' ? 'Empresa S.L.' : 'Juan García López'} error={errors.name} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input type="email" value={formData.email} onChange={set('email')} placeholder="contacto@empresa.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <Input type="tel" value={formData.phone} onChange={set('phone')} placeholder="+34 912 345 678" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
          <Input value={formData.address} onChange={set('address')} placeholder="Calle Mayor, 123" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
            <Input value={formData.postalCode} onChange={set('postalCode')} placeholder="28001" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
            <Input value={formData.city} onChange={set('city')} placeholder="Madrid" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
            <Input value={formData.country} onChange={set('country')} placeholder="España" />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="secondary" fullWidth onClick={onClose}>Cancelar</Button>
          <Button fullWidth onClick={handleSubmit}>
            {client ? 'Guardar cambios' : 'Crear cliente'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────

export default function ClientsPage() {
  const { clients, addClient, updateClient, deleteClient } = useClientStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return clients
    const q = searchQuery.toLowerCase()
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.nif.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
    )
  }, [clients, searchQuery])

  const stats = useMemo(() => ({
    total: clients.length,
    totalInvoiced: clients.reduce((s, c) => s + c.totalInvoiced, 0),
    avg: clients.length ? clients.reduce((s, c) => s + c.totalInvoiced, 0) / clients.length : 0,
  }), [clients])

  const handleSave = (data: FormData) => {
    if (editingClient) {
      updateClient(editingClient.id, data)
      toast.success('Cliente actualizado', 'Los datos del cliente han sido actualizados.')
    } else {
      addClient({
        id: genId(),
        type: data.type,
        nif: data.nif,
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        postalCode: data.postalCode || undefined,
        country: data.country || 'España',
        totalInvoiced: 0,
        invoiceCount: 0,
        createdAt: new Date().toISOString(),
      })
      toast.success('Cliente creado', 'El nuevo cliente ha sido añadido.')
    }
    setShowModal(false)
    setEditingClient(null)
  }

  const handleDelete = () => {
    if (!deletingClient) return
    deleteClient(deletingClient.id)
    setDeletingClient(null)
    toast.success('Cliente eliminado', 'El cliente ha sido eliminado de tu base de datos.')
  }

  const openEdit = (client: Client) => {
    setEditingClient(client)
    setShowModal(true)
  }

  const openNew = () => {
    setEditingClient(null)
    setShowModal(true)
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">Gestiona tu base de datos de clientes</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openNew}>
          Nuevo Cliente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg flex-shrink-0">
              <Building2 className="w-5 h-5 text-primary-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-500">Total clientes</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success-100 rounded-lg flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-success-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-500">Total facturado</p>
              <p className="text-xl font-bold text-gray-900 truncate">{formatCurrency(stats.totalInvoiced)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-500">Media por cliente</p>
              <p className="text-xl font-bold text-gray-900 truncate">{formatCurrency(stats.avg)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre, NIF o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Client list */}
      <Card>
        <div className="divide-y divide-gray-100">
          <AnimatePresence>
            {filtered.map((client) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} layout
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`p-2.5 rounded-lg flex-shrink-0 ${client.type === 'company' ? 'bg-primary-100' : 'bg-gray-100'}`}>
                    {client.type === 'company'
                      ? <Building2 className="w-5 h-5 text-primary-600" />
                      : <User className="w-5 h-5 text-gray-600" />}
                  </div>

                  {/* Info — grows */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h3 className="font-semibold text-gray-900 truncate">{client.name}</h3>
                      <Badge variant="default" size="sm">{client.nif}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      {client.email && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 min-w-0 max-w-[180px]">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </span>
                      )}
                      {client.phone && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          {client.phone}
                        </span>
                      )}
                      {client.city && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          {client.city}
                        </span>
                      )}
                    </div>
                    {client.lastInvoiceDate && (
                      <p className="text-xs text-gray-400 mt-1">
                        Última factura: {formatDate(client.lastInvoiceDate)}
                      </p>
                    )}
                  </div>

                  {/* Right: stats + actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <div className="text-right hidden sm:block">
                      <p className="font-semibold text-gray-900 text-sm">{formatCurrency(client.totalInvoiced)}</p>
                      <p className="text-xs text-gray-500">{client.invoiceCount} facturas</p>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => openEdit(client)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => setDeletingClient(client)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile billing info */}
                <div className="sm:hidden mt-2 pl-12">
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(client.totalInvoiced)}</span>
                  <span className="text-xs text-gray-500 ml-2">· {client.invoiceCount} facturas</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="font-medium text-gray-900 mb-1">
              {searchQuery ? 'Sin resultados' : 'No hay clientes'}
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {searchQuery ? 'Prueba con otros términos' : 'Añade tu primer cliente para empezar'}
            </p>
            {!searchQuery && (
              <Button onClick={openNew}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Cliente
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Modals */}
      <ClientFormModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingClient(null) }}
        client={editingClient}
        onSave={handleSave}
      />
      <ConfirmModal
        isOpen={!!deletingClient}
        onClose={() => setDeletingClient(null)}
        onConfirm={handleDelete}
        title="Eliminar cliente"
        message={`¿Seguro que quieres eliminar a "${deletingClient?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  )
}
