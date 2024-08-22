import User from '../classes/models/user.class.js';
import { matchDequeue } from '../match_queue/producers/match-queue.producer.js';
import { userSession, userSocketSession } from './sessions.js';

export const addUser = async (socket, accountId) => {
  let user = getUserById(accountId);
  if (user) {
    await removeUser(user.socket);
    user.socket.end('duplicated user');
  }
  user = new User(accountId, socket);
  userSession.set(accountId, user);
  userSocketSession.set(socket, user);
  return user;
};

export const removeUser = async (socket) => {
  const user = getUserBySocket(socket);
  if (user) {
    await matchDequeue(user.accountId);
    userSocketSession.delete(socket);
    userSession.delete(user.accountId);
    const gameSession = user.getSession();
    if (gameSession) {
      await user.removePlayerInfo();
      gameSession.removeUser(user.accountId);
    }

    return user;
  }
};

export const getUserById = (accountId) => {
  return userSession.get(accountId);
};

export const getUserBySocket = (socket) => {
  return userSocketSession.get(socket);
};
