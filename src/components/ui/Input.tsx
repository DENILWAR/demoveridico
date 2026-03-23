import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { AlertCircle } from 'lucide-react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  leftAddon?: ReactNode
  rightAddon?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      leftAddon,
      rightAddon,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}

        <div className="relative flex">
          {leftAddon && (
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              {leftAddon}
            </span>
          )}

          <div className="relative flex-1">
            {leftIcon && (
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                {leftIcon}
              </div>
            )}

            <input
              type={type}
              id={inputId}
              ref={ref}
              disabled={disabled}
              className={cn(
                `w-full px-3 py-2.5 bg-white border text-gray-900
                 placeholder:text-gray-400
                 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
                 transition-colors duration-150`,
                // Border radius based on addons
                leftAddon ? 'rounded-l-none' : 'rounded-l-md',
                rightAddon ? 'rounded-r-none' : 'rounded-r-md',
                // Padding based on icons
                leftIcon && 'pl-10',
                rightIcon && 'pr-10',
                // Error state
                error
                  ? 'border-error-500 focus:ring-error-500'
                  : 'border-gray-300',
                className
              )}
              {...props}
            />

            {rightIcon && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                {rightIcon}
              </div>
            )}
          </div>

          {rightAddon && (
            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              {rightAddon}
            </span>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-sm text-error-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}

        {hint && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// Input especializado para moneda
export const CurrencyInput = forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    return (
      <Input
        {...props}
        ref={ref}
        type="number"
        step="0.01"
        min="0"
        leftAddon="€"
        className={cn('text-right font-mono', props.className)}
      />
    )
  }
)

CurrencyInput.displayName = 'CurrencyInput'

// Input especializado para búsqueda
export const SearchInput = forwardRef<HTMLInputElement, InputProps>(
  ({ placeholder = 'Buscar...', ...props }, ref) => {
    return (
      <Input
        {...props}
        ref={ref}
        type="search"
        placeholder={placeholder}
        leftIcon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        }
        className={cn('bg-gray-50', props.className)}
      />
    )
  }
)

SearchInput.displayName = 'SearchInput'

export { Input }
