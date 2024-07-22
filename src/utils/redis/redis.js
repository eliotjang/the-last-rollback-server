import redisClient from '../../init/redis.js';
import {
  userRedisFields as urf,
  gameRedisFields as grf,
  isUserRedisField,
  isGameRedisField,
} from '../../constants/redis.js';

const USER_PREFIX = 'user:';
const GAME_DATA_PREFIX = 'game:';

export const userRedis = {
  createUserData: async function (uuid, token) {
    try {
      const keyUUID = `${USER_PREFIX}${uuid}:${urf.UUID}`;
      const keyToken = `${USER_PREFIX}${uuid}:${urf.TOKEN}`;

      await redisClient.set(keyUUID, JSON.stringify(uuid));
      await redisClient.set(keyToken, JSON.stringify(token));
    } catch (error) {
      console.error('createUserData Error Message : ', error);
    }
  },

  setUserData: async function (uuid, obj) {
    try {
      for (const [key, value] of Object.entries(obj)) {
        if (isUserRedisField(key)) {
          const redisKey = `${USER_PREFIX}${uuid}:${key}`;
          await redisClient.set(redisKey, JSON.stringify(value));
        }
      }
    } catch (err) {
      console.error('setUserData failed:', err);
    }
  },

  getUserData: async function (uuid) {
    try {
      const pattern = `${USER_PREFIX}${uuid}*`;
      const keys = await redisClient.keys(pattern);

      const values = {};
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i].replace(`${USER_PREFIX}${uuid}:`, '');
        values[key] = JSON.parse(await redisClient.get(keys[i]));
      }
      if (Object.keys(values).length === 0) {
        return null;
      }
      return values;
    } catch (error) {
      console.error('getUserData Error Message : ', error);
    }
  },

  getUserDataEx: async function (uuid, arr) {
    try {
      const userData = {};
      for (const keyName of arr) {
        if (isUserRedisField(keyName)) {
          const redisKey = `${USER_PREFIX}${uuid}:${keyName}`;
          const result = JSON.parse(await redisClient.get(redisKey));
          userData[keyName] = result;
        }
      }
      return userData;
    } catch (err) {
      console.error('getUserDataEx failed:', err);
    }
  },

  removeUserData: async function (uuid) {
    try {
      // TODO: 유저 정보 제거 작업
      const keys = await redisClient.keys(`${USER_PREFIX}${uuid}:*`);
      for (const key of keys) {
        await redisClient.del(key);
      }
    } catch (err) {
      console.error('removeUserData failed:', err);
    }
  },
};

export const gameRedis = {
  createGameData: async function (uuid, gold) {
    try {
      const keyGold = `${GAME_DATA_PREFIX}${uuid}:${grf.GOLD}`;
      await redisClient.set(keyGold, `${gold}`);
    } catch (error) {
      console.error('createGameData Error Message : ', error);
    }
  },

  setGameData: async function (uuid, obj) {
    try {
      for (const [key, value] of Object.entries(obj)) {
        if (isGameRedisField(key)) {
          const redisKey = `${GAME_DATA_PREFIX}${uuid}:${key}`;
          await redisClient.set(redisKey, JSON.stringify(value));
        }
      }
    } catch (err) {
      console.error('setUserData failed:', err);
    }
  },

  getGameData: async function (uuid) {
    try {
      const pattern = `${GAME_DATA_PREFIX}${uuid}:*`;
      const keys = await redisClient.keys(pattern);

      const values = {};
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i].replace(`${GAME_DATA_PREFIX}${uuid}:`, '');
        values[key] = JSON.parse(await redisClient.get(keys[i]));
      }
      if (Object.keys(values).length === 0) {
        return null;
      }
      return values;
    } catch (error) {
      console.error('getGameData Error Message : ', error);
      return null;
    }
  },

  getUserDataEx: async function (uuid, arr) {
    try {
      const gameData = {};
      for (const keyName of arr) {
        if (isUserRedisField(keyName)) {
          const redisKey = `${GAME_DATA_PREFIX}${uuid}:${keyName}`;
          const result = JSON.parse(await redisClient.get(redisKey));
          gameData[transformCase(keyName, caseTypes.CAMEL_CASE)] = result;
        }
      }
      return gameData;
    } catch (err) {
      console.error('getUserDataEx failed:', err);
    }
  },

  patchGameDataGold: async function (uuid, byAmount) {
    try {
      if (typeof byAmount !== 'number') {
        throw new CustomError(ErrorCodes.GAME_REDIS_DATA_ERROR, 'byAmount 값 에러');
      }
      const key = `${GAME_DATA_PREFIX}${uuid}:${grf.GOLD}`;
      await redisClient.incrBy(key, byAmount);
    } catch (err) {
      console.error('patchGameDataGold failed:', err);
    }
  },

  removeGameData: async function (uuid) {
    try {
      const keys = await redisClient.keys(`${GAME_DATA_PREFIX}${uuid}:*`);
      for (const key of keys) {
        await redisClient.del(key);
      }
    } catch (error) {
      console.error('removeGameData Error Message : ', error);
    }
  },
};
