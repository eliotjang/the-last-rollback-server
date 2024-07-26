import { toCamelCase } from '../../utils/transform-case.utils.js';
import pools from '../database.js';
import { SQL_GAME_QUERIES } from './game-char.queries.js';

export const findGameCharByAccountID = async (accountId) => {
  const [rows] = await pools.GAME_CHAR_DB.query(SQL_GAME_QUERIES.FIND_GAME_CHAR_BY_ACCOUNT_ID, [
    accountId,
  ]);
  return toCamelCase(rows[0]);
};

export const createGameChar = async (nickname, charClass, accountId) => {
  await pools.GAME_CHAR_DB.query(SQL_GAME_QUERIES.CREATE_GAME_CHAR, [
    nickname,
    charClass,
    accountId,
  ]);
  const [rows] = await pools.GAME_CHAR_DB.query(SQL_GAME_QUERIES.FIND_GAME_CHAR_BY_ACCOUNT_ID, [
    accountId,
  ]);
  return toCamelCase(rows[0]);
};

export const updateLastPosition = async (x, y, accountId) => {
  await pools.GAME_CHAR_DB.query(SQL_GAME_QUERIES.UPDATE_LAST_POSITION, [x, y, accountId]);
};
