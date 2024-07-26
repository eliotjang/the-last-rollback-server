import { v4 as uuidv4 } from 'uuid';
import { gameCharRedis } from './game.char.redis.js';

const testGameCharRedis = async () => {
  try {
    const accountId = uuidv4();
    const nickname = 'eliot';
    const charClass = 1001;
    const transform = { posX: 12, poxY: 23, posZ: 10, rot: 50 };
    const transform2 = { posX: 100, poxY: 100, posZ: 10, rot: 50 };
    await gameCharRedis.createGameChar(nickname, charClass, transform, accountId);
    await gameCharRedis.getGameChar(accountId);
    await gameCharRedis.updateTransform(transform2, accountId);
    await gameCharRedis.updateTransform(transform2, accountId, true);
    console.log(`Battle Redis 테스트 성공`);
  } catch (error) {
    console.error('Battle Redis 테스트 중 오류 발생 : ', error);
  }
};

export const testAllRedisConnections = async () => {
  await testGameCharRedis();
};
