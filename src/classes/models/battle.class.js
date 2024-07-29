import Game from './game.class.js';
import { MAX_USERS } from '../../constants/game.constants.js';

class Battle extends Game {
  constructor(id) {
    super(id, MAX_USERS);
  }
}

export default Battle;
