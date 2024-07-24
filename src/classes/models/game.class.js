import { serialize } from '../../utils/packet-serializer.utils.js';

class Game {
  constructor(id, maxUser) {
    if (new.target === Game) {
      throw new TypeError('Cannot construct Game instances');
    }

    this.id = id;
    this.users = [];
    this.maxUser = maxUser;
  }

  addUser(user) {
    user.sessionId = this.id;
    this.users.push(user);
  }

  removeUser(userId) {
    this.users = this.users.filter((user) => user.playerInfo.playerId !== userId);
  }

  getUser(userId) {
    return this.users.find((user) => user.playerInfo.playerId === userId);
  }

  getUserBySocket(socket) {
    return this.users.find((user) => user.socket === socket);
  }

  isFull() {
    return this.users.length >= this.maxUser;
  }

  getAllLocation() {}

  sendPacketToUser(userId, packetType, data) {
    const user = this.users.find((user) => user.playerInfo.playerId === userId);
    if (user) {
      const packet = serialize(packetType, data);
      user.socket.write(packet);
    }
  }

  sendPacketToAll(packetType, data) {
    this.users.forEach((user) => {
      const packet = serialize(packetType, data);
      user.socket.write(packet);
    });
  }

  sendPacketToOthers(userId, packetType, data) {
    this.users.forEach((user) => {
      if (user.playerInfo.playerId !== userId) {
        const packet = serialize(packetType, data);
        user.socket.write(packet);
      }
    });
  }

  /**
   *
   * @param {*} userId
   * @param {string} message
   * @param {uint32} payloadType
   * @param {Object} data
   */
  notifyOthers(userId, message, payloadType, data) {
    this.users.forEach((user) => {
      if (user.playerInfo.playerId !== userId) {
        user.socket.sendNotification(Date.now(), message, payloadType, data);
      }
    });
  }
}

export default Game;
