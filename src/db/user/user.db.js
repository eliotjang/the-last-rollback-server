import pools from '../database.js';
import { SQL_QUERIES } from './user.queries.js';
import { toCamelCase } from '../../utils/transform-case.utils.js';

export const findUserByID = async (userId) => {
  const [rows] = await pools.USER_DB.query(SQL_QUERIES.FIND_USER_BY_ID, [userId]);
  return toCamelCase(rows[0]);
};

export const createUser = async (userId, nickname, characterClass, posX, posY) => {
  await pools.USER_DB.query(SQL_QUERIES.CREATE_USER, [
    userId,
    nickname,
    characterClass,
    posX,
    posY,
  ]);
};

export const updateUserLogin = async (id) => {
  await pools.USER_DB.query(SQL_QUERIES.UPDATE_USER_LOGIN, [id]);
};

export const updateLastPosition = async (x, y, id) => {
  await pools.USER_DB.query(SQL_QUERIES.UPDATE_LAST_POSITION, [x, y, id]);
};
