import { payloadTypes } from '../../constants/packet.constants.js';
import { sessionTypes } from '../../constants/game.constants.js';

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

  // socket.write() in session
  notifyUser(accountId, payloadType, data) {
    const user = this.users.find((user) => user.accountId === accountId);
    user.socket.sendNotification(payloadType, data);
  }

  notifyAll(payloadType, data) {
    this.users.forEach((user) => {
      user.socket.sendNotification(payloadType, data);
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
        user.socket.sendNotification(payloadType, data);
      }
    });
  }

  // ...etc
  isFull() {
    return this.users.length >= this.maxUser;
  }

  movePlayer(accountId, transform) {
    throw new Error('Method not implemented.');
  }

  // #region 채팅

  chatPlayer(accountId, chatMsg) {
    this.notifyAll(payloadTypes.S_CHAT, { playerId: accountId, chatMsg });
  }

  systemChat(accountId, chatMsg) {
    this.notifyUser(accountId, payloadTypes.S_CHAT, {
      playerId: accountId,
      chatMsg,
      system: true,
    });
  }

  systemChatAll(accountId, chatMsg) {
    this.notifyAll(payloadTypes.S_CHAT, { playerId: accountId, chatMsg, system: true });
  }

  systemChatOthers(accountId, chatMsg) {
    this.notifyOthers(accountId, payloadTypes.S_CHAT, {
      playerId: accountId,
      chatMsg,
      system: true,
    });
  }

  // #endregion
}

export default Game;
