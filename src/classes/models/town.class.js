import { payloadTypes } from '../../constants/packet.constants.js';
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
      this.sendPacketToUser(curUser.playerInfo.playerId, payloadTypes.S_SPAWN, { players: data });
    });
    console.log('town', this.users);
  }

  removeUser(userId) {
    super.removeUser(userId);

    this.sendPacketToAll(payloadTypes.S_DESPAWN, { playerIds: userId });
  }
}

export default Town;
