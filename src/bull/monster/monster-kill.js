import Bull from 'bull';
import { MONSTER_HIT_JOB_NAME, MONSTER_HIT_QUEUE_NAME } from '../../constants/constants.js';
import { setMonsterHitQueue } from './consumers/monster-hit.consumers.js';
import { config } from '../../config/config.js';

const monsterHitQueue = new Bull('MONSTER_HIT_QUEUE_NAME', {
  redis: {
    host: config.redis.redisHost,
    port: config.redis.redisPort,
  },
});
setMonsterHitQueue();

export const enqueueMonsterHitJob = (payloadData) => {
  monsterHitQueue.add(MONSTER_HIT_JOB_NAME, payloadData);
};
