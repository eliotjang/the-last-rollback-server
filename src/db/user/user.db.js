import { v4 as uuidv4 } from 'uuid';
import pools from '../database.js';
import { SQL_QUERIES } from './user.queries.js';
import { toCamelCase } from '../../utils/transformCase.js';

export const findUserByDeviceID = async (deviceId) => {
  const [rows] = await pools.USER_DB.query(SQL_QUERIES.FIND_USER_BY_DEVICE_ID, [deviceId]);
  return toCamelCase(rows[0]);
};

export const createUser = async (deviceId) => {
  const id = uuidv4();
  const playerId = Math.floor(Math.random() * 4);
  await pools.USER_DB.query(SQL_QUERIES.CREATE_USER, [id, deviceId, playerId]);
  const [rows] = await pools.USER_DB.query(SQL_QUERIES.FIND_USER_BY_DEVICE_ID, [deviceId]);
  return toCamelCase(rows[0]);
};

export const updateUserLogin = async (id) => {
  await pools.USER_DB.query(SQL_QUERIES.UPDATE_USER_LOGIN, [id]);
};

export const updateLastPosition = async (x, y, id) => {
  await pools.USER_DB.query(SQL_QUERIES.UPDATE_LAST_POSITION, [x, y, id]);
};
