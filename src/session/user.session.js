import User from '../classes/models/user.class.js';
import { userSession } from './sessions.js';

export const userSocket = {
  addUser: function (socket, accountId) {
    let user = getUserById(accountId);
    if (user) {
      user.socket = socket;
    } else {
      user = new User(accountId, socket);
    }
    userSession.push(user);
    return user;
  },

  removeUser: function (socket) {
    const index = userSession.findIndex((user) => user.socket === socket);
    if (index !== -1) {
      const user = userSession.splice(index, 1)[0];
      const gameSession = user.getSession();
      if (gameSession) {
        gameSession.removeUser(user.accountId);
      }

      return user;
    }
  },

  getOthersSocket: function (accountId) {
    const result = userSession.forEach((user) => {
      if (user.accountId !== accountId) {
        return user.socket;
      }
    });
    return result;
  },

  getUserById: function (accountId) {
    return userSession.find((user) => user.accountId === accountId);
  },

  getUserBySocket: function (socket) {
    return userSession.find((user) => user.socket === socket);
  },
};

export const addUser = (socket, accountId) => {
  let user = getUserById(accountId);
  if (user) {
    removeUser(user.socket);
  }
  user = new User(accountId, socket);
  userSession.push(user);
  return user;
};

export const removeUser = (socket) => {
  const index = userSession.findIndex((user) => user.socket === socket);
  if (index !== -1) {
    const user = userSession.splice(index, 1)[0];
    const gameSession = user.getSession();
    if (gameSession) {
      user.removePlayerInfo();
      gameSession.removeUser(user.accountId);
    }

    return user;
  }
};

export const getUserById = (accountId) => {
  return userSession.find((user) => user.accountId === accountId);
};

export const getUserBySocket = (socket) => {
  return userSession.find((user) => user.socket === socket);
};
