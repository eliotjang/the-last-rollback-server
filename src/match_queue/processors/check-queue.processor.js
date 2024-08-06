import { enterDungeonSession } from '../../handlers/dungeon/enter-dungeon.js';
import { addDungeonSession } from '../../session/dungeon.session.js';
import { townRedis } from '../../utils/redis/town.redis.js';
import matchQueueRedis from '../match-queue.redis.js';

const checkQueueProcessor = async (job, done) => {
  const accountIds = matchQueueRedis.retrieveFromWaitingQueue(job.dungeonCode);
  if (accountIds) {
    const dungeonSession = addDungeonSession(dungeonCode);
    for (const accountId of accountIds) {
      const townSession = getTownSessionByUserId(accountId);
      townSession.removeUser(accountId);
      const user = getUserById(accountId);
      dungeonSession.addUser(user);
      await townRedis.removePlayer(accountId, false);
    }
    enterDungeonSession(dungeonSession, dungeonCode);
  }
  done();
};

export default checkQueueProcessor;
