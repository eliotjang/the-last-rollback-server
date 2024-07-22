import Game from './game.class.js';

const MAX_USERS = 4;

class Battle extends Game {
  constructor(id) {
    super(id, MAX_USERS);
  }
}

export default Battle;
