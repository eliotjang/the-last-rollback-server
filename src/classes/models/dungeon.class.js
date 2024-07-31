import { sessionTypes } from '../../constants/session.constants.js';
import Game from './game.class.js';

const MAX_USERS = 4;

class Dungeon extends Game {
  constructor(id) {
    super(id, MAX_USERS);
    this.type = sessionTypes.DUNGEON;
  }
}

export default Dungeon;
