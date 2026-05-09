'use client'

import { ReactNode, forwardRef, useState } from 'react'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/design-system'

interface PremiumInputProps {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'url'
  error?: string
  success?: boolean
  disabled?: boolean
  required?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  size?: 'sm' | 'md' | 'lg'
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
  helperText?: string
  autoComplete?: string
  maxLength?: number
  showPasswordToggle?: boolean
  loading?: boolean
}

const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  success,
  disabled = false,
  required = false,
  icon,
  iconPosition = 'left',
  size = 'md',
  rounded = 'lg',
  className,
  helperText,
  autoComplete,
  maxLength,
  showPasswordToggle = false,
  loading = false,
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const actualType = showPasswordToggle && type === 'password' ? (showPassword ? 'text' : 'password') : type

  const inputClasses = cn(
    // Base styles
    'w-full bg-white/90 backdrop-blur-sm border-2 transition-all duration-200 outline-none',
    
    // Focus states
    isFocused && !error && 'border-blue-500 ring-2 ring-blue-500/20 ring-offset-0',
    !isFocused && !error && 'border-slate-200/60 hover:border-slate-300/60',
    
    // Error states
    error && 'border-red-500 ring-2 ring-red-500/20 ring-offset-0',
    
    // Success states
    success && !error && 'border-green-500 ring-2 ring-green-500/20 ring-offset-0',
    
    // Disabled state
    disabled && 'opacity-50 cursor-not-allowed bg-slate-50',
    
    // Sizes
    size === 'sm' && 'px-3 py-2 text-sm',
    size === 'md' && 'px-4 py-3 text-base',
    size === 'lg' && 'px-5 py-4 text-lg',
    
    // Border radius
    rounded === 'md' && 'rounded-md',
    rounded === 'lg' && 'rounded-lg',
    rounded === 'xl' && 'rounded-xl',
    rounded === 'full' && 'rounded-full',
    
    // Icon padding
    icon && iconPosition === 'left' ? 'pl-12' : '',
    icon && iconPosition === 'right' ? 'pr-12' : '',
    
    // Custom className
    className
  )

  const containerClasses = cn(
    'relative',
    disabled && 'opacity-50'
  )

  const labelClasses = cn(
    'block text-sm font-medium mb-2 transition-colors duration-200',
    error ? 'text-red-600' : success ? 'text-green-600' : 'text-slate-700',
    required && 'after:content-[\"*\"] after:ml-1 after:text-red-500'
  )

  const helperClasses = cn(
    'text-xs mt-1 transition-colors duration-200',
    error ? 'text-red-600' : success ? 'text-green-600' : 'text-slate-500'
  )

  return (
    <div className="space-y-2">
      {label && (
        <label className={labelClasses}>
          {label}
        </label>
      )}
      
      <div className={containerClasses}>
        {/* Left icon */}
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        
        {/* Input */}
        <input
          ref={ref}
          type={actualType}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className={inputClasses}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-invalid={!!error}
          aria-describedby={error ? `${placeholder}-error` : helperText ? `${placeholder}-helper` : undefined}
        />
        
        {/* Right icon or password toggle */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
          
          {showPasswordToggle && type === 'password' && !loading && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 transition-colors duration-200 p-1 rounded hover:bg-slate-100"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
          
          {icon && iconPosition === 'right' && !loading && (
            <div className="text-slate-400 pointer-events-none">
              {icon}
            </div>
          )}
          
          {/* Status icons */}
          {!loading && error && (
            <AlertCircle size={16} className="text-red-500" />
          )}
          
          {!loading && success && !error && (
            <CheckCircle size={16} className="text-green-500" />
          )}
        </div>
      </div>
      
      {/* Helper text or error message */}
      {(helperText || error) && (
        <div className={helperClasses}>
          {error || helperText}
          {maxLength && value && (
            <span className="ml-2 text-slate-400">
              {value.length}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  )
})

PremiumInput.displayName = 'PremiumInput'

export default PremiumInput
