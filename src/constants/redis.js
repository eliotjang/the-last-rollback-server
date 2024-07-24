export const userRedisFields = {
  NICKNAME: 'nickname',
  CLASS: 'class',
  TRANSFORM: 'transform',
};

export const gameRedisFields = {
  GOLD: 'user_gold',
  LEVEL: 'level',
  EXP: 'experience',
};

Object.freeze(userRedisFields);
Object.freeze(gameRedisFields);

const userRedisFieldsArray = Object.values(userRedisFields);
const gameRedisFieldsArray = Object.values(gameRedisFields);

export const isUserRedisField = (fieldName) => {
  return userRedisFieldsArray.includes(fieldName);
};

export const isGameRedisField = (fieldName) => {
  return gameRedisFieldsArray.includes(fieldName);
};
