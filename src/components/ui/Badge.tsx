import { forwardRef, HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-700 border-gray-200',
        success: 'bg-success-50 text-success-700 border-success-200',
        warning: 'bg-warning-50 text-warning-700 border-warning-200',
        error: 'bg-error-50 text-error-700 border-error-200',
        info: 'bg-primary-50 text-primary-700 border-primary-200',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              variant === 'success' && 'bg-success-500',
              variant === 'warning' && 'bg-warning-500',
              variant === 'error' && 'bg-error-500',
              variant === 'info' && 'bg-primary-500',
              variant === 'default' && 'bg-gray-500'
            )}
          />
        )}
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

// Status Badge para facturas — debe incluir todos los estados del backend (InvoiceStatus.java)
export type InvoiceStatusType =
  | 'BORRADOR'
  | 'FIRMADA'
  | 'ENVIADA'
  | 'RECTIFICADA'
  | 'ANULADA'
  | 'BLOQUEADA'

const statusConfig: Record<
  InvoiceStatusType,
  { variant: 'success' | 'warning' | 'error' | 'default' | 'info'; label: string }
> = {
  BORRADOR:    { variant: 'default', label: 'Borrador' },
  FIRMADA:     { variant: 'info',    label: 'Firmada' },
  ENVIADA:     { variant: 'success', label: 'Enviada' },
  RECTIFICADA: { variant: 'warning', label: 'Rectificada' },
  ANULADA:     { variant: 'error',   label: 'Anulada' },
  BLOQUEADA:   { variant: 'default', label: 'Bloqueada' },
}

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: InvoiceStatusType
}

const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, className, ...props }, ref) => {
    const config = statusConfig[status]
    return (
      <Badge
        ref={ref}
        variant={config.variant}
        dot
        className={className}
        {...props}
      >
        {config.label}
      </Badge>
    )
  }
)

StatusBadge.displayName = 'StatusBadge'

export { Badge, badgeVariants, StatusBadge }
