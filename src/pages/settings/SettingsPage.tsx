import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  Shield,
  Bell,
  Palette,
  Database,
  FileText,
  ChevronRight,
  Save,
  Mail,
  Phone,
  Globe,
  CreditCard,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { toast } from '@/components/ui/Toast'
import { useCertificateStore } from '@/stores/certificateStore'
import { useTheme } from '@/hooks/useTheme'

interface CompanyData {
  name: string
  nif: string
  address: string
  city: string
  postalCode: string
  country: string
  email: string
  phone: string
  website?: string
  bankAccount?: string
}

const initialCompanyData: CompanyData = {
  name: 'Mi Empresa S.L.',
  nif: 'B12345678',
  address: 'Calle Principal, 1',
  city: 'Madrid',
  postalCode: '28001',
  country: 'España',
  email: 'contacto@miempresa.es',
  phone: '+34 912 345 678',
  website: 'www.miempresa.es',
  bankAccount: 'ES12 1234 5678 9012 3456 7890',
}

const settingsSections = [
  {
    id: 'company',
    title: 'Datos de empresa',
    description: 'Información fiscal y de contacto',
    icon: Building2,
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-600',
  },
  {
    id: 'certificate',
    title: 'Certificado digital',
    description: 'Firma electrónica cualificada',
    icon: Shield,
    iconBg: 'bg-success-100',
    iconColor: 'text-success-600',
    link: '/settings/certificate',
  },
  {
    id: 'invoicing',
    title: 'Facturación',
    description: 'Series, numeración y plantillas',
    icon: FileText,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    id: 'notifications',
    title: 'Notificaciones',
    description: 'Alertas y recordatorios',
    icon: Bell,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    id: 'appearance',
    title: 'Apariencia',
    description: 'Tema y personalización',
    icon: Palette,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    id: 'backup',
    title: 'Copias de seguridad',
    description: 'Exportar y restaurar datos',
    icon: Database,
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
  },
]

