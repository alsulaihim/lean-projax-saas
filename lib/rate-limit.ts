import { RateLimiter } from 'limiter'

/**
 * Rate Limiting Utility
 * 
 * Purpose: Prevent brute force attacks and bot abuse
 * 
 * Implementation: Token bucket algorithm
 * - Each IP address gets a bucket of tokens
 * - Each request consumes one token
 * - Tokens refill over time
 * - When bucket is empty, requests are denied
 * 
 * Security Benefits:
 * - Prevents password brute force attacks
 * - Prevents bot account creation spam
 * - Protects against DoS attacks
 * - Reduces server load from malicious traffic
 */

// Store limiters per IP address with last access timestamp
const limiters = new Map<string, { limiter: RateLimiter; lastAccess: number }>()

/**
 * Get or create rate limiter for an IP address
 * 
 * @param ip - Client IP address
 * @param tokensPerInterval - Number of requests allowed
 * @param interval - Time window (e.g., 'hour', 'minute')
 * @returns RateLimiter instance
 */
function getLimiter(ip: string, tokensPerInterval: number, interval: 'hour' | 'minute'): RateLimiter {
  const key = `${ip}-${tokensPerInterval}-${interval}`

  if (!limiters.has(key)) {
    limiters.set(
      key,
      {
        limiter: new RateLimiter({ tokensPerInterval, interval, fireImmediately: true }),
        lastAccess: Date.now()
      }
    )
  }

  // Update last access timestamp
  const entry = limiters.get(key)!
  entry.lastAccess = Date.now()

  return entry.limiter
}

/**
 * Extract client IP address from request
 * 
 * Checks multiple headers to find real client IP:
 * - X-Forwarded-For: Set by proxies/load balancers
 * - X-Real-IP: Set by nginx
 * - Falls back to socket remote address
 * 
 * @param request - Next.js request object
 * @returns Client IP address or 'unknown'
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  
  if (forwarded) {
    // X-Forwarded-For can be a comma-separated list, take the first one
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  // Fallback - in development this might be ::1 or 127.0.0.1
  return 'unknown'
}

/**
 * Rate limit middleware for signup endpoint
 * 
 * Limits: 3 signup attempts per hour per IP
 * 
 * Why 3/hour:
 * - Allows legitimate retries for typos
 * - Blocks bot mass signup attempts
 * - Reasonable for legitimate use cases
 * 
 * @param request - Request object
 * @returns true if allowed, false if rate limited
 */
export async function rateLimitSignup(request: Request): Promise<boolean> {
  const ip = getClientIp(request)
  const limiter = getLimiter(ip, 3, 'hour') // 3 signups per hour
  
  const remainingRequests = await limiter.removeTokens(1)
  return remainingRequests >= 0
}

/**
 * Rate limit middleware for login endpoint
 * 
 * Limits: 10 login attempts per hour per IP
 * 
 * Why 10/hour:
 * - More lenient than signup (users forget passwords)
 * - Still blocks brute force attempts
 * - Typical user won't hit this limit
 * 
 * @param request - Request object
 * @returns true if allowed, false if rate limited
 */
export async function rateLimitLogin(request: Request): Promise<boolean> {
  const ip = getClientIp(request)
  const limiter = getLimiter(ip, 10, 'hour') // 10 logins per hour
  
  const remainingRequests = await limiter.removeTokens(1)
  return remainingRequests >= 0
}

/**
 * Rate limit middleware for general API endpoints
 * 
 * Limits: 100 requests per minute per IP
 * 
 * Why 100/minute:
 * - Generous for legitimate use
 * - Blocks DoS attempts
 * - Protects server resources
 * 
 * @param request - Request object
 * @returns true if allowed, false if rate limited
 */
export async function rateLimitAPI(request: Request): Promise<boolean> {
  const ip = getClientIp(request)
  const limiter = getLimiter(ip, 100, 'minute') // 100 requests per minute
  
  const remainingRequests = await limiter.removeTokens(1)
  return remainingRequests >= 0
}

/**
 * Cleanup old limiters periodically
 *
 * Runs every hour to prevent memory leaks
 * Only removes limiters that haven't been accessed in 24 hours
 * This preserves rate limiting for active users while freeing memory for inactive ones
 */
if (typeof window === 'undefined') {
  // Server-side only
  const CLEANUP_INTERVAL = 60 * 60 * 1000 // 1 hour
  const LIMITER_TTL = 24 * 60 * 60 * 1000 // 24 hours

  setInterval(() => {
    const now = Date.now()
    const keysToDelete: string[] = []

    // Find limiters that haven't been accessed in 24 hours
    for (const [key, entry] of limiters.entries()) {
      if (now - entry.lastAccess > LIMITER_TTL) {
        keysToDelete.push(key)
      }
    }

    // Remove stale limiters
    keysToDelete.forEach(key => limiters.delete(key))

    if (keysToDelete.length > 0) {
      console.log(`Rate limiter cleanup: removed ${keysToDelete.length} stale limiters`)
    }

    // In production, consider using Redis for distributed rate limiting
  }, CLEANUP_INTERVAL)
}

