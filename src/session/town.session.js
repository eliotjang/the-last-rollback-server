import { v4 as uuidv4 } from 'uuid';
import { townSessions } from './sessions.js';
import Town from '../classes/sessions/town.class.js';

export const addTownSession = () => {
  const id = uuidv4();
  const session = new Town(id);
  townSessions.set(id, session);
  return session;
};

export const removeTownSession = (id) => {
  const session = townSessions.get(id);
  if (session) {
    townSessions.delete(id);
    return session;
  }
};

export const getTownSession = (id) => {
  return townSessions.get(id);
};

export const getTownSessionByUserId = (accountId) => {
  const user = getUserById(accountId);
  return user.getSession();
};

export const getTownSessionByUserSocket = (socket) => {
  const user = getUserBySocket(socket);
  return user.getSession();
};

export const getAllTownSessions = () => {
  return Array.from(townSessions.values());
};
