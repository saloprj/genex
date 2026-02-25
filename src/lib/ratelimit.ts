import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

function createRatelimit() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '60 s'),
    analytics: true,
    prefix: 'genex:ratelimit',
  })
}

let ratelimitInstance: Ratelimit | null | undefined

export function getRatelimit() {
  if (ratelimitInstance === undefined) {
    ratelimitInstance = createRatelimit()
  }
  return ratelimitInstance
}
