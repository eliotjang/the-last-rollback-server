import { v4 as uuidv4 } from 'uuid';
import pools from '../database.js';
import { SQL_QUERIES } from './user.queries.js';
import { toCamelCase } from '../../utils/transform-case.utils.js';

export const findUserByAccountID = async (accountId) => {
  const [rows] = await pools.USER_DB.query(SQL_QUERIES.FIND_USER_BY_ACCOUNT_ID, [accountId]);
  return toCamelCase(rows[0]);
};

export const createUser = async (accountId, accountPwd) => {
  const id = uuidv4();
  await pools.USER_DB.query(SQL_QUERIES.CREATE_USER, [id, accountId, accountPwd]);
  const [rows] = await pools.USER_DB.query(SQL_QUERIES.FIND_USER_BY_ACCOUNT_ID, [accountId]);
  return toCamelCase(rows[0]);
};

export const updateUserLogin = async (accountId) => {
  await pools.USER_DB.query(SQL_QUERIES.UPDATE_USER_LOGIN, [accountId]);
};

export const updateLastPosition = async (x, y, id) => {
  await pools.USER_DB.query(SQL_QUERIES.UPDATE_LAST_POSITION, [x, y, id]);
};
