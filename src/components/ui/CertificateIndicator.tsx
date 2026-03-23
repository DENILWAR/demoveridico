import { useCertificateStore, CertificateStatus } from '@/stores/certificateStore'
import { cn } from '@/utils/cn'
import { Shield, ShieldAlert, ShieldOff, ShieldQuestion } from 'lucide-react'
import { Link } from 'react-router-dom'

interface CertificateIndicatorProps {
  variant?: 'compact' | 'full'
  className?: string
}

const statusConfig: Record<
  CertificateStatus,
  {
    icon: typeof Shield
    label: string
    sublabel: string
    color: string
    bgColor: string
    borderColor: string
  }
> = {
  ACTIVE: {
    icon: Shield,
    label: 'Certificado activo',
    sublabel: 'Listo para firmar',
    color: 'text-success-600',
    bgColor: 'bg-success-50',
    borderColor: 'border-success-200',
  },
  EXPIRING_SOON: {
    icon: ShieldAlert,
    label: 'Certificado',
    sublabel: 'Caduca pronto',
    color: 'text-warning-600',
    bgColor: 'bg-warning-50',
    borderColor: 'border-warning-200',
  },
  EXPIRED: {
    icon: ShieldOff,
    label: 'Certificado caducado',
    sublabel: 'No puedes firmar',
    color: 'text-error-600',
    bgColor: 'bg-error-50',
    borderColor: 'border-error-200',
  },
  NOT_CONFIGURED: {
    icon: ShieldQuestion,
    label: 'Sin certificado',
    sublabel: 'Configurar ahora',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
}

export function CertificateIndicator({
  variant = 'compact',
  className,
}: CertificateIndicatorProps) {
  const { status, daysUntilExpiry, certificate } = useCertificateStore()
  const config = statusConfig[status]
  const Icon = config.icon

  if (variant === 'compact') {
    return (
      <Link
        to="/settings/certificate"
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:shadow-sm',
          config.bgColor,
          config.borderColor,
          className
        )}
      >
        <Icon className={cn('w-5 h-5', config.color)} />
        <div className="text-left">
          <p className={cn('text-xs font-medium', config.color)}>
            {status === 'EXPIRING_SOON' && daysUntilExpiry
              ? `Caduca en ${daysUntilExpiry} días`
              : config.label}
          </p>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to="/settings/certificate"
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border transition-all hover:shadow-md',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className={cn('p-2 rounded-lg', config.bgColor)}>
        <Icon className={cn('w-6 h-6', config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', config.color)}>
          {status === 'EXPIRING_SOON' && daysUntilExpiry
            ? `Caduca en ${daysUntilExpiry} días`
            : config.label}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {certificate?.subject || config.sublabel}
        </p>
      </div>
      {status !== 'ACTIVE' && (
        <span className="text-xs text-primary-600 font-medium">
          {status === 'NOT_CONFIGURED' ? 'Configurar' : 'Renovar'} →
        </span>
      )}
    </Link>
  )
}

// Alert Banner para certificados con problemas
export function CertificateAlertBanner() {
  const { status, daysUntilExpiry } = useCertificateStore()

  if (status === 'ACTIVE') return null

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 border-b',
        status === 'EXPIRED' && 'bg-error-50 border-error-200',
        status === 'EXPIRING_SOON' && 'bg-warning-50 border-warning-200',
        status === 'NOT_CONFIGURED' && 'bg-gray-50 border-gray-200'
      )}
    >
      <Icon className={cn('w-5 h-5', config.color)} />
      <p className="flex-1 text-sm">
        {status === 'EXPIRED' && (
          <>
            <span className="font-medium text-error-700">
              Tu certificado digital ha caducado.
            </span>{' '}
            <span className="text-error-600">
              No puedes firmar facturas hasta que lo renueves.
            </span>
          </>
        )}
        {status === 'EXPIRING_SOON' && (
          <>
            <span className="font-medium text-warning-700">
              Tu certificado caduca en {daysUntilExpiry} días.
            </span>{' '}
            <span className="text-warning-600">
              Renuévalo para evitar interrupciones.
            </span>
          </>
        )}
        {status === 'NOT_CONFIGURED' && (
          <>
            <span className="font-medium text-gray-700">
              No tienes certificado digital configurado.
            </span>{' '}
            <span className="text-gray-600">
              Lo necesitas para firmar facturas legalmente.
            </span>
          </>
        )}
      </p>
      <Link
        to="/settings/certificate"
        className={cn(
          'text-sm font-medium px-3 py-1.5 rounded-md transition-colors',
          status === 'EXPIRED' &&
            'bg-error-600 text-white hover:bg-error-700',
          status === 'EXPIRING_SOON' &&
            'bg-warning-600 text-white hover:bg-warning-700',
          status === 'NOT_CONFIGURED' &&
            'bg-primary-600 text-white hover:bg-primary-700'
        )}
      >
        {status === 'NOT_CONFIGURED' ? 'Configurar' : 'Renovar'}
      </Link>
    </div>
  )
}
