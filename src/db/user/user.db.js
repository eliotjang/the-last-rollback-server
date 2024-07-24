import pools from '../database.js';
import { SQL_QUERIES } from './user.queries.js';
import { toCamelCase } from '../../utils/transform-case.utils.js';

export const findUserByAccountID = async (accountId) => {
  const [rows] = await pools.USER_DB.query(SQL_QUERIES.FIND_USER_BY_ACCOUNT_ID, [accountId]);
  return toCamelCase(rows[0]);
};

export const createUser = async (accountId, accountPwd) => {
  await pools.USER_DB.query(SQL_QUERIES.CREATE_USER, [accountId, accountPwd]);
  const [rows] = await pools.USER_DB.query(SQL_QUERIES.FIND_USER_BY_ACCOUNT_ID, [accountId]);
  return toCamelCase(rows[0]);
};

export const updateUserLogin = async (accountId) => {
  await pools.USER_DB.query(SQL_QUERIES.UPDATE_USER_LOGIN, [accountId]);
};

export const updateLastPosition = async (x, y, accountId) => {
  await pools.USER_DB.query(SQL_QUERIES.UPDATE_LAST_POSITION, [x, y, accountId]);
};

export const updateClass = async (accountClass, accountId) => {
  await pools.USER_DB.query(SQL_QUERIES.UPDATE_CLASS, [accountClass, accountId]);
};

export const updateNickname = async (nickname, accountId) => {
  await pools.USER_DB.query(SQL_QUERIES.UPDATE_NICKNAME, [nickname, accountId]);
};

export const updateLevel = async (level, accountId) => {
  await pools.USER_DB.query(SQL_QUERIES.UPDATE_LEVEL, [level, accountId]);
};

export const updateExp = async (exp, accountId) => {
  await pools.USER_DB.query(SQL_QUERIES.UPDATE_EXPERIENCE, [exp, accountId]);
};
