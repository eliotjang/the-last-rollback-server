import { payloadTypes } from '../../constants/packet.constants.js';
import { sessionTypes } from '../../constants/session.constants.js';
import { dungeonRedis } from '../../utils/redis/dungeon.redis.js';
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

  removeUser(accountId) {
    super.removeUser(accountId);

    super.notifyAll(payloadTypes.S_DESPAWN, { playerIds: [accountId] });
  }

  async movePlayer(accountId, transform) {
    await dungeonRedis.updatePlayerTransform(transform, accountId);

    super.notifyAll(payloadTypes.S_MOVE, { playerId: accountId, transform });
  }

  moveMonster(accountId, payloadType, payload) {
    super.notifyOthers(accountId, payloadType, payload);
  }
}

export default Dungeon;
