import { payloadTypes } from './packet.constants.js';

// ------- PING CONSTANTS -----
export const PING_INTERVAL = 10000;
export const PING_INTERVAL_TYPE = 'ping';

// ------- LOGGER CONSTANTS (temp) -----
const loggerBlackList = [
  payloadTypes.S_MOVE,
  payloadTypes.S_MONSTER_MOVE,
  payloadTypes.S_ANIMATION_MONSTER,
  payloadTypes.S_TOWER_ATTACKED,
  payloadTypes.S_ANIMATION_PLAYER,
];
const loggerBlackListSet = new Set(loggerBlackList);
export const isBlackListed = (payloadType) => loggerBlackListSet.has(payloadType);

// ------- MONSTER KILL ---------
export const MONSTER_HIT_QUEUE_NAME = 'monster-hit-queue';
export const MONSTER_HIT_JOB_NAME = 'monster-hit-job';

// ------- ENTER TOWN ---------
export const ENTER_TOWN_QUEUE_NAME = 'enter-town-queue';
export const ENTER_TOWN_JOB_NAME = 'enter-town-job';

// ------- MATCH QUEUE ---------
export const MATCH_QUEUE_NAME = 'match-queue';
export const MATCH_ENQUEUE_JOB_NAME = 'match-enqueue';
export const MATCH_DEQUEUE_JOB_NAME = 'match-dequeue';
export const MATCH_QUEUE_RETRIEVAL = 'check-queue';
