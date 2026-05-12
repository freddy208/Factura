import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ 
  src, 
  alt = 'Avatar utilisateur', 
  fallback = 'U', 
  size = 'md',
  className 
}: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl'
  }

  if (src) {
    return (
      <div className={cn(
        'relative rounded-full overflow-hidden bg-slate-200',
        sizeClasses[size],
        className
      )}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 32px, 48px"
          priority={size === 'lg' || size === 'xl'}
        />
      </div>
    )
  }

  // Fallback avatar avec gradient
  return (
    <div className={cn(
      'bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg text-white font-bold',
      sizeClasses[size],
      className
    )}>
      {fallback.charAt(0).toUpperCase()}
    </div>
  )
}
