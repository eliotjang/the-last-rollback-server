import { v4 as uuidv4 } from 'uuid';
import { townRedis } from './town.redis.js';
import { socketRedis } from './socket.redis.js';

const townRedisConnection = async () => {
  try {
    const accountId = uuidv4();
    const nickname = 'eliot';
    const charClass = 1001;
    const transform = { posX: 12, poxY: 23, posZ: 10, rot: 50 };
    const transform2 = { posX: 100, poxY: 100, posZ: 10, rot: 50 };

    await townRedis.addPlayer(accountId, nickname, charClass, transform, true);
    await townRedis.getPlayerInfo(accountId);
    await townRedis.updatePlayerTransform(transform2, accountId);
    await townRedis.getAllPlayerTransform();
    await townRedis.getAllPlayerInfo();
    await townRedis.getOthersPlayerInfo(accountId);
    await townRedis.removePlayer(accountId, true);

    console.log(`Town Redis 테스트 성공`);
  } catch (error) {
    console.error('Town Redis 테스트 중 오류 발생 : ', error);
  }
};

const dungeonRedisConnection = async () => {
  try {
    //
    console.log(`Dungeon Redis 테스트 성공`);
  } catch (error) {
    console.error('Dungeon Redis 테스트 중 오류 발생 : ', error);
  }
};

const socketRedisConnection = async () => {
  try {
    const accountId = uuidv4();
    const socket = uuidv4();
    await socketRedis.addTownSocket(accountId, socket);
    await socketRedis.getTownSocket(accountId);
    await socketRedis.getAllTownSocket();
    await socketRedis.removeTownSocket(accountId);
    console.log(`Socket Redis 테스트 성공`);
  } catch (error) {
    console.error('Socket Redis 테스트 중 오류 발생 : ', error);
  }
};

export const testAllRedisConnections = async () => {
  await townRedisConnection();
  // await dungeonRedisConnection();
  await socketRedisConnection();
};
