import { MAX_USERS } from '../../constants/game.constants.js';
import { payloadTypes } from '../../constants/packet.constants.js';
import { sessionTypes } from '../../constants/session.constants.js';
import Game from './game.class.js';

// const MAX_USERS = 4;

class Dungeon extends Game {
  constructor(id) {
    super(id, MAX_USERS);
    this.type = sessionTypes.DUNGEON;
    this._isNight = false;
    this.readyStates = [];
  }

  addUser(user) {
    Promise.all(this.users.map((curUser) => curUser.getPlayerInfo())).then(() => {
      super.addUser(user);
    });
  }

  attackMonster(accountId, attackType, monsterIdx) {
    super.notifyOthers(accountId, payloadTypes.S_PLAYER_ATTACK, {
      playerId: accountId,
      attackType,
      monsterIdx,
    });
  }

  // attackedMonster(monsterIdx, monsterHp) {
  //   super.notifyAll(payloadTypes.S_MONSTER_ATTACKED, { monsterIdx, monsterHp });
  // }

  attackedMonster(accountId, monsterIdx, monsterHp) {
    super.notifyOthers(accountId, payloadTypes.S_MONSTER_ATTACKED, { monsterIdx, monsterHp });
  }

  attackPlayer(monsterIdx, accountId, playerHp) {
    super.notifyAll(payloadTypes.S_PLAYER_ATTACKED, { monsterIdx, playerId: accountId, playerHp });
  }

  movePlayer(accountId, transform) {
    console.log(
      'MOVE PLAYER:',
      this.users.map((user) => user.accountId),
    );
    super.notifyAll(payloadTypes.S_MOVE, { playerId: accountId, transform });
  }

  toggleReadyState(user) {
    if (isNight) return true;
    const idx = this.readyStates.findIndex((targetId) => targetId === user.accountId);
    if (idx !== -1) {
      this.readyStates.push(user.accountId);
      if (this.readyStates.length === MAX_USERS) {
        this.setNight();
        // TODO: 모든 유저에게 S_NightRoundStart 전송
        const data = {}; //
        super.notifyAll(payloadTypes.S_NIGHT_ROUND_START, data);
      }
      return true;
    } else {
      this.readyStates.splice(idx, 1);
      return false;
    }
  }

  getReadyCount() {
    return this.readyStates.length;
  }

  endNightRound() {
    if (!isNight) return;
    this.setDay();
    const dungeonInfo = []; // 다음 라운드 몬스터 목록 받아오기
    const roundResults = []; // 각 유저의 라운드 통계 받아오기
    const data = {
      dungeonInfo,
      roundResults,
    };
    super.notifyAll(payloadTypes.S_NIGHT_ROUND_END, data);
  }

  setDay() {
    this._isNight = false;
  }

  setNight() {
    this._isNight = true;
  }
}

export default Dungeon;
