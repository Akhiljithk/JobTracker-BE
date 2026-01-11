// test-redis.js
import Redis from 'ioredis';

// Replace with YOUR EC2 Public IP and the password you set in redis.conf
const REDIS_URL = "redis://:wimjrp@54.196.148.252:6379";

const redis = new Redis(REDIS_URL);

async function test() {
  try {
    console.log("Connecting to EC2 Redis...");
    await redis.set("test_key", "Connection Successful!");
    const val = await redis.get("test_key");
    console.log("✅ Server says:", val);
    process.exit(0);
  } catch (err) {
    console.error("❌ Connection Failed:", err.message);
    process.exit(1);
  }
}

test();