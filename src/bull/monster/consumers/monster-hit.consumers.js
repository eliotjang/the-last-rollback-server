import Bull from 'bull';
import { MONSTER_HIT_JOB_NAME, MONSTER_HIT_QUEUE_NAME } from '../../../constants/constants.js';
import MonsterHitProcessor from '../processors/monster-hit.processor.js';

const monsterHitQueue = new Bull(MONSTER_HIT_QUEUE_NAME);

export const setMonsterHitQueue = () => {
  monsterHitQueue.process(MONSTER_HIT_JOB_NAME, MonsterHitProcessor);
};
