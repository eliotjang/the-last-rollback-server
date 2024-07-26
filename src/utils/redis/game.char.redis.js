import redisClient from '../../init/redis.js';

// Redis key naming convention : "object-type:id:field"

const PREFIX = 'gameChar';

const FIELD = {
  NICKNAME: 'nickname',
  CHAR_CLASS: 'charClass',
  TRANSFORM: 'transform',
};

export const gameCharRedis = {
  createGameChar: async (nickname, charClass, transform, accountId) => {
    try {
      const key = PREFIX + ':' + accountId + ':';
      await redisClient.hSet(key, FIELD.NICKNAME, nickname);
      await redisClient.hSet(key, FIELD.CHAR_CLASS, charClass);
      await redisClient.hSet(key, FIELD.TRANSFORM, JSON.stringify(transform));
      // console.log(await redisClient.hGet(key, field.NICKNAME));
      // console.log(await redisClient.hGet(key, field.CHAR_CLASS));
      // console.log(await redisClient.hGet(key, field.TRANSFORM));
      // const test = await redisClient.hGetAll(key);
      // console.log(test);
      // console.log(test[field.NICKNAME]);
    } catch (error) {
      console.error('Error in createGameChar : ', error);
    }
  },

  getGameChar: async (accountId) => {
    try {
      const key = PREFIX + ':' + accountId + ':';
      const data = await redisClient.hGetAll(key);
      const result = changeNullProtoToObj(data);
      return result;
    } catch (error) {
      console.error('Error in getGameChar : ', error);
    }
  },

  /**
   *
   * @param {object} transform 패킷 구조에 정의된 객체 형식
   * @param {string} accountId 계정 아이디
   * @param {boolean} wantResult true 시 업데이트한 결과 반환
   * @returns transform 객체 반환
   */
  updateTransform: async (transform, accountId, wantResult) => {
    try {
      const key = PREFIX + ':' + accountId + ':';
      await redisClient.hSet(key, FIELD.TRANSFORM, JSON.stringify(transform));

      if (wantResult) {
        const result = await redisClient.hGet(key, FIELD.TRANSFORM);
        return JSON.parse(result);
      }
    } catch (error) {
      console.error('Error in updateTransform : ', error);
    }
  },
};

// only one dept of object
function changeNullProtoToObj(data) {
  try {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      if (isJsonString(value)) {
        result[key] = JSON.parse(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  } catch (error) {
    console.error(error);
  }
}

function isJsonString(str) {
  try {
    const json = JSON.parse(str);
    return typeof json === 'object';
  } catch (error) {
    return false;
  }
}
