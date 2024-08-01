import { sessionTypes } from '../../constants/session.constants.js';
import Game from './game.class.js';
import { userDB } from '../../db/user/user.db.js';
import { SuccessCode } from '../../utils/error/errorCodes.js';
import { payloadTypes } from '../../constants/packet.constants.js';
import { getUserById } from '../../session/user.session.js';

const MAX_USERS = 4;

class Dungeon extends Game {
  constructor(id) {
    super(id, MAX_USERS);
    this.type = sessionTypes.DUNGEON;

    this.accountExpMap = {};
  }

  addUser(user) {
    Promise.all(this.users.map((curUser) => curUser.getPlayerInfo())).then(() => {
      super.addUser(user);
    });
  }

  updateBaseHp(data) {
    super.notifyAll(payloadTypes.S_BASE, data);
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
    const playersExp = this.updateRoundResult();

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
      const wineExp = totalExp + 100; // 임의로 승리 시 경험치 100 추가
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

    super.notifyAll(payloadTypes.S_LEAVE_DUNGEON, {});
  }

  movePlayer(accountId, transform) {
    // await townRedis.updatePlayerTransform(transform, accountId);

    super.notifyAll(payloadTypes.S_MOVE, { playerId: accountId, transform });
  }
}

export default Dungeon;
