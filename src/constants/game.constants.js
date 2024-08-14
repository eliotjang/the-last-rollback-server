const dungeonConstants = {
  general: {
    MAX_USERS: 1,
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
    GAMEOVER: 1,
    GAMEWIN: 2,
  },
  bonusExp: {
    GAMEOVER: 10,
    GAMEWIN: 100,
  },
};

export default dungeonConstants;
