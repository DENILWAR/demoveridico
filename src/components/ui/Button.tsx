import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

const buttonVariants = cva(
  // Base styles
  `inline-flex items-center justify-center gap-2 font-semibold rounded-md
   transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2
   disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]`,
  {
    variants: {
      variant: {
        primary: `bg-primary-600 text-white hover:bg-primary-700
                  active:bg-primary-800 focus:ring-primary-500`,
        secondary: `bg-white text-gray-700 border border-gray-300
                    hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-500`,
        danger: `bg-error-600 text-white hover:bg-error-700
                 active:bg-error-800 focus:ring-error-500`,
        success: `bg-success-600 text-white hover:bg-success-700
                  active:bg-success-800 focus:ring-success-500`,
        ghost: `bg-transparent text-gray-600 hover:bg-gray-100
                active:bg-gray-200 focus:ring-gray-500`,
        link: `bg-transparent text-primary-600 hover:text-primary-700
               hover:underline focus:ring-primary-500 p-0`,
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-base',
        lg: 'px-6 py-3 text-lg',
        xl: 'px-8 py-4 text-xl',
        icon: 'p-2',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : leftIcon ? (
          <span className="flex-shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !isLoading && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
