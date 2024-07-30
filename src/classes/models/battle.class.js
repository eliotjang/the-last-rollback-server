import Game from './game.class.js';
import { MAX_USERS } from '../../constants/game.constants.js';
import { sessionTypes } from '../../constants/session.constants.js';

class Battle extends Game {
  constructor(id) {
    super(id, MAX_USERS);
    this.type = sessionTypes.BATTLE;
  }

  addUser(user) {
    super.addUser(user);
  }
}

export default Battle;
