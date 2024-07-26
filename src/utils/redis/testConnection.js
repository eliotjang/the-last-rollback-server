import { v4 as uuidv4 } from 'uuid';
import { gameRedis, userRedis } from './redis.js';

const testUserRedisConnection = async () => {
  try {
    const accountId = uuidv4();
    const nickname = 'eliot';
    const accountClass = 1001;
    const transform = { x: 12, y: 23 };

    userRedis.createUserData(accountId, nickname, accountClass, transform);
    const userRD = await userRedis.getUserData(accountId);
    console.log('유저 레디스 테스트 결과:', userRD);
  } catch (error) {
    console.error('유저 레디스 실행 중 오류 발생: ', error);
  }
};

const testGameRedisConnection = async () => {
  try {
    const uuid = uuidv4();
    const gold = 3000;

    await gameRedis.createGameData(uuid, gold);
    const gameRD = await gameRedis.getGameData(uuid);
    console.log('게임 레디스 테스트 결과:', gameRD);
  } catch (error) {
    console.error('게임 레디스 실행 중 오류 발생: ', error);
  }
};

export const testAllRedisConnections = async () => {
  await testUserRedisConnection();
  await testGameRedisConnection();
};
