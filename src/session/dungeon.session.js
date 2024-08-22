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
  const session = user.getSession();
  if (session instanceof Dungeon) return session;
};

export const getDungeonSessionByUserSocket = (socket) => {
  const user = getUserBySocket(socket);
  const session = user.getSession();
  if (session instanceof Dungeon) return session;
};

export const getAllDungeonSessions = () => {
  return Array.from(dungeonSessions.values());
};
