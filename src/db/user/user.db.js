import pools from '../database.js';
import { SQL_USER_QUERIES } from './user.queries.js';
import { toCamelCase } from '../../utils/transform-case.utils.js';

export const findUserByAccountID = async (accountId) => {
  const [rows] = await pools.USER_DB.query(SQL_USER_QUERIES.FIND_USER_BY_ACCOUNT_ID, [accountId]);
  return toCamelCase(rows[0]);
};

export const createUser = async (accountId, accountPwd) => {
  await pools.USER_DB.query(SQL_USER_QUERIES.CREATE_USER, [accountId, accountPwd]);
  const [rows] = await pools.USER_DB.query(SQL_USER_QUERIES.FIND_USER_BY_ACCOUNT_ID, [accountId]);
  return toCamelCase(rows[0]);
};

export const updateUserLogin = async (accountId) => {
  await pools.USER_DB.query(SQL_USER_QUERIES.UPDATE_USER_LOGIN, [accountId]);
};

export const updateUserLevel = async (level, accountId) => {
  await pools.USER_DB.query(SQL_USER_QUERIES.UPDATE_USER_LEVEL, [level, accountId]);
};

export const updateUserExp = async (experience, accountId) => {
  await pools.USER_DB.query(SQL_USER_QUERIES.UPDATE_USER_EXPERIENCE, [experience, accountId]);
};
