import { v4 as uuidv4 } from 'uuid';
import Dungeon from '../classes/sessions/dungeon.class.js';
import { dungeonSessions } from './sessions.js';
import { getUserById, getUserBySocket } from './user.session.js';

export const addDungeonSession = (dungeonCode) => {
  const id = uuidv4();
  const session = new Dungeon(id, dungeonCode);
  dungeonSessions.set(id, session);
  return session;
};

export const removeDungeonSession = (id) => {
  const session = dungeonSessions.get(id);
  if (session) {
    dungeonSessions.delete(id);
    return session;
  }
};

export const getDungeonSession = (id) => {
  return dungeonSessions.get(id);
};

export const getDungeonSessionByUserId = (accountId) => {
  const user = getUserById(accountId);
  return user.getSession();
};

export const getDungeonSessionByUserSocket = (socket) => {
  const user = getUserBySocket(socket);
  return user.getSession();
};

export const getAllDungeonSessions = () => {
  return Array.from(dungeonSessions.values());
};
