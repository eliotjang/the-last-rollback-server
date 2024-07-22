import { config } from '../config/config.js';
import redis from 'redis';

// connect Redis
const redisClient = redis.createClient({
  url: `redis://${config.redis.redisUsername}:${config.redis.redisPassword}@${config.redis.redisHost}:${config.redis.redisPort}/0`,
});
redisClient.on('connect', () => {
  console.info('Redis connected!');
});
redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});
redisClient.connect().then(); // redis v4 연결 (비동기)

export default redisClient;
