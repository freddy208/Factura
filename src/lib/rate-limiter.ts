import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const rateLimitMemory = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

function memoryLimiter(config: RateLimitConfig, req: NextRequest): NextResponse | null {
  const ip = clientIp(req)
  const now = Date.now()
  const key = `${ip}:${req.method}:${req.nextUrl.pathname}`

  for (const [k, v] of rateLimitMemory.entries()) {
    if (now > v.resetTime) rateLimitMemory.delete(k)
  }

  const record = rateLimitMemory.get(key)

  if (!record || now > record.resetTime) {
    rateLimitMemory.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return null
  }

  if (record.count >= config.maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000)
    return NextResponse.json(
      {
        error: 'Trop de requêtes. Veuillez réessayer plus tard.',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
        },
      }
    )
  }

  record.count++
  return null
}

let redisEmail: Redis | null = null
let ratelimitEmail: Ratelimit | null = null
let ratelimitStrict: Ratelimit | null = null
let ratelimitPaymentNotify: Ratelimit | null = null
let ratelimitWelcomeUser: Ratelimit | null = null

function upstashEnabled(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

function getRedis(): Redis | null {
  if (!upstashEnabled()) return null
  if (!redisEmail) {
    redisEmail = Redis.fromEnv()
  }
  return redisEmail
}

/** Rate limit email-related routes (IP), préfère Upstash si configuré. */
export async function emailRateLimitAsync(req: NextRequest): Promise<NextResponse | null> {
  const redis = getRedis()
  if (redis) {
    if (!ratelimitEmail) {
      ratelimitEmail = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '60 s'),
        prefix: 'factura:rl:email',
      })
    }
    const ip = clientIp(req)
    const { success, limit, remaining, reset } = await ratelimitEmail.limit(ip)
    if (!success) {
      const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez réessayer plus tard.', retryAfter },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
          },
        }
      )
    }
    return null
  }
  return memoryLimiter({ windowMs: 60_000, maxRequests: 5 }, req)
}

/** Routes sensibles (admin, etc.) — IP, fenêtre 1 min / 10 req. */
export async function strictRateLimitAsync(req: NextRequest): Promise<NextResponse | null> {
  const redis = getRedis()
  if (redis) {
    if (!ratelimitStrict) {
      ratelimitStrict = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '60 s'),
        prefix: 'factura:rl:strict',
      })
    }
    const ip = clientIp(req)
    const { success, limit, remaining, reset } = await ratelimitStrict.limit(ip)
    if (!success) {
      const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez réessayer plus tard.', retryAfter },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
          },
        }
      )
    }
    return null
  }
  return memoryLimiter({ windowMs: 60_000, maxRequests: 10 }, req)
}

/** Limite les notifications « demande Pro » par utilisateur (Upstash ou pas de limite). */
export async function paymentNotifyUserRateLimit(userId: string): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return true
  if (!ratelimitPaymentNotify) {
    ratelimitPaymentNotify = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '24 h'),
      prefix: 'factura:rl:paynotify',
    })
  }
  try {
    const { success } = await ratelimitPaymentNotify.limit(userId)
    return success
  } catch (error) {
    // Fallback vers rate limiting en mémoire si Upstash a des permissions insuffisantes
    console.warn('Upstash rate limit failed, using memory fallback:', error)
    const now = Date.now()
    const key = `paynotify:${userId}`
    const windowMs = 24 * 60 * 60 * 1000 // 24h
    const maxRequests = 5
    
    const record = rateLimitMemory.get(key)
    
    if (!record || now > record.resetTime) {
      rateLimitMemory.set(key, {
        count: 1,
        resetTime: now + windowMs,
      })
      return true
    }
    
    if (record.count >= maxRequests) {
      return false
    }
    
    record.count++
    return true
  }
}

/** Limite les envois d'email de bienvenue par compte (Upstash avec fallback mémoire). */
export async function welcomeEmailUserRateLimit(userId: string): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return true
  
  try {
    if (!ratelimitWelcomeUser) {
      ratelimitWelcomeUser = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '24 h'),
        prefix: 'factura:rl:welcome',
      })
    }
    const { success } = await ratelimitWelcomeUser.limit(userId)
    return success
  } catch (error) {
    // Fallback vers rate limiting en mémoire si Upstash a des permissions insuffisantes
    console.warn('Upstash rate limit failed, using memory fallback:', error)
    const now = Date.now()
    const key = `welcome:${userId}`
    const windowMs = 24 * 60 * 60 * 1000 // 24h
    const maxRequests = 5
    
    const record = rateLimitMemory.get(key)
    
    if (!record || now > record.resetTime) {
      rateLimitMemory.set(key, {
        count: 1,
        resetTime: now + windowMs,
      })
      return true
    }
    
    if (record.count >= maxRequests) {
      return false
    }
    
    record.count++
    return true
  }
}
