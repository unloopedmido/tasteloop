import Redis from "ioredis";
import { log } from "./logger";

export const redis = new Redis(Bun.env.REDIS_URL ?? "redis://localhost:6379");

redis.on("connect", () => log.success("Connected to Redis server"));
redis.on("error", (err) => log.error("Error with redis", err));
