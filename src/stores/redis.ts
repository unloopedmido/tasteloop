import Redis from "ioredis";
import { randomUUID } from "crypto";

export const redis = new Redis({
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT) ?? 6379,
  password: process.env.REDIS_PASSWORD ?? undefined,
});

process.on("SIGINT", async () => {
  await redis.quit();
});

process.on("SIGTERM", async () => {
  await redis.quit();
});

export async function storeContext<T>(
  payload: T,
  ttlSeconds = 60
): Promise<string> {
  const uuid = randomUUID();
  await redis.set(`ctx:${uuid}`, JSON.stringify(payload), "EX", ttlSeconds);
  return uuid;
}

export async function fetchContext<T>(uuid: string): Promise<T | null> {
  const raw = await redis.get(`ctx:${uuid}`);
  if (!raw) return null;
  return JSON.parse(raw) as T;
}
