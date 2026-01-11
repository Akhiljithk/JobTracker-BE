import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL; 

export const redisConnection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null, // Required by BullMQ
  connectTimeout: 10000,      // 10 seconds to find the EC2
  keepAlive: 10000,           // Keep the pipe open
});

redisConnection.on('error', (err) => console.error('Redis Connection Error:', err));
redisConnection.on('connect', () => console.log('Successfully connected to EC2 Redis'));