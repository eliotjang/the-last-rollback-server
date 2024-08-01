import { payloadTypes } from '../../constants/packet.constants.js';
import { sessionTypes } from '../../constants/session.constants.js';
import Game from './game.class.js';

const MAX_USERS = 4;

class Dungeon extends Game {
  constructor(id) {
    super(id, MAX_USERS);
    this.type = sessionTypes.DUNGEON;
  }

  addUser(user) {
    Promise.all(this.users.map((curUser) => curUser.getPlayerInfo())).then(() => {
      super.addUser(user);
    });
  }

  movePlayer(accountId, transform) {
    // await townRedis.updatePlayerTransform(transform, accountId);

    super.notifyAll(payloadTypes.S_MOVE, { playerId: accountId, transform });
  }
}

export default Dungeon;
