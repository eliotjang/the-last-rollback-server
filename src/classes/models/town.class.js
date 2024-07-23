import { packetTypes } from '../../constants/packet.constants.js';
import Game from './game.class.js';

const MAX_USERS = 20;

class Town extends Game {
  constructor(id) {
    super(id, MAX_USERS);
  }

  addUser(user) {
    super.addUser(user);
  }

  removeUser(userId) {
    super.removeUser(userId);

    this.sendPacketToAll(packetTypes.S_DESPAWN, { payload: userId });
  }
}

export default Town;
