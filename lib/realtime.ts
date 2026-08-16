import Redis from 'ioredis';

function redisUrl(): string {
  const url = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL || process.env.KV_URL;
  if (!url) throw new Error('No Redis connection string configured (REDIS_URL / UPSTASH_REDIS_URL / KV_URL)');
  return url;
}

let _pub: Redis | null = null;
function getPublisher(): Redis {
  if (!_pub) _pub = new Redis(redisUrl());
  return _pub;
}

let _sub: Redis | null = null;
/** Dedicated subscriber connection — ioredis puts a client in subscribe-only mode once
 * SUBSCRIBE is called, so this must be a separate connection from the publisher. */
export function getSubscriber(): Redis {
  if (!_sub) _sub = new Redis(redisUrl());
  return _sub;
}

/** Fire-and-forget: never throws, so a Redis outage never breaks the caller's primary write. */
export async function publish(channel: string, payload: unknown): Promise<void> {
  try {
    const receivers = await getPublisher().publish(channel, JSON.stringify(payload));
    console.log(`[realtime] published to ${channel}, ${receivers} subscriber instance(s) got it`);
  } catch (err) {
    console.error(`Redis publish failed (channel=${channel}):`, err);
  }
}
