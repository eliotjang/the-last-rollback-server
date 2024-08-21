import { v4 as uuidv4 } from 'uuid';
import Dungeon from '../classes/sessions/dungeon.class.js';
import { dungeonSessions } from './sessions.js';

export const addDungeonSession = (dungeonCode) => {
  const id = uuidv4();
  const session = new Dungeon(id, dungeonCode);
  dungeonSessions.push(session);
  return session;
};

export const removeDungeonSession = (id) => {
  const index = dungeonSessions.findIndex((session) => session.id === id);
  if (index !== -1) {
    return dungeonSessions.splice(index, 1)[0];
  }
};

export const getDungeonSession = (id) => {
  return dungeonSessions.find((session) => session.id === id);
};

export const getDungeonSessionByUserId = (accountId) => {
  return dungeonSessions.find((session) => session.getUser(accountId));
};

export const getDungeonSessionByUserSocket = (socket) => {
  return dungeonSessions.find((session) => session.getUserBySocket(socket));
};

export const getAllDungeonSessions = () => {
  return dungeonSessions;
};
