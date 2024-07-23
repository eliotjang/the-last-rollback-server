import PlayerInfo from '../../protobuf/classes/info/player-info.proto.js';

class User {
  constructor(id, socket) {
    this.id = id;
    this.socket = socket;
    this.PlayerInfo = PlayerInfo;
  }

  updatePosition(transformInfo) {
    this.PlayerInfo.transform = transformInfo;
  }
}

export default User;
