import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Shield,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  User,
  Building2,
  Key,
  FileKey,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  HelpCircle,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { useCertificateStore, type CertificateStatus } from '@/stores/certificateStore'
import { useContactModal } from '@/stores/contactModalStore'

function getStatusConfig(status: CertificateStatus) {
  switch (status) {
    case 'ACTIVE':
      return {
        icon: CheckCircle2,
        color: 'text-success-600',
        bg: 'bg-success-100',
        badge: 'success' as const,
        label: 'Válido',
      }
    case 'EXPIRING_SOON':
      return {
        icon: AlertTriangle,
        color: 'text-warning-600',
        bg: 'bg-warning-100',
        badge: 'warning' as const,
        label: 'Por vencer',
      }
    case 'EXPIRED':
      return {
        icon: XCircle,
        color: 'text-error-600',
        bg: 'bg-error-100',
        badge: 'error' as const,
        label: 'Expirado',
      }
    case 'NOT_CONFIGURED':
    default:
      return {
        icon: Shield,
        color: 'text-gray-400',
        bg: 'bg-gray-100',
        badge: 'default' as const,
        label: 'No configurado',
      }
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default function CertificateSettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { certificate, status, daysUntilExpiry, clearCertificate } = useCertificateStore()
  const { openContactModal } = useContactModal()

  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const statusConfig = getStatusConfig(status)
  const StatusIcon = statusConfig.icon

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.p12') && !file.name.endsWith('.pfx')) {
        setUploadError('El archivo debe ser un certificado .p12 o .pfx')
        return
      }
      setSelectedFile(file)
      setUploadError(null)
    }
  }

  const handleUpload = () => {
    if (!selectedFile || !password) {
      setUploadError('Selecciona un archivo e introduce la contraseña')
      return
    }
    // Show that file was accepted, then gate with contact modal
    toast.success('Certificado seleccionado correctamente', `${selectedFile.name} listo para instalar.`)
    setShowUploadModal(false)
    setSelectedFile(null)
    setPassword('')
    setTimeout(() => openContactModal(), 400)
  }

  const handleDelete = () => {
    clearCertificate()
    setShowDeleteModal(false)
    toast.success('Certificado eliminado', 'El certificado ha sido eliminado de la aplicación.')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/settings"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Certificado Digital
          </h1>
          <p className="text-gray-500 mt-1">
            Gestiona tu firma electrónica cualificada
          </p>
        </div>
      </div>

      {/* Status Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`p-4 rounded-xl ${statusConfig.bg}`}>
              <StatusIcon className={`w-8 h-8 ${statusConfig.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  {certificate ? 'Certificado configurado' : 'Sin certificado'}
                </h2>
                <Badge variant={statusConfig.badge}>{statusConfig.label}</Badge>
              </div>
              {certificate ? (
                <p className="text-gray-500 mt-1">
                  {daysUntilExpiry !== null && daysUntilExpiry > 0 ? (
                    <>Válido por {daysUntilExpiry} días más</>
                  ) : (
                    <>Certificado expirado</>
                  )}
                </p>
              ) : (
                <p className="text-gray-500 mt-1">
                  Necesitas un certificado para firmar facturas
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {certificate && (
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={() => setShowDeleteModal(true)}
              >
                Eliminar
              </Button>
            )}
            <Button
              leftIcon={certificate ? <RefreshCw className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
              onClick={() => setShowUploadModal(true)}
            >
              {certificate ? 'Renovar' : 'Instalar certificado'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Certificate Details */}
      {certificate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">
                Detalles del certificado
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Titular</p>
                    <p className="font-medium text-gray-900">
                      {certificate.subject}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Building2 className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Emisor</p>
                    <p className="font-medium text-gray-900">
                      {certificate.issuer}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Válido desde</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(certificate.validFrom)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
                    <Calendar className={`w-4 h-4 ${statusConfig.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Válido hasta</p>
                    <p className={`font-medium ${
                      status === 'EXPIRED' ? 'text-danger-600' :
                      status === 'EXPIRING_SOON' ? 'text-warning-600' :
                      'text-gray-900'
                    }`}>
                      {formatDate(certificate.validTo)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Key className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">NIF asociado</p>
                    <p className="font-medium text-gray-900">
                      {certificate.nif || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FileKey className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Número de serie</p>
                    <p className="font-mono text-sm text-gray-900">
                      {certificate.serialNumber}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Lock className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Huella digital (SHA-1)</p>
                    <p className="font-mono text-xs text-gray-700 bg-gray-100 p-2 rounded mt-1 break-all">
                      {certificate.fingerprint}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Warning for expiring */}
      {status === 'EXPIRING_SOON' && (
        <Card className="p-4 bg-warning-50 border-warning-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-warning-900">
                Tu certificado caduca pronto
              </h3>
              <p className="text-sm text-warning-700 mt-1">
                Quedan {daysUntilExpiry} días para que expire tu certificado.
                Renuévalo antes para evitar interrupciones en la firma de facturas.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => setShowUploadModal(true)}
              >
                Renovar ahora
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Help Section */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <HelpCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              ¿Cómo obtener un certificado digital?
            </h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              Para firmar facturas necesitas un certificado digital cualificado.
              Puedes obtenerlo de las siguientes entidades:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="https://www.fnmt.es/ceres"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-900">FNMT</span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
              <a
                href="https://www.camerfirma.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-900">Camerfirma</span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
              <a
                href="https://www.anf.es"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-900">ANF AC</span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </div>
        </div>
      </Card>

      {/* Legal Info */}
      <Card className="p-6 bg-gray-50">
        <h3 className="font-medium text-gray-900 mb-2">
          Información legal
        </h3>
        <p className="text-sm text-gray-600">
          Según el <strong>Real Decreto 1007/2023</strong> y la{' '}
          <strong>Orden HAC/1177/2024</strong>, los sistemas de facturación
          deben utilizar firma electrónica cualificada para garantizar la
          integridad y autenticidad de los registros de facturación.
          El certificado digital se almacena de forma segura en tu dispositivo
          y nunca se transmite a servidores externos.
        </p>
      </Card>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false)
          setSelectedFile(null)
          setPassword('')
          setUploadError(null)
        }}
        title="Instalar certificado digital"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Selecciona tu archivo de certificado (.p12 o .pfx) e introduce
            la contraseña para instalarlo.
          </p>

          {/* File Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              selectedFile
                ? 'border-success-300 bg-success-50'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".p12,.pfx"
              onChange={handleFileSelect}
              className="hidden"
            />
            {selectedFile ? (
              <>
                <FileKey className="w-10 h-10 mx-auto text-success-500 mb-2" />
                <p className="font-medium text-success-700">{selectedFile.name}</p>
                <p className="text-sm text-success-600">
                  Archivo seleccionado
                </p>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                <p className="font-medium text-gray-700">
                  Haz clic para seleccionar
                </p>
                <p className="text-sm text-gray-500">
                  o arrastra tu archivo aquí
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Formatos aceptados: .p12, .pfx
                </p>
              </>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña del certificado
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introduce la contraseña"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {uploadError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-danger-600 text-sm bg-danger-50 p-3 rounded-lg"
              >
                <XCircle className="w-4 h-4" />
                {uploadError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setShowUploadModal(false)
                setSelectedFile(null)
                setPassword('')
                setUploadError(null)
              }}
            >
              Cancelar
            </Button>
            <Button
              fullWidth
              onClick={handleUpload}
              disabled={!selectedFile || !password}
            >
              Instalar certificado
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar certificado"
        message="¿Estás seguro de que quieres eliminar este certificado? No podrás firmar facturas hasta que instales uno nuevo."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  )
}
