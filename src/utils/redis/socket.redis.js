import redisClient from '../../init/redis.js';

const PREFIX = 'socket';

const FIELD = {
  TOWN: 'town',
  DUNGEON: 'dungeon',
};

export const socketRedis = {
  /**
   *
   * @param {string} accountId 계정 아이디
   * @param {object} socket 소켓 객체
   * @param {boolean} wantResult true 시, 소켓 객체 반환
   * @returns 소켓 객체 반환
   */
  addTownSocket: async function (accountId, socket, wantResult) {
    try {
      const key = PREFIX + ':' + accountId + ':';
      await redisClient.hSet(key, FIELD.TOWN, JSON.stringify(socket));

      if (wantResult) {
        return await this.getTownSocket(accountId);
      }
    } catch (error) {
      console.error(error);
    }
  },

  /**
   *
   * @param {string} accountId 계정 아이디
   * @returns 소켓 객체 반환
   */
  getTownSocket: async function (accountId) {
    try {
      const key = PREFIX + ':' + accountId + ':';
      const data = await redisClient.hGet(key, FIELD.TOWN);
      return JSON.parse(data);
    } catch (error) {
      console.error(error);
    }
  },

  /**
   *
   * @returns 타운에 위치한 모든 플레이어의 소켓 객체 배열 반환
   */
  getAllTownSocket: async function () {
    try {
      const pattern = PREFIX + ':*';
      const keys = await redisClient.keys(pattern);
      const result = [];
      for (let i = 0; i < keys.length; i++) {
        const data = JSON.parse(await redisClient.hGet(keys[i], FIELD.TOWN));
        result.push(data);
      }

      return result;
    } catch (error) {
      console.error(error);
    }
  },

  /**
   *
   * @param {string} accountId 계정 아이디
   * @returns 타운에 위치한 나를 제외한 모든 플레이어의 소켓 객체 배열 반환
   */
  getOthersTownSocket: async function (accountId) {
    try {
      const pattern = PREFIX + ':*';
      const keys = await redisClient.keys(pattern);
      const result = [];
      for (let i = 0; i < keys.length; i++) {
        if (!keys[i].includes(accountId)) {
          const data = JSON.parse(await redisClient.hGet(keys[i], FIELD.TOWN));
          result.push(data);
        }
      }

      return result;
    } catch (error) {
      console.error(error);
    }
  },

  /**
   *
   * @param {string} accountId 계정 아이디
   * @param {boolean} wantResult true 시, 소켓 객체 반환
   * @returns 소켓 객체 반환
   */
  removeTownSocket: async function (accountId, wantResult) {
    try {
      const key = PREFIX + ':' + accountId + ':';
      const result = await this.getTownSocket(accountId);
      await redisClient.del(key);

      if (wantResult) {
        return result;
      }
    } catch (error) {
      console.error(error);
    }
  },
};
