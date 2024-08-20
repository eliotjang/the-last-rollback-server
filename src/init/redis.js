import { config } from '../config/config.js';
import Redis from 'ioredis';

// connect Redis
// const redisClient = redis.createClient({
//   // 레디스 클러스터 구성
//   // rootNodes: [
//   //   {
//   //     url: 'redis://127.0.0.1:16379',
//   //   },
//   //   {
//   //     url: 'redis://127.0.0.1:16380',
//   //   },
//   //   {
//   //     url: 'redis://127.0.0.1:16381',
//   //   },
//   // ],
//   url: `redis://${config.redis.redisUsername}:${config.redis.redisPassword}@${config.redis.redisHost}:${config.redis.redisPort}/0`,
// });

const redisClient = new Redis({
  port: config.redis.redisPort,
  host: config.redis.redisHost,
  username: config.redis.redisUsername,
  password: config.redis.redisPassword,
  db: 0,
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});
redisClient.on('connect', () => {
  console.info('Redis connected!');
});
redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});
// redisClient.connect().then();

export default redisClient;
