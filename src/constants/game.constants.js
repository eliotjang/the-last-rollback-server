const dungeonConstants = {
  general: {
    MAX_USERS: 4,
    DAY_DURATION: 20000,
  },
  phases: {
    STANDBY: 3,
    DAY: 5,
    DAY_STARTED: 6,
    NIGHT: 8,
    RESULT: 10,
    ENDING: 15,
  },
};

export const attackTypes = {
  NORMAL: 0,
  SKILL: 1,
  BALLISTA: 2,
  LASER: 3,
};

export const gameResults = {
  codes: {
    GAME_OVER: 1,
    GAME_WIN: 2,
  },
  bonusExp: {
    GAME_OVER: 10,
    GAME_WIN: 100,
  },
};

export const playerAnimTypes = {
  IDLE: -1,
  DIE: 1,
  ATTACK: {
    SWORD: 3,
    MAGIC: 0,
    SPEAR: 4,
    ARROW: 5,
    HAMMER: 6,
  },
  SKILL: 10,
  EMOTION: {
    HAPPY: 7,
    CRYING: 8,
    HI: 9,
  },
};

export const SKILL_USE_MP = 50;
export const REVIVE_GOLD = 4000;

export default dungeonConstants;
