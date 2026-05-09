'use client'

import { ReactNode, forwardRef } from 'react'
import { cn, getColor, getShadow, getBorderRadius } from '@/lib/design-system'

interface PremiumCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'elevated' | 'bordered'
  padding?: 'sm' | 'md' | 'lg' | 'xl'
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  hover?: boolean
  interactive?: boolean
  gradient?: string
}

const PremiumCard = forwardRef<HTMLDivElement, PremiumCardProps>(({
  children,
  className,
  variant = 'default',
  padding = 'lg',
  rounded = 'xl',
  shadow = 'lg',
  hover = false,
  interactive = false,
  gradient,
}, ref) => {
  const baseClasses = cn(
    // Base styles
    'relative transition-all duration-300',
    
    // Background variants
    variant === 'default' && 'bg-white border border-slate-200/60',
    variant === 'glass' && 'bg-white/90 backdrop-blur-xl border border-white/20',
    variant === 'elevated' && 'bg-white border-0',
    variant === 'bordered' && 'bg-transparent border-2 border-slate-200',
    
    // Gradient overlay
    gradient && `bg-gradient-to-br ${gradient}`,
    
    // Padding
    padding === 'sm' && 'p-3',
    padding === 'md' && 'p-4',
    padding === 'lg' && 'p-6',
    padding === 'xl' && 'p-8',
    
    // Border radius
    rounded === 'lg' && 'rounded-lg',
    rounded === 'xl' && 'rounded-xl',
    rounded === '2xl' && 'rounded-2xl',
    
    // Shadows
    shadow === 'sm' && 'shadow-sm',
    shadow === 'md' && 'shadow-md',
    shadow === 'lg' && 'shadow-lg',
    shadow === 'xl' && 'shadow-xl',
    shadow === '2xl' && 'shadow-2xl',
    
    // Hover effects
    hover && !interactive && 'hover:shadow-xl hover:-translate-y-1 hover:border-blue-200/60',
    hover && interactive && 'hover:shadow-2xl hover:-translate-y-2 hover:border-blue-300 hover:scale-[1.02]',
    interactive && 'cursor-pointer',
    
    // Custom className
    className
  )

  return (
    <div ref={ref} className={baseClasses}>
      {children}
    </div>
  )
})

PremiumCard.displayName = 'PremiumCard'

export default PremiumCard
