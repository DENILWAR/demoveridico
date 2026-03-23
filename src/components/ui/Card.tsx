import { forwardRef, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'bordered' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { className, variant = 'default', padding = 'md', children, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-lg',
          // Variants
          variant === 'default' && 'border border-gray-200 shadow-sm',
          variant === 'interactive' &&
            'border border-gray-200 shadow-sm hover:shadow-card-hover hover:border-gray-300 cursor-pointer transition-all duration-150',
          variant === 'bordered' && 'border-2 border-gray-200',
          variant === 'elevated' && 'shadow-lg',
          // Padding
          padding === 'sm' && 'p-4',
          padding === 'md' && 'p-6',
          padding === 'lg' && 'p-8',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Card Header
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  action?: ReactNode
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start justify-between gap-4 mb-4',
          className
        )}
        {...props}
      >
        <div>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
          {children}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

// Card Content
const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('', className)} {...props} />
  }
)

CardContent.displayName = 'CardContent'

// Card Footer
const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100',
          className
        )}
        {...props}
      />
    )
  }
)

CardFooter.displayName = 'CardFooter'

// KPI Card especializado
export interface KpiCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  trend?: {
    value: number
    label: string
    direction: 'up' | 'down' | 'neutral'
  }
  icon?: ReactNode
}

const KpiCard = forwardRef<HTMLDivElement, KpiCardProps>(
  ({ className, label, value, trend, icon, ...props }, ref) => {
    return (
      <Card ref={ref} className={cn('', className)} {...props}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1 font-mono tabular-nums">
              {value}
            </p>
            {trend && (
              <p
                className={cn(
                  'text-sm font-medium mt-2 flex items-center gap-1',
                  trend.direction === 'up' && 'text-success-600',
                  trend.direction === 'down' && 'text-error-600',
                  trend.direction === 'neutral' && 'text-gray-500'
                )}
              >
                {trend.direction === 'up' && (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                )}
                {trend.direction === 'down' && (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                )}
                {trend.value > 0 && '+'}
                {trend.value}% {trend.label}
              </p>
            )}
          </div>
          {icon && (
            <div className="p-3 bg-primary-50 rounded-lg text-primary-600">
              {icon}
            </div>
          )}
        </div>
      </Card>
    )
  }
)

KpiCard.displayName = 'KpiCard'

export { Card, CardHeader, CardContent, CardFooter, KpiCard }
