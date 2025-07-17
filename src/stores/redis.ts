import Redis from "ioredis";

export const redis = new Redis({
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT) ?? 6379,
  password: process.env.REDIS_PASSWORD ?? undefined,
});

export async function storeContext<T>(
  payload: T,
  ttlSeconds = 60,
  ctxKey: string
): Promise<void> {
  await redis.set(ctxKey, JSON.stringify(payload), "EX", ttlSeconds);
}

export async function fetchContext<T>(ctxKey: string): Promise<T | null> {
  const raw = await redis.get(ctxKey);
  return raw ? JSON.parse(raw) as T : null;
}

export async function updateContext<T>(
  ctxKey: string,
  payload: T,
  ttlSeconds = 60
): Promise<boolean> {
  const exists = await redis.exists(ctxKey);
  if (!exists) return false;

  await redis.set(ctxKey, JSON.stringify(payload), "EX", ttlSeconds);
  return true;
}
