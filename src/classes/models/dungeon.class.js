import { MAX_USERS } from '../../constants/game.constants.js';
import { payloadTypes } from '../../constants/packet.constants.js';
import { sessionTypes } from '../../constants/session.constants.js';
import { dungeonRedis } from '../../utils/redis/dungeon.redis.js';
import Game from './game.class.js';
import { userDB } from '../../db/user/user.db.js';
import { SuccessCode } from '../../utils/error/errorCodes.js';
import { getUserById } from '../../session/user.session.js';

// const MAX_USERS = 4;

class Dungeon extends Game {
  constructor(id) {
    super(id, MAX_USERS);
    this.type = sessionTypes.DUNGEON;

    this.accountExpMap = {};
    this._isNight = false;
    this.readyStates = [];
    this.dungeonInfo = null;
  }

  addUser(user) {
    super.addUser(user);
  }

  addDungeonInfo(dungeonInfo) {
    this.dungeonInfo = { ...dungeonInfo };
  }

  updateBaseHp(amount) {
    this.dungeonInfo.baseHp -= amount;
    super.notifyAll(payloadTypes.S_BASE, this.dungeonInfo.baseHp);
  }

  updateRoundResult(accountId, gameExp) {
    // stage가 끝날 때마다 호출
    if (arguments.length === 0) {
      return Object.fromEntries(
        Object.entries(this.accountExpMap).map(([id, exp]) => [id, parseInt(id) + exp]),
      );
    }

    if (!this.accountExpMap[accountId]) {
      this.accountExpMap[accountId] = 0;
    }

    this.accountExpMap[accountId] += gameExp;
  }

  async updateGameOver(townSession) {
    // 죽은 라운드의 경험치는 포함안됨
    const playersExp = this.updateRoundResult(); // updatePlayerExp로 변경

    for (const [accountId, totalExp] of Object.entries(playersExp)) {
      const player = await userDB.updateExp(accountId, totalExp, true);
      const playerLevel = player.player_level;

      this.users.forEach((user) => {
        if (user.accountId === accountId) {
          user.socket.sendResponse(
            SuccessCode.Success,
            '게임에서 패배하였습니다.',
            payloadTypes.S_GAME_END,
            { result: 0, playerId: accountId, accountLevel: playerLevel, accountEXP: totalExp },
          );
        }
      });

      this.removeUser(accountId);
      const user = getUserById(accountId);
      townSession.addUser(user);
    }
  }

  async updateGameWin(townSession) {
    const playersExp = this.updateRoundResult();

    for (const [accountId, totalExp] of Object.entries(playersExp)) {
      const wineExp = totalExp + 100; // 승리 시 정산에서 얻은 경험치에서 100 추가
      const player = await userDB.updateExp(accountId, wineExp, true);
      const playerLevel = player.player_level;

      this.users.forEach((user) => {
        if (user.accountId === accountId) {
          user.socket.sendResponse(
            SuccessCode.Success,
            '게임에서 승리하였습니다.',
            payloadTypes.S_GAME_END,
            { result: 1, playerId: accountId, accountLevel: playerLevel, accountEXP: wineExp },
          );
        }
      });

      this.removeUser(accountId);
      const user = getUserById(accountId);
      townSession.addUser(user);
    }
  }

  removeUser(accountId) {
    super.removeUser(accountId);

    super.notifyAll(payloadTypes.S_LEAVE_DUNGEON);
  }

  async movePlayer(accountId, transform) {
    // await dungeonRedis.updatePlayerTransform(transform, accountId);

    super.notifyAll(payloadTypes.S_MOVE, { playerId: accountId, transform });
  }

  moveMonster(accountId, payloadType, payload) {
    super.notifyOthers(accountId, payloadType, payload);
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
