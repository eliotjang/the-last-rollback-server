import Bull from 'bull';
import { MONSTER_HIT_JOB_NAME, MONSTER_HIT_QUEUE_NAME } from '../../constants/constants.js';
import { setMonsterHitQueue } from './consumers/monster-hit.consumers.js';

const monsterHitQueue = new Bull(MONSTER_HIT_QUEUE_NAME);
setMonsterHitQueue();

export const enqueueMonsterHitJob = (payloadData) => {
  monsterHitQueue.add(MONSTER_HIT_JOB_NAME, payloadData);
};
