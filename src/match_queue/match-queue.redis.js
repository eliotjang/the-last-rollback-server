import dc from '../constants/game.constants.js';
import redisClient from '../init/redis.js';

const PREFIX = 'match-queue:';

const matchQueueRedis = {
  addToWaitingQueue: async (data, priority) => {
    try {
      const { dungeonCode, user } = data;
      const key = PREFIX + dungeonCode + ':' + user.accountId;
      await redisClient.zAdd(key, priority, user.accountId);
    } catch (err) {
      console.error('addToWaitingQueue Error:', err);
    }
  },
  retrieveFromWaitingQueue: async (dungeonCode) => {
    try {
      const key = PREFIX + dungeonCode + ':';
      const accountIds = await redisClient.zRange(key, 0, dc.general.MAX_USERS);
      console.log('accountIds:', accountIds);
      if (accountIds.length == dc.general.MAX_USERS) {
        await redisClient.zRemRangeByScore(key, 0, dc.general.MAX_USERS);
        return accountIds;
      }
      return null;
    } catch (err) {
      console.error('getFromWaitingQueue Error:', err);
    }
  },
  removeFromWaitingQueue: async (dungeonCode, accountId) => {
    try {
      const key = PREFIX + dungeonCode + ':' + accountId;
      await redisClient.zRem(key);
    } catch (err) {
      console.error('removeFromWaitingQueue Error:', err);
    }
  },
};

export default matchQueueRedis;
