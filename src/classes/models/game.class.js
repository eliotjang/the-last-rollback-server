import { sessionTypes } from '../../constants/session.constants.js';
import PlayerInfo from '../../protobuf/classes/info/player-info.proto.js';
import { serialize } from '../../utils/packet-serializer.utils.js';

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

  addUser(user) {
    user.setSession(this.type, this.id);
    this.users.push(user);
  }

  removeUser(accountId) {
    this.users = this.users.filter((user) => {
      if (user.accountId === accountId) {
        user.removeSession();
        return false;
      }
      return true;
    });
  }

  getUser(accountId) {
    return this.users.find((user) => user.accountId === accountId);
  }

  getUserBySocket(socket) {
    return this.users.find((user) => user.socket === socket);
  }

  isFull() {
    return this.users.length >= this.maxUser;
  }

  getAllLocation(accountId) {
    const locationData = [];
    this.users.forEach((user) => {
      if (user.accountId === accountId) {
        locationData.push({
          playerId: user.accountId,
          TransformInfo: user.playerInfo.transform,
        });
      }
    });
    return locationData;
  }

  sendPacketToUser(accountId, packetType, data) {
    const user = this.users.find((user) => user.accountId === accountId);
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

  sendPacketToOthers(accountId, packetType, data) {
    this.users.forEach((user) => {
      if (user.accountId !== accountId) {
        const packet = serialize(packetType, data);
        user.socket.write(packet);
      }
    });
  }

  /**
   *
   * @param {*} accountId
   * @param {string} message
   * @param {uint32} payloadType
   * @param {Object} data
   */
  notifyOthers(accountId, message, payloadType, data) {
    this.users.forEach((user) => {
      if (user.accountId !== accountId) {
        user.socket.sendNotification(Date.now(), message, payloadType, data);
      }
    });
  }
}

export default Game;
