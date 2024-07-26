import redisClient from '../../init/redis.js';

// Redis key naming convention : "object-type:id:field"

const PREFIX = 'dungeon';

const GUEST_FIELD = {
  CHAR_STAT: 'charStat',
};

// 몬스터 관련 데이터를 호스트만 저장할 것인지 논의 필요
const HOST_FIELD = {
  CHAR_STAT: 'charStat',
  MONSTER_STAT: 'monsterStat',
};

const COMMON_FIELD = {
  CHAR_GOLD: 'charGold',
  CHAR_EXP: 'charExp',
};

export const dungeonRedis = {
  /**
   *
   * @param {object} monsterStat 몬스터 스탯
   * @param {string} hostId 호스트 계정 아이디
   * @param {boolean} wantResult true 시 몬스터 스탯 반환
   * @returns 몬스터 스탯 반환
   */
  createMonster: async (monsterStat, hostId, wantResult) => {
    try {
      const key = PREFIX + ':' + hostId + ':';
      await redisClient.hSet(key, HOST_FIELD.MONSTER_STAT, JSON.stringify(monsterStat));

      if (wantResult) {
        return JSON.parse(await redisClient.hGet(key));
      }
    } catch (error) {
      console.error('Error in createMonster : ', error);
    }
  },

  createDungeon: async (charStat, hostId, wantResult) => {
    try {
      const key = PREFIX + ':' + hostId + ':';
      await redisClient.hSet(key, HOST_FIELD.CHAR_STAT, JSON.stringify(charStat));
      await redisClient.hSet(key, COMMON_FIELD.CHAR_GOLD, 0);
      await redisClient.hSet(key, COMMON_FIELD.CHAR_EXP, 0);
    } catch (error) {
      console.error('Error in createDungeon : ', error);
    }
  },

  createGuest: async (charStat, hostId, guestId, wantResult) => {
    try {
      const key = PREFIX + ':' + hostId + ':' + guestId + ':';
      await redisClient.hSet(key, COMMON_FIELD.CHAR_GOLD, 0);
      await redisClient.hSet(key, COMMON_FIELD.CHAR_GOLD, 0);
      await redisClient.hSet(key, GUEST_FIELD.CHAR_STAT, JSON.stringify(charStat));
    } catch (error) {
      console.error('Error in createGuest : ', error);
    }
  },
};
