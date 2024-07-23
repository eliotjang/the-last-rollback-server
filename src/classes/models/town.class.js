import { packetTypes } from '../../constants/packet.constants.js';
import Game from './game.class.js';

const MAX_USERS = 20;

class Town extends Game {
  constructor(id) {
    super(id, MAX_USERS);
  }

  addUser(user) {
    super.addUser(user);

    const allPlayerInfo = this.users.reduce((data, curUser) => {
      data.push(curUser.playerInfo);
      return data;
    }, []);

    this.users.forEach((curUser) => {
      const data = allPlayerInfo.filter(
        (playerInfo) => playerInfo.playerId !== curUser.playerInfo.playerId,
      );
      this.sendPacketToUser(curUser.playerInfo.playerId, packetTypes.S_SPAWN, { payload: data });
    });
  }

  removeUser(userId) {
    super.removeUser(userId);

    this.sendPacketToAll(packetTypes.S_DESPAWN, { payload: userId });
  }
}

export default Town;
