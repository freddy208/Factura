// Système de design premium Factura 2026
// Mobile-first, accessible, moderne

export const tokens = {
  // Couleurs premium avec support dark mode future
  colors: {
    // Primary brand
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE', 
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6', // Main blue
      600: '#2563EB', // Darker blue
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
      950: '#172554',
    },
    
    // Secondary (purple/indigo)
    secondary: {
      50: '#EEF2FF',
      100: '#E0E7FF',
      200: '#C7D2FE',
      300: '#A5B4FC',
      400: '#818CF8',
      500: '#6366F1',
      600: '#4F46E5',
      700: '#4338CA',
      800: '#3730A3',
      900: '#312E81',
      950: '#1E1B4B',
    },

    // Success (green)
    success: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
      800: '#166534',
      900: '#14532D',
      950: '#052E16',
    },

    // Warning (amber/yellow)
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
      950: '#451A03',
    },

    // Error (red)
    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D',
      950: '#450A0A',
    },

    // Gray scale
    gray: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
      950: '#020617',
    },

    // Brand colors for payment methods
    brand: {
      mtn: '#FFCC00', // MTN Yellow
      orange: '#FF6600', // Orange Orange
      whatsapp: '#25D366',
    },
  },

  // Typography premium
  typography: {
    fontFamily: {
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
    },
    
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
      sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
      base: ['1rem', { lineHeight: '1.5rem' }],      // 16px
      lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
      xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
      '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],  // 36px
      '5xl': ['3rem', { lineHeight: '1' }],          // 48px
      '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
      '7xl': ['4.5rem', { lineHeight: '1' }],        // 72px
    },

    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },

    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  // Espacements responsive
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
  },

  // Border radius premium
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    base: '0.375rem', // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem',   // 32px
    full: '9999px',
  },

  // Shadows premium
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    
    // Premium colored shadows
    primary: '0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -2px rgba(59, 130, 246, 0.05)',
    success: '0 10px 15px -3px rgba(34, 197, 94, 0.1), 0 4px 6px -2px rgba(34, 197, 94, 0.05)',
    error: '0 10px 15px -3px rgba(239, 68, 68, 0.1), 0 4px 6px -2px rgba(239, 68, 68, 0.05)',
  },

  // Animations premium
  animation: {
    // Durées
    duration: {
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms',
    },

    // Timing functions
    ease: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeBack: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      easeElastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
    },

    // Keyframes
    keyframes: {
      fadeIn: {
        from: { opacity: '0' },
        to: { opacity: '1' },
      },
      slideInUp: {
        from: { transform: 'translateY(20px)', opacity: '0' },
        to: { transform: 'translateY(0)', opacity: '1' },
      },
      slideInDown: {
        from: { transform: 'translateY(-20px)', opacity: '0' },
        to: { transform: 'translateY(0)', opacity: '1' },
      },
      scaleIn: {
        from: { transform: 'scale(0.9)', opacity: '0' },
        to: { transform: 'scale(1)', opacity: '1' },
      },
      pulse: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0.5' },
      },
      bounce: {
        '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
        '40%, 43%': { transform: 'translate3d(0, -30px, 0)' },
        '70%': { transform: 'translate3d(0, -15px, 0)' },
        '90%': { transform: 'translate3d(0, -4px, 0)' },
      },
    },
  },

  // Breakpoints mobile-first
  breakpoints: {
    sm: '640px',   // Small tablets
    md: '768px',   // Tablets
    lg: '1024px',  // Small desktops
    xl: '1280px',  // Desktops
    '2xl': '1536px', // Large desktops
  },

  // Z-index premium
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // Components spécifiques
  components: {
    // Cards premium
    card: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdrop: 'blur(16px)',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      borderRadius: '1rem',
      padding: '1.5rem',
    },

    // Buttons premium
    button: {
      primary: {
        background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
        hover: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
        shadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
        hoverShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -2px rgba(59, 130, 246, 0.05)',
        borderRadius: '0.75rem',
        padding: '0.75rem 1.5rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      },

      secondary: {
        background: 'rgba(255, 255, 255, 0.9)',
        border: '2px solid rgba(226, 232, 240, 0.8)',
        hover: 'rgba(59, 130, 246, 0.05)',
        borderRadius: '0.75rem',
        padding: '0.75rem 1.5rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      },

      ghost: {
        background: 'transparent',
        hover: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '0.75rem',
        padding: '0.75rem 1.5rem',
        fontSize: '0.875rem',
        fontWeight: '500',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },

    // Form premium
    input: {
      background: 'rgba(255, 255, 255, 0.9)',
      border: '2px solid rgba(226, 232, 240, 0.8)',
      focusBorder: 'rgba(59, 130, 246, 0.5)',
      focusShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
      errorBorder: 'rgba(239, 68, 68, 0.5)',
      errorShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
      borderRadius: '0.75rem',
      padding: '0.75rem 1rem',
      fontSize: '0.9375rem',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
} as const

// Helper functions pour utiliser le design system
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}

export const getBreakpointClass = (breakpoint: keyof typeof tokens.breakpoints) => {
  return tokens.breakpoints[breakpoint]
}

export const getColor = (path: string) => {
  const keys = path.split('.')
  let value: any = tokens.colors
  
  for (const key of keys) {
    value = value[key]
    if (!value) break
  }
  
  return value
}

export const getSpacing = (size: keyof typeof tokens.spacing) => {
  return tokens.spacing[size]
}

export const getBorderRadius = (size: keyof typeof tokens.borderRadius) => {
  return tokens.borderRadius[size]
}

export const getShadow = (type: keyof typeof tokens.shadows) => {
  return tokens.shadows[type]
}

export const getAnimation = (type: keyof typeof tokens.animation.duration) => {
  return tokens.animation.duration[type]
}
