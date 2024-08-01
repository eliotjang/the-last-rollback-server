import { v4 as uuidv4 } from 'uuid';
import Town from '../classes/models/town.class.js';
import { townSessions } from './sessions.js';

export const addTownSession = () => {
  const id = uuidv4();
  const session = new Town(id);
  townSessions.push(session);
  return session;
};

export const removeTownSession = (id) => {
  const index = townSessions.findIndex((session) => session.id === id);
  if (index !== -1) {
    return townSessions.splice(index, 1)[0];
  }
};

export const getTownSession = (id) => {
  return townSessions.find((session) => session.id === id);
};

export const getTownSessionByUserId = (accountId) => {
  return townSessions.find((session) => session.getUser(accountId));
};

export const getTownSessionByUserSocket = (socket) => {
  return townSessions.find((session) => session.getUserBySocket(socket));
};

export const getAllTownSessions = () => {
  return townSessions;
};
