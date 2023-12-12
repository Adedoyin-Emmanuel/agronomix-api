import redis, { RedisClientOptions, createClient } from "redis";

const redisPort = process.env.REDIS_PORT || 6379;
const redisHost = process.env.HOST || "127.0.0.1";

const redisClient = createClient({
  port: redisPort,
  host: redisHost,
} as RedisClientOptions);

export default redisClient;
