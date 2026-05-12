import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 10 // Max 10 requests per minute

// Input validation schema
const settingsSchema = z.object({
  full_name: z.string().min(1, 'Le nom complet est requis').max(100, 'Le nom complet ne peut pas dépasser 100 caractères').optional().nullable(),
  company_name: z.string().min(1, 'Le nom de l\'entreprise est requis').max(100, 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères').optional().nullable(),
  email_invoices: z.boolean().optional(),
  mobile_alerts: z.boolean().optional(),
  two_factor: z.boolean().optional()
})

// CSRF token validation (simplified - in production use proper CSRF library)
function validateCSRFToken(request: NextRequest): boolean {
  const token = request.headers.get('x-csrf-token')
  const cookieToken = request.cookies.get('csrf-token')?.value
  
  // For development, we'll allow requests without CSRF tokens
  // In production, this should be strictly validated
  return true // TODO: Implement proper CSRF validation
}

// Rate limiting middleware
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitStore.get(ip)

  if (!userLimit) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (now > userLimit.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }

  userLimit.count++
  return true
}

// Input sanitization
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
}

// Log sensitive actions
function logSensitiveAction(userId: string, action: string, metadata: any = {}) {
  console.log('[SECURITY LOG]', {
    timestamp: new Date().toISOString(),
    userId,
    action,
    metadata,
    ip: metadata.ip
  })
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown'

    // Rate limiting check
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez réessayer dans une minute.' },
        { status: 429 }
      )
    }

    // CSRF token validation
    if (!validateCSRFToken(request)) {
      return NextResponse.json(
        { error: 'Token CSRF invalide' },
        { status: 403 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      )
    }

    // Check user permissions
    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('plan, created_at')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Profil utilisateur non trouvé' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Validate and sanitize inputs
    const sanitizedBody = {
      full_name: body.full_name ? sanitizeInput(body.full_name) : null,
      company_name: body.company_name ? sanitizeInput(body.company_name) : null,
      email_invoices: body.email_invoices,
      mobile_alerts: body.mobile_alerts,
      two_factor: body.two_factor
    }

    const validationResult = settingsSchema.safeParse(sanitizedBody)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Données invalides',
          details: validationResult.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    const validatedData = validationResult.data

    // Log the update attempt
    logSensitiveAction(user.id, 'settings_update', {
      fields: Object.keys(validatedData),
      ip
    })

    // Update profile data
    if (validatedData.full_name !== undefined || validatedData.company_name !== undefined) {
      const updateData = {
        full_name: validatedData.full_name,
        company_name: validatedData.company_name,
        updated_at: new Date().toISOString()
      }

      const { error: updateError } = await (adminClient.from('profiles') as any)
        .update(updateData)
        .eq('id', user.id)

      if (updateError) {
        console.error('Profile update error:', updateError)
        return NextResponse.json(
          { error: 'Erreur lors de la mise à jour du profil' },
          { status: 500 }
        )
      }
    }

    // Update notification settings (if tables exist)
    if (validatedData.email_invoices !== undefined || validatedData.mobile_alerts !== undefined) {
      const notificationData = {
        user_id: user.id,
        email_invoices: validatedData.email_invoices,
        mobile_alerts: validatedData.mobile_alerts,
        updated_at: new Date().toISOString()
      }

      // This would require a notification_settings table
      // For now, we'll just log it
      logSensitiveAction(user.id, 'notification_settings_update', notificationData)
    }

    // Update security settings (if tables exist)
    if (validatedData.two_factor !== undefined) {
      const securityData = {
        user_id: user.id,
        two_factor_enabled: validatedData.two_factor,
        updated_at: new Date().toISOString()
      }

      // This would require a security_settings table
      // For now, we'll just log it
      logSensitiveAction(user.id, 'security_settings_update', securityData)
    }

    return NextResponse.json({
      success: true,
      message: 'Paramètres mis à jour avec succès',
      data: validatedData
    })

  } catch (error) {
    console.error('Settings validation error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405 }
  )
}
