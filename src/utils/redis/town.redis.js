import redisClient from '../../init/redis.js';
import { changeProperType } from './redis.utils.js';

// Redis key naming convention : "object-type:id:field"

const PREFIX = 'town';

export const FIELD = {
  PLAYER_ID: 'playerId',
  NICKNAME: 'nickname',
  CHAR_CLASS: 'charClass',
  TRANSFORM: 'transform',
  ACCOUNT_LEVEL: 'accountLevel',
};

export const townRedis = {
  /**
   *
   * @param {string} accountId 계정 아이디
   * @param {string} nickname 캐릭터 닉네임
   * @param {string} charClass 캐릭터 클래스
   * @param {object} transform 캐릭터 좌표
   * @param {number} accountLevel 계정 레벨
   * @param {boolean} wantResult true 시, playerInfo 객체 반환
   * @returns playerInfo 객체 반환
   */
  addPlayer: async function (player) {
    try {
      const { playerId: accountId, nickname, charClass, transform, accountLevel } = player;
      const key = PREFIX + ':' + accountId + ':';
      await redisClient.hset(key, FIELD.PLAYER_ID, accountId);
      await redisClient.hset(key, FIELD.NICKNAME, nickname);
      await redisClient.hset(key, FIELD.CHAR_CLASS, JSON.stringify(charClass));
      await redisClient.hset(key, FIELD.TRANSFORM, JSON.stringify(transform));
      await redisClient.hset(key, FIELD.ACCOUNT_LEVEL, JSON.stringify(accountLevel));

      return await this.getPlayerInfo(accountId);
    } catch (error) {
      console.error('Error in addPlayer : ', error);
    }
  },

  /**
   *
   * @param {string} accountId 계정 아이디
   * @param {boolean} wantResult true 시, 제거한 플레이어 정보 객체 반환
   * @returns playerInfo 객체 반환
   */
  removePlayer: async function (accountId, wantResult) {
    try {
      const key = PREFIX + ':' + accountId + ':';
      const result = await this.getPlayerInfo(accountId);
      await redisClient.del(key);

      if (wantResult) {
        return result;
      }
    } catch (error) {
      console.error('Error in removePlayer : ', error);
    }
  },

  /**
   *
   * @param {string} accountId 계정 아이디
   * @returns playerInfo 객체 반환
   */
  getPlayerInfo: async function (accountId) {
    try {
      const key = PREFIX + ':' + accountId + ':';
      const data = {};
      for (const info in FIELD) {
        data[FIELD[info]] = await redisClient.hget(key, FIELD[info]);
      }
      if (data) {
        const result = changeProperType(data);
        return result;
      }
    } catch (error) {
      console.error('Error in getPlayerInfo : ', error);
    }
  },

  /**
   *
   * @param {object} transform 패킷 구조에 정의된 객체 형식
   * @param {string} accountId 계정 아이디
   * @param {boolean} wantResult true 시 transform 객체 반환
   * @returns transform 객체 반환
   */
  updatePlayerTransform: async function (transform, accountId, wantResult) {
    try {
      const key = PREFIX + ':' + accountId + ':';
      await redisClient.hset(key, FIELD.TRANSFORM, JSON.stringify(transform));

      if (wantResult) {
        const result = await redisClient.hget(key, FIELD.TRANSFORM);
        return JSON.parse(result);
      }
    } catch (error) {
      console.error('Error in updatePlayerTransform : ', error);
    }
  },

  /**
   *
   * @returns 모든 플레이어의 playerInfo 객체 배열 반환
   */
  getAllPlayerInfo: async function () {
    try {
      const pattern = PREFIX + ':*';
      const keys = await redisClient.keys(pattern);
      const result = [];
      for (let i = 0; i < keys.length; i++) {
        const data = changeProperType(await redisClient.hgetall(keys[i]));
        result.push(data);
      }
      return result;
    } catch (error) {
      console.error('Error in getAllPlayerInfo');
    }
  },

  /**
   *
   * @param {string} accountId 계정 아이디
   * @returns 나를 제외한 모든 플레이어의 playerInfo 객체 배열 반환
   */
  getOthersPlayerInfo: async function (accountId) {
    try {
      const pattern = PREFIX + `:*`;
      const keys = await redisClient.keys(pattern);
      const result = [];
      for (let i = 0; i < keys.length; i++) {
        if (!keys[i].includes(accountId)) {
          const data = changeProperType(await redisClient.hgetall(keys[i]));
          result.push(data);
        }
      }
      return result;
    } catch (error) {
      console.error('Error in getOthersPlayerInfo');
    }
  },

  /**
   *
   * @returns 모든 플레이어의 transform 객체 배열 반환
   */
  getAllPlayerTransform: async function () {
    try {
      const pattern = PREFIX + ':*';
      const keys = await redisClient.keys(pattern);

      const result = [];
      for (let i = 0; i < keys.length; i++) {
        result.push(JSON.parse(await redisClient.hget(keys[i], FIELD.TRANSFORM)));
      }
      return result;
    } catch (error) {
      console.error('Error in getAllPlayerTransform : ', error);
    }
  },
};
