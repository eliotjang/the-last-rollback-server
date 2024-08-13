const dungeonConstants = {
  general: {
    MAX_USERS: 1,
    DAY_DURATION: 16000,
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

export default dungeonConstants;
