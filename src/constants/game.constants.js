const dungeonConstants = {
  general: {
    MAX_USERS: 4,
    DAY_DURATION: 12000,
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

export default dungeonConstants;
