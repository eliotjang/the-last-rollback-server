import { sessionTypes } from '../../constants/session.constants.js';

class Game {
  constructor(id, maxUser) {
    if (new.target === Game) {
      throw new TypeError('Cannot construct Game instances');
    }

    this.id = id;
    this.type = sessionTypes.NULL;
    this.users = [];
    this.maxUser = maxUser;
  }
  // add to Session
  addUser(user) {
    user.setSession(this.type, this.id);
    this.users.push(user);
  }

  // remove from Session
  removeUser(accountId) {
    this.users = this.users.filter((user) => {
      if (user.accountId === accountId) {
        user.removeSession();
        return false;
      }
      return true;
    });
  }

  // get information from session
  getUser(accountId) {
    return this.users.find((user) => user.accountId === accountId);
  }

  getUserBySocket(socket) {
    return this.users.find((user) => user.socket === socket);
  }

  getAllLocation(accountId) {
    const locationData = [];
    this.users.forEach((user) => {
      if (user.accountId === accountId) {
        locationData.push({
          playerId: user.accountId,
          TransformInfo: user.getPlayerInfo().transform,
        });
      }
    });
    return locationData;
  }

  // socket.write() in session
  notifyUser(accountId, payloadType, data) {
    const user = this.users.find((user) => user.accountId === accountId);
    user.socket.sendNotification(Date.now(), payloadType, data);
  }

  notifyAll(payloadType, data) {
    this.users.forEach((user) => {
      user.socket.sendNotification(Date.now(), payloadType, data);
    });
  }

  /**
   *
   * @param {*} accountId
   * @param {string} message
   * @param {uint32} payloadType
   * @param {Object} data
   */
  notifyOthers(accountId, payloadType, data) {
    this.users.forEach((user) => {
      if (user.accountId !== accountId) {
        user.socket.sendNotification(Date.now(), payloadType, data);
      }
    });
  }

  // ...etc
  isFull() {
    return this.users.length >= this.maxUser;
  }
}

export default Game;
