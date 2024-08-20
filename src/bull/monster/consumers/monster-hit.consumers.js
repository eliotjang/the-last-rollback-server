import Bull from 'bull';
import { MONSTER_HIT_JOB_NAME, MONSTER_HIT_QUEUE_NAME } from '../../../constants/constants.js';
import MonsterHitProcessor from '../processors/monster-hit.processor.js';
import { config } from '../../../config/config.js';

const monsterHitQueue = new Bull('MONSTER_HIT_QUEUE_NAME', {
  redis: {
    host: config.redis.redisHost,
    port: config.redis.redisPort,
  },
});

export const setMonsterHitQueue = () => {
  monsterHitQueue.process(MONSTER_HIT_JOB_NAME, MonsterHitProcessor);
};
