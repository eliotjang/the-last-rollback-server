import { v4 as uuidv4 } from 'uuid';
import Battle from '../classes/models/battle.class.js';
import { battleSessions } from './sessions.js';

export const addBattleSession = () => {
  const id = uuidv4();
  const session = new Battle(id);
  battleSessions.push(session);
  return session;
};

export const removeBattleSession = (id) => {
  const index = battleSessions.findIndex((session) => session.id === id);
  if (index !== -1) {
    return battleSessions.splice(index, 1)[0];
  }
};

export const getBattleSession = (id) => {
  return battleSessions.find((session) => session.id === id);
};

export const getBattleSessionByUserSocket = (socket) => {
  return battleSessions.find((session) => session.getUserBySocket(socket));
};

export const getAllBattleSessions = () => {
  return battleSessions;
};
