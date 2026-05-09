'use client'

import { ReactNode, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/design-system'

interface PremiumButtonProps {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  disabled?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  href?: string
  target?: string
  rel?: string
}

const PremiumButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, PremiumButtonProps>(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  rounded = 'lg',
  onClick,
  type = 'button',
  href,
  target,
  rel,
}, ref) => {
  const baseClasses = cn(
    // Base styles
    'relative inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    
    // Disabled state
    (disabled || loading) && 'opacity-60 cursor-not-allowed',
    
    // Full width
    fullWidth && 'w-full',
    
    // Sizes
    size === 'sm' && 'px-3 py-1.5 text-sm',
    size === 'md' && 'px-4 py-2.5 text-sm',
    size === 'lg' && 'px-6 py-3 text-base',
    size === 'xl' && 'px-8 py-4 text-lg',
    
    // Border radius
    rounded === 'md' && 'rounded-md',
    rounded === 'lg' && 'rounded-lg',
    rounded === 'xl' && 'rounded-xl',
    rounded === 'full' && 'rounded-full',
    
    // Variants
    variant === 'primary' && 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500 shadow-lg hover:shadow-xl hover:-translate-y-0.5',
    variant === 'secondary' && 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-500 shadow-sm hover:shadow-md',
    variant === 'ghost' && 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500',
    variant === 'danger' && 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 focus:ring-red-500 shadow-lg hover:shadow-xl hover:-translate-y-0.5',
    variant === 'success' && 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 focus:ring-green-500 shadow-lg hover:shadow-xl hover:-translate-y-0.5',
    
    // Custom className
    className
  )

  const content = (
    <>
      {/* Loading spinner */}
      {loading && (
        <Loader2 className="absolute animate-spin" size={size === 'sm' ? 16 : size === 'md' ? 18 : 20} />
      )}
      
      {/* Icon */}
      {icon && !loading && (
        <span className={cn(
          'flex-shrink-0',
          iconPosition === 'left' ? 'mr-2' : 'ml-2'
        )}>
          {icon}
        </span>
      )}
      
      {/* Text with loading state */}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </>
  )

  if (href) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel}
        className={baseClasses}
        onClick={disabled || loading ? undefined : onClick}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      disabled={disabled || loading}
      className={baseClasses}
      onClick={onClick}
    >
      {content}
    </button>
  )
})

PremiumButton.displayName = 'PremiumButton'

export default PremiumButton
