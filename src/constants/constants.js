import { payloadTypes } from './packet.constants.js';

// ------- PING CONSTANTS -----
export const PING_INTERVAL = 10000;
export const PING_INTERVAL_TYPE = 'ping';

// ------- LOGGER CONSTANTS (temp) -----
export const loggerConstants = {
  VERBOSE: false,
  LOGGING: true,
};

const loggerBlackList = [
  payloadTypes.S_MOVE,
  payloadTypes.S_MONSTER_MOVE,
  payloadTypes.S_ANIMATION_MONSTER,
  payloadTypes.S_TOWER_ATTACKED,
  payloadTypes.S_ANIMATION_PLAYER,
  payloadTypes.S_MONSTERS_TRANSFORM_UPDATE,
];
const loggerBlackListSet = new Set(loggerBlackList);
export const isBlackListed = (payloadType) => loggerBlackListSet.has(payloadType);

// ------- MONSTER KILL ---------
export const MONSTER_HIT_QUEUE_NAME = 'monster-hit-queue';
export const MONSTER_HIT_JOB_NAME = 'monster-hit-job';

// ------- ENTER TOWN ---------
export const ENTER_TOWN_QUEUE_NAME = 'enter-town-queue';
export const ENTER_TOWN_JOB_NAME = 'enter-town-job';