export default function SettingsPage() {
  const { status: certStatus, daysUntilExpiry } = useCertificateStore()
  const { theme, setTheme } = useTheme()
  const [activeSection, setActiveSection] = useState('company')
  const [companyData, setCompanyData] = useState<CompanyData>(initialCompanyData)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSaveCompany = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    toast.success('Cambios guardados', 'Los datos de tu empresa han sido actualizados.')
  }

  const handleDownloadBackup = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      companyData,
      version: '1.0',
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `veridico-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Backup descargado', 'El archivo se ha guardado en tu carpeta de descargas.')
  }

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (parsed.companyData) setCompanyData(parsed.companyData)
        toast.success('Backup restaurado', 'Los datos han sido restaurados correctamente.')
      } catch {
        toast.error('Error al restaurar', 'El archivo no es un backup válido.')
      }
    }
    reader.readAsText(file)
    // reset input so the same file can be re-selected
    e.target.value = ''
  }

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'company':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Datos de empresa
              </h2>
              <p className="text-sm text-gray-500">
                Esta información aparecerá en tus facturas y documentos legales.
              </p>
            </div>

            <Card className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Razón social *
                    </label>
                    <Input
                      value={companyData.name}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, name: e.target.value })
                      }
                      placeholder="Mi Empresa S.L."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NIF / CIF *
                    </label>
                    <Input
                      value={companyData.nif}
                      onChange={(e) =>
                        setCompanyData({
                          ...companyData,
                          nif: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="B12345678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección fiscal
                  </label>
                  <Input
                    value={companyData.address}
                    onChange={(e) =>
                      setCompanyData({ ...companyData, address: e.target.value })
                    }
                    placeholder="Calle Principal, 1"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código Postal
                    </label>
                    <Input
                      value={companyData.postalCode}
                      onChange={(e) =>
                        setCompanyData({
                          ...companyData,
                          postalCode: e.target.value,
                        })
                      }
                      placeholder="28001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad
                    </label>
                    <Input
                      value={companyData.city}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, city: e.target.value })
                      }
                      placeholder="Madrid"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      País
                    </label>
                    <Input
                      value={companyData.country}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, country: e.target.value })
                      }
                      placeholder="España"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium text-gray-900 mb-4">
                    Datos de contacto
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="email"
                          value={companyData.email}
                          onChange={(e) =>
                            setCompanyData({
                              ...companyData,
                              email: e.target.value,
                            })
                          }
                          className="pl-10"
                          placeholder="contacto@empresa.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="tel"
                          value={companyData.phone}
                          onChange={(e) =>
                            setCompanyData({
                              ...companyData,
                              phone: e.target.value,
                            })
                          }
                          className="pl-10"
                          placeholder="+34 912 345 678"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sitio web
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="url"
                          value={companyData.website}
                          onChange={(e) =>
                            setCompanyData({
                              ...companyData,
                              website: e.target.value,
                            })
                          }
                          className="pl-10"
                          placeholder="www.empresa.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cuenta bancaria
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          value={companyData.bankAccount}
                          onChange={(e) =>
                            setCompanyData({
                              ...companyData,
                              bankAccount: e.target.value,
                            })
                          }
                          className="pl-10"
                          placeholder="ES12 1234 5678 9012 3456 7890"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <Button
                    onClick={handleSaveCompany}
                    isLoading={isSaving}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Guardar cambios
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )

      case 'invoicing':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Configuración de facturación
              </h2>
              <p className="text-sm text-gray-500">
                Personaliza cómo se generan y numeran tus facturas.
              </p>
            </div>

            <Card className="p-6">
              <h3 className="font-medium text-gray-900 mb-4">Series de facturación</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Serie A - General</p>
                    <p className="text-sm text-gray-500">
                      Última: A-2024-0023
                    </p>
                  </div>
                  <Badge variant="success">Activa</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      Serie B - Rectificativas
                    </p>
                    <p className="text-sm text-gray-500">Última: B-2024-0002</p>
                  </div>
                  <Badge variant="success">Activa</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      Serie R - Intracomunitarias
                    </p>
                    <p className="text-sm text-gray-500">Sin usar</p>
                  </div>
                  <Badge variant="default">Inactiva</Badge>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="mt-4">
                Gestionar series
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="font-medium text-gray-900 mb-4">
                Configuración por defecto
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vencimiento por defecto
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="0">Al contado</option>
                    <option value="15">15 días</option>
                    <option value="30" selected>
                      30 días
                    </option>
                    <option value="60">60 días</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IVA por defecto
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="21" selected>
                      21% (General)
                    </option>
                    <option value="10">10% (Reducido)</option>
                    <option value="4">4% (Superreducido)</option>
                    <option value="0">Exento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas por defecto en facturas
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    rows={3}
                    placeholder="Texto que aparecerá al final de cada factura..."
                  />
                </div>
              </div>
            </Card>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Notificaciones
              </h2>
              <p className="text-sm text-gray-500">
                Configura las alertas y recordatorios que deseas recibir.
              </p>
            </div>

            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Facturas pendientes de cobro
                    </p>
                    <p className="text-sm text-gray-500">
                      Notificar cuando una factura esté próxima a vencer
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Certificado por vencer
                    </p>
                    <p className="text-sm text-gray-500">
                      Avisar 30 días antes del vencimiento
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Resumen semanal
                    </p>
                    <p className="text-sm text-gray-500">
                      Recibir un email con el resumen de la semana
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Errores de envío AEAT
                    </p>
                    <p className="text-sm text-gray-500">
                      Notificar inmediatamente si hay errores
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </Card>
          </div>
        )

      case 'appearance': {
        const themeOptions: { value: 'light' | 'dark' | 'system'; label: string; preview: string }[] = [
          { value: 'light',  label: 'Claro',   preview: 'bg-white border border-gray-200' },
          { value: 'dark',   label: 'Oscuro',  preview: 'bg-gray-900' },
          { value: 'system', label: 'Sistema', preview: 'bg-gradient-to-b from-white to-gray-900' },
        ]
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Apariencia</h2>
              <p className="text-sm text-gray-500">Personaliza la interfaz de la aplicación.</p>
            </div>

            <Card className="p-6">
              <h3 className="font-medium text-gray-900 mb-4">Tema</h3>
              <div className="grid grid-cols-3 gap-4">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={`p-4 rounded-lg text-center transition-all ${
                      theme === opt.value
                        ? 'border-2 border-primary-500 bg-primary-50'
                        : 'border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-full h-12 ${opt.preview} rounded mb-2`} />
                    <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                    {theme === opt.value && (
                      <span className="block text-xs text-primary-600 mt-1">Activo</span>
                    )}
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-medium text-gray-900 mb-4">Idioma</h3>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="ca">Català</option>
                <option value="eu">Euskara</option>
                <option value="gl">Galego</option>
              </select>
            </Card>
          </div>
        )
      }

      case 'backup':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Copias de seguridad</h2>
              <p className="text-sm text-gray-500">Exporta tus datos o restaura desde una copia anterior.</p>
            </div>

            <Card className="p-6">
              <h3 className="font-medium text-gray-900 mb-2">Exportar datos</h3>
              <p className="text-sm text-gray-500 mb-4">
                Descarga todos tus datos en formato JSON. Incluye facturas, clientes y configuración.
              </p>
              <Button variant="secondary" onClick={handleDownloadBackup}>
                Descargar backup
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="font-medium text-gray-900 mb-2">Restaurar datos</h3>
              <p className="text-sm text-gray-500 mb-4">
                Restaura tus datos desde un archivo de backup anterior.
              </p>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleRestoreBackup}
              />
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Database className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Arrastra un archivo .json o haz clic para seleccionar</p>
                <Button variant="secondary" size="sm" className="mt-4" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}>
                  Seleccionar archivo
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-amber-50 border-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-900">Copia de seguridad automática</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Tus datos se guardan automáticamente de forma local. Para mayor seguridad,
                    te recomendamos realizar copias manuales periódicamente.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 mt-1">
          Gestiona los ajustes de tu cuenta y aplicación
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {settingsSections.map((section) => {
            const Icon = section.icon
            const isActive = activeSection === section.id

            if (section.link) {
              return (
                <Link
                  key={section.id}
                  to={section.link}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${section.iconBg}`}>
                    <Icon className={`w-5 h-5 ${section.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{section.title}</p>
                    <p className="text-xs text-gray-500">{section.description}</p>
                  </div>
                  {section.id === 'certificate' && certStatus === 'EXPIRING_SOON' && (
                    <Badge variant="warning" size="sm">
                      {daysUntilExpiry}d
                    </Badge>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              )
            }

            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 border border-primary-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded-lg ${section.iconBg}`}>
                  <Icon className={`w-5 h-5 ${section.iconColor}`} />
                </div>
                <div className="flex-1 text-left">
                  <p
                    className={`font-medium ${
                      isActive ? 'text-primary-900' : 'text-gray-900'
                    }`}
                  >
                    {section.title}
                  </p>
                  <p className="text-xs text-gray-500">{section.description}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">{renderSectionContent()}</div>
      </div>
    </div>
  )
}
