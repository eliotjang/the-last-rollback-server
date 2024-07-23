import PlayerInfo from '../../protobuf/classes/info/player-info.proto.js';
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

  getAllLocation(userId) {
    const locationData = this.users.map((user) => {
      if (user.id !== userId) {
        return { id: user.id, TransformInfo: user.PlayerInfo.transformInfo };
      }
    });
    return locationData;
  }

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
}

export default Game;
