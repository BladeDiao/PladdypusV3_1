import { Redis } from 'ioredis';

export async function cacheWrapper<T>(
  redisClient: Redis, // 指定要使用的 Redis 客户端
  key: string,
  expiration: number, // 单位：秒
  fetchFn: () => Promise<T>
): Promise<T> {
  try {
    const cached = await redisClient.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    console.error(`Error fetching from cache for key ${key}:`, err);
  }
  
  const data = await fetchFn();
  
  try {
    await redisClient.setex(key, expiration, JSON.stringify(data));
  } catch (err) {
    console.error(`Error setting cache for key ${key}:`, err);
  }
  
  return data;
}
